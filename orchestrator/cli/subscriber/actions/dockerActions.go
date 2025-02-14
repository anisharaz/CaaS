package actions

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"

	amqp "github.com/rabbitmq/amqp091-go"
)

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
	acks := make(chan *amqp.Delivery)

	notifyConnClosed := make(chan *amqp.Error)
	conn.NotifyClose(notifyConnClosed)

	notifyChannelClosed := make(chan *amqp.Error)
	ch.NotifyClose(notifyChannelClosed)

	go func() {
		for {
			select {
			case work := <-works:
				go dockerActionsWorker(acks, &work)
			case ack := <-acks:
				// The false in the Ack() function states that it should only acknowledge this single message
				// If true it will ack all message if they are not processed
				ackError := ack.Ack(false)
				if ackError != nil {
					log.Fatalf("Ack error: %v", ackError)
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

func dockerActionsWorker(acks chan<- *amqp.Delivery, work *amqp.Delivery) {
	var workData map[string]interface{}

	err := json.Unmarshal(work.Body, &workData)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	switch workData["action"] {
	case "create":
		fmt.Println(string(work.Body))
		ok, err := createAuthorizedKeys(&map[string]interface{}{
			"userData_id":    workData["userData_id"],
			"ssh_public_key": workData["ssh_public_key"],
			"container_name": workData["container_name"],
			"dockerHostName": workData["dockerHostName"],
		})
		if !ok {
			fmt.Println(err)
		}
	default:
		fmt.Println("Unknown action")
	}
	acks <- work
}

// create container tasks ----------------------------------------------------------------------------------------
func createAuthorizedKeys(data *map[string]interface{}) (bool, error) {
	dataBytes, _ := json.Marshal(data)
	req, err := http.NewRequest(http.MethodPost, "http://localhost:3000", bytes.NewReader(dataBytes))
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

// func createContainer(data *map[string]interface{}) (bool, error) {

// }

// func createSSHTunnel() (bool, error) {

// }

// func updateDataBase() (bool, error) {

// }
