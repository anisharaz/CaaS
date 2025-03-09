package actions

import (
	"aarazcaas/orchistrator/cli/database"
	"aarazcaas/orchistrator/cli/database/models"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm/clause"
)

type ackMessage struct {
	ack     *amqp.Delivery
	success bool
}

type stateOfTasksIn_action_create struct {
	create_authorized_keys bool
	create_container       bool
	container_ip           string
	create_ssh_tunnel      bool
	ssh_tunnel_pid         int16
}

func DockerActionsSubscriber(conn *amqp.Connection) {
	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()
	defer conn.Close()

	q, err := ch.QueueDeclare(
		"docker_actions", // name
		true,             // durable
		false,            // delete when unused
		false,            // exclusive
		false,            // no-wait
		nil,              // arguments
	)
	failOnError(err, "Failed to declare a queue")

	err = ch.Qos(
		3,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	failOnError(err, "Failed to set QoS")

	works, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)

	failOnError(err, "Failed to register a consumer")

	acks := make(chan *ackMessage)

	notifyConnClosed := make(chan *amqp.Error)
	conn.NotifyClose(notifyConnClosed)

	notifyChannelClosed := make(chan *amqp.Error)
	ch.NotifyClose(notifyChannelClosed)

	go func() {
		for {
			select {
			case work := <-works:
				go dockerActionsWorker(acks, &work)
			case ackMessage := <-acks:
				// The false in the Ack() function states that it should only acknowledge this single message
				// If true it will ack all message if they are not processed
				if ackMessage.success {
					ackError := ackMessage.ack.Ack(false)
					if ackError != nil {
						log.Fatalf("Ack error: %v", ackError)
					}
				} else {
					ackError := ackMessage.ack.Reject(true)
					if ackError != nil {
						log.Fatalf("Ack error: %v", ackError)
					}
				}

			}
		}
	}()

	log.Printf("LISTENING-- docker actions")

	select {
	case connError := <-notifyConnClosed:
		log.Fatalf("saw connection closure error: %v", connError)
	case channelError := <-notifyChannelClosed:
		log.Fatalf("saw channel closure error: %v", channelError)
	}
}

func dockerActionsWorker(acks chan<- *ackMessage, work *amqp.Delivery) {
	var workData map[string]any
	err := json.Unmarshal(work.Body, &workData)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	db := database.GetDB()
	switch workData["action"] {
	case "create":
		var container_schedule_data = models.Containers_scheduled{
			ID: workData["container_schedule_id"].(string),
		}
		db.Find(&container_schedule_data)
		var ssh_keys = models.Ssh_keys{
			ID: container_schedule_data.Ssh_keysId,
		}
		db.Find(&ssh_keys)
		var dockerHostNode = models.Nodes{
			ID: container_schedule_data.NodeId,
		}
		db.Find(&dockerHostNode)
		total_task_success := false
		tx := db.Begin()
		available_ssh_proxy_port := models.Available_ssh_proxy_ports{Used: false}
		tx.Clauses(clause.Locking{Strength: "UPDATE", Options: "SKIP LOCKED"}).First(&available_ssh_proxy_port)

		state := &stateOfTasksIn_action_create{
			create_authorized_keys: false,
			create_container:       false,
			create_ssh_tunnel:      false,
		}
		// one time loop, because we can prevent
		// other task from proceeding if one of
		// the task fails using break; statement
		for range 1 {
			// Pre-flight
			sql, _ := db.DB()
			if err := sql.Ping(); err != nil {
				fmt.Println("Error:", err)
				time.Sleep(time.Second * 2)
				break
			}

			// TASK 1: create_authorized_keys
			for range 2 {
				okCreateAuthorizedKeys, _ := createAuthorizedKeys(&map[string]any{
					"userData_id":    container_schedule_data.UserDataId,
					"ssh_public_key": ssh_keys.PublicKey,
					"container_name": container_schedule_data.Container_name,
					"dockerHostName": dockerHostNode.Node_name,
				})
				if okCreateAuthorizedKeys {
					state.create_authorized_keys = true
					break
				}
			}
			if !state.create_authorized_keys {
				break
			}

			// TASK 2: create_container
			var containerIp string
			for range 2 {
				okCreateContainer, containerIp, _ := createContainer(&map[string]any{
					"container_name": container_schedule_data.Container_name,
					"image":          container_schedule_data.Image,
					"tag":            container_schedule_data.Tag,
					"network":        container_schedule_data.Network,
					"storage":        container_schedule_data.Storage,
					"userData_id":    container_schedule_data.UserDataId,
				})
				if okCreateContainer {
					state.create_container = true
					state.container_ip = containerIp
					break
				}
			}
			if !state.create_container {
				compensate_CreateAuthorizedKeys()
				break
			}

			// TASK 3: create_ssh_tunnel
			for range 2 {
				okCreateSSHTunnel, tunnelPid, _ := createSSHTunnel(&map[string]any{
					"ssh_proxy_port": available_ssh_proxy_port.Ssh_proxy_port,
					"container_ip":   containerIp,
					"node_name":      available_ssh_proxy_port.Ssh_proxy_node_name,
					"ssh_tunnel_pid": 0,
					"dockerHostName": state.container_ip,
				})
				if okCreateSSHTunnel {
					state.create_ssh_tunnel = true
					state.ssh_tunnel_pid = tunnelPid
					break
				}
			}
			if !state.create_ssh_tunnel {
				compensate_CreateContainer()
				break
			}

			// TASK 4: update database
			available_ssh_proxy_port.Used = true
			tx.Save(&available_ssh_proxy_port)

			ssh_config := models.Ssh_config{
				Ssh_proxy_node_name:         available_ssh_proxy_port.Ssh_proxy_node_name,
				Ssh_proxy_port:              uint32(available_ssh_proxy_port.Ssh_proxy_port),
				Ssh_tunnel_process_id:       uint32(state.ssh_tunnel_pid),
				UserDataId:                  container_schedule_data.UserDataId,
				Available_ssh_proxy_portsId: available_ssh_proxy_port.ID,
			}
			tx.Create(&ssh_config)

			container := models.Containers{
				Name:             uuid.NewString(),
				NodeId:           container_schedule_data.NodeId,
				Image:            container_schedule_data.Image,
				Tag:              container_schedule_data.Tag,
				State:            "STARTED",
				VpcId:            container_schedule_data.Network, // network name is the id of vpc table
				Ip_address:       state.container_ip,
				UserDataId:       container_schedule_data.UserDataId,
				Ssh_config_id:    ssh_config.ID,
				Ssh_keysId:       ssh_keys.ID,
				Provision_status: "SUCCESS",
			}
			tx.Create(&container)

			if tx.Commit().Error != nil {
				// ! solution to this issue is needed
				// * The known problem here is that, the tx commit is failed but
				// * the ssh tunnel is created and while the tunnel is being deleted
				// * by the compensate_CreateSSHTunnel() function, same ssh tunnel is
				// * available in the db and can be used by another process, but
				// * it may not cause a problem because another process starts its
				// * new task from the beginning and until another process reaches the
				// * tunnel creation step, the compensate_CreateSSHTunnel() function
				// * would have finished deleting the old tunnel which would prevent the conflict.
				compensate_CreateSSHTunnel()
				break
			}

			// if code can reach till here means all
			// task completed, so we can directly set
			// total_task_success to true
			total_task_success = true
		}

		if total_task_success {
			acks <- &ackMessage{ack: work, success: true}
		} else {
			acks <- &ackMessage{ack: work, success: false}
		}

	case "delete":
	default:
		fmt.Println("Unknown action")
	}

}

func createAuthorizedKeys(data *map[string]any) (bool, error) {
	dataBytes, _ := json.Marshal(data)
	req, err := http.NewRequest(http.MethodPost, InfraBeUrl+"/authorized_keys", bytes.NewReader(dataBytes))
	if err != nil {
		return false, err
	}
	req.Header.Set("content-type", "application/json")
	res, err := HttpMainClient.Do(req)
	if err != nil {
		return false, err
	}
	if res.StatusCode != 200 {
		return false, errors.New("failed")
	}
	return true, nil
}

func createContainer(data *map[string]any) (bool, string, error) {
	dataBytes, _ := json.Marshal(data)
	req, err := http.NewRequest(http.MethodPost, InfraBeUrl+"/container", bytes.NewReader(dataBytes))
	if err != nil {
		return false, "", err
	}
	req.Header.Set("content-type", "application/json")
	res, err := HttpMainClient.Do(req)
	if err != nil {
		return false, "", err
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return false, "", errors.New("failed")
	}
	body, _ := io.ReadAll(res.Body)
	var bodyJson struct {
		Return_code  int8   `json:"return_code"`
		Container_ip string `json:"container_ip"`
	}
	err = json.Unmarshal(body, &bodyJson)
	if err != nil {
		return false, "", err
	}
	return true, bodyJson.Container_ip, nil
}

func createSSHTunnel(data *map[string]any) (bool, int16, error) {
	dataBytes, _ := json.Marshal(data)
	req, err := http.NewRequest(http.MethodPost, InfraBeUrl+"/sshtunnel", bytes.NewReader(dataBytes))
	if err != nil {
		return false, 0, err
	}
	req.Header.Set("content-type", "application/json")
	res, err := HttpMainClient.Do(req)
	if err != nil {
		return false, 0, err
	}
	defer res.Body.Close()
	if res.StatusCode != 200 {
		return false, 0, errors.New("failed")
	}
	body, _ := io.ReadAll(res.Body)
	var bodyJson struct {
		Return_code    int8  `json:"return_code"`
		Ssh_tunnel_pid int32 `json:"ssh_tunnel_pid"`
	}
	err = json.Unmarshal(body, &bodyJson)
	if err != nil {
		return false, 0, err
	}
	return true, int16(bodyJson.Ssh_tunnel_pid), nil
}

func compensate_CreateAuthorizedKeys() {
	// TODO: implement this function
	fmt.Println("compensate_CreateAuthorizedKeys")
}

func compensate_CreateContainer() {
	// TODO: implement this function
	compensate_CreateAuthorizedKeys()
	fmt.Println("compensate_CreateContainer")
}

func compensate_CreateSSHTunnel() {
	// TODO: implement this function
	compensate_CreateContainer()
	compensate_CreateAuthorizedKeys()
	fmt.Println("compensate_CreateSSHTunnel")
}
