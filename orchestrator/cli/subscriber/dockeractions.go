package main

import (
	models_dockeractions "aarazcaas/orchistrator/models/dockeractions"
	"encoding/json"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type testData struct {
	Title  string `json:"title"`
	Body   string `json:"body"`
	UserId string `json:"userId"`
}

func dockerActionsSubscriber(conn *amqp.Connection) {
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
				ackError := ack.Ack(false)
				if ackError != nil {
					log.Fatalf("Ack error: %v", ackError)
				}
			}
		}
	}()

	log.Printf("[*] Waiting for messages. To exit press CTRL+C")

	select {
	case connError := <-notifyConnClosed:
		log.Fatalf("saw connection closure error: %v", connError)
	case channelError := <-notifyChannelClosed:
		log.Fatalf("saw channel closure error: %v", channelError)
	}
}

func dockerActionsWorker(acks chan<- *amqp.Delivery, work *amqp.Delivery) {
	// client := resty.New()
	var workData models_dockeractions.CreateContainerData

	err := json.Unmarshal(work.Body, &workData)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	switch workData.Action {
	case "create":
		fmt.Println(string(work.Body))
		time.Sleep(time.Second * 2)
		fmt.Println("end")
	default:
		fmt.Println("Unknown action")
	}
	acks <- work
}

// TASKS ----------------------------------------------------------------------------------------
func createAuthorizedKeys() {

}

func createContainer() {

}

func createSSHTunnel() {

}

func updateDataBase() {

}
