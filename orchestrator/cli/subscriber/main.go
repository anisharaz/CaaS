package main

import (
	subscriberActions "aarazcaas/orchistrator/cli/subscriber/actions"
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

	subscribersWaitGroup.Add(1)
	go subscriberActions.DockerActionsSubscriber(conn)

	subscribersWaitGroup.Add(1)
	go subscriberActions.DnsActionsSubscriber(conn)

	subscribersWaitGroup.Add(1)
	go subscriberActions.NginxActionsSubscriber(conn)

	subscribersWaitGroup.Add(1)
	go subscriberActions.InitUserkerActionsSubscriber(conn)

	subscribersWaitGroup.Wait()
}
