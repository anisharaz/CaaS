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

	amqp "github.com/rabbitmq/amqp091-go"
	"gorm.io/gorm/clause"
)

type ackMessage struct {
	ack     *amqp.Delivery
	success bool
}

type action_create_state struct {
	authorized_keys bool
	container       bool
	container_ip    string
	ssh_tunnel      bool
	ssh_tunnel_pid  int16
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
	var workData map[string]interface{}
	db := database.GetDB()
	err := json.Unmarshal(work.Body, &workData)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	total_task_success := false
	switch workData["action"] {
	case "create":
		tx := db.Begin()
		available_ssh_proxy_port := models.Available_ssh_proxy_ports{Used: false}
		tx.Clauses(clause.Locking{Strength: "UPDATE", Options: "SKIP LOCKED"}).First(&available_ssh_proxy_port)

		state := &action_create_state{
			authorized_keys: false,
			container:       false,
			ssh_tunnel:      false,
		}
		// one time loop, because we can prevent
		// other task from proceeding if one of
		// the task fails using break; statement
		for i := 0; i < 1; i++ {
			// Pre-flight
			sql, _ := db.DB()
			if err := sql.Ping(); err != nil {
				fmt.Println("Error:", err)
				time.Sleep(time.Second * 2)
				break
			}

			// 1. creating authorized keys
			for a := 0; a < 2; a++ {
				okCreateAuthorizedKeys, _ := createAuthorizedKeys(&map[string]interface{}{
					"userData_id":    workData["userData_id"],
					"ssh_public_key": workData["ssh_public_key"],
					"container_name": workData["container_name"],
					"dockerHostName": workData["dockerHostName"],
				})
				if okCreateAuthorizedKeys {
					state.authorized_keys = true
					break
				}
			}
			if !state.authorized_keys {
				break
			}

			// 2. creating container
			for b := 0; b < 2; b++ {
				okCreateContainer, containerIp, _ := createContainer(&map[string]interface{}{
					"container_name": workData["container_name"],
					"image":          workData["image"],
					"tag":            workData["tag"],
					"network":        workData["network"],
					"storage":        workData["storage"],
					"userData_id":    workData["userData_id"],
				})
				if okCreateContainer {
					state.container = true
					state.container_ip = containerIp
					break
				}
			}
			if !state.container {
				compensate_CreateAuthorizedKeys()
				break
			}

			// 3. creating ssh tunnel
			for c := 0; c < 2; c++ {
				okCreateSSHTunnel, tunnelPid, _ := createSSHTunnel(&map[string]interface{}{
					"ssh_proxy_port": available_ssh_proxy_port.Ssh_proxy_port,
					"container_ip":   workData["container_ip"],
					"node_name":      available_ssh_proxy_port.Ssh_proxy_node_name,
					"ssh_tunnel_pid": 0,
					"dockerHostName": state.container_ip,
				})
				if okCreateSSHTunnel {
					state.ssh_tunnel = true
					state.ssh_tunnel_pid = tunnelPid
					break
				}
			}
			if !state.ssh_tunnel {
				compensate_CreateContainer()
				break
			}

			// 4. Updating database
			ssh_config := models.Ssh_config{
				Ssh_proxy_node_name:         available_ssh_proxy_port.Ssh_proxy_node_name,
				Ssh_proxy_port:              uint32(available_ssh_proxy_port.Ssh_proxy_port),
				Ssh_tunnel_process_id:       uint32(state.ssh_tunnel_pid),
				UserDataId:                  workData["userData_id"].(string),
				Available_ssh_proxy_portsId: available_ssh_proxy_port.ID,
			}

			tx.Create(&ssh_config)
			available_ssh_proxy_port.Used = true
			tx.Save(&available_ssh_proxy_port)

			if tx.Commit().Error != nil {
				// * The known problem here is that, the tx commit is failed but
				// * the ssh tunnel is created and while the tunnel is being deleted
				// * by the compensate_CreateSSHTunnel() function, same ssh tunnel is
				// * available in the db and can be used by another process, but
				// * it may not cause a problem because another process starts its
				// * new task from the beginning and until another process reaches the
				// * tunnel creation step, the compensate_CreateSSHTunnel() function
				// * would have finished deleting the old tunnel which would prevent the conflict.
				// TODO: solution to this issue is needed
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

func createAuthorizedKeys(data *map[string]interface{}) (bool, error) {
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

func createContainer(data *map[string]interface{}) (bool, string, error) {
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
	return true, "", nil
}

func createSSHTunnel(data *map[string]interface{}) (bool, int16, error) {
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
	var bodyJson map[string]interface{}
	err = json.Unmarshal(body, &bodyJson)
	if err != nil {
		return false, 0, err
	}
	return true, bodyJson["ssh_tunnel_pid"].(int16), nil
}

func compensate_CreateAuthorizedKeys() {
	// TODO: implement this function
}

func compensate_CreateContainer() {
	// TODO: implement this function
	compensate_CreateAuthorizedKeys()
}

func compensate_CreateSSHTunnel() {
	// TODO: implement this function
	compensate_CreateContainer()
	compensate_CreateAuthorizedKeys()
}
