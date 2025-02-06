package main

import (
	"log"
	"sync"

	amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	// Connect to RabbitMQ
	conn, err := amqp.Dial("amqp://admin:wghncufxc8@192.168.122.2:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")

	var subscribersWaitGroup sync.WaitGroup

	// Docker actions subscriber
	subscribersWaitGroup.Add(1)
	go dockerActionsSubscriber(conn)

	subscribersWaitGroup.Wait()
}
