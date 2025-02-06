// This file is only used for sending data
// to queue when developing orchestrator package
// it is not made for production use

package main

import (
	"context"
	"encoding/json"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func main() {
	conn, err := amqp.Dial("amqp://admin:wghncufxc8@192.168.122.2:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")

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
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	type createContainerData struct {
		Action           string `json:"action"`
		UserDataId       string `json:"userDataId"`
		SshPublicKey     string `json:"sshPublicKey"`
		ContainerName    string `json:"containerName"`
		DockerHostName   string `json:"DockerHostName"`
		ContainerImage   string `json:"containerImage"`
		ContainerTag     string `json:"containerTag"`
		ContainerNetwork string `json:"containerNetwork"`
		SshProxyPort     string `json:"sshProxyPort"`
		SshProxyNode     string `json:"sshProxyNode"`
	}
	data := createContainerData{
		Action:           "create",
		UserDataId:       "1",
		SshPublicKey:     "xyz",
		ContainerName:    "test",
		DockerHostName:   "oracle_arm",
		ContainerImage:   "ubuntu",
		ContainerTag:     "latest",
		ContainerNetwork: "loc",
		SshProxyPort:     "22",
		SshProxyNode:     "azure",
	}
	jsonData, _ := json.Marshal(data)
	err = ch.PublishWithContext(ctx,
		"",     // exchange
		q.Name, // routing key
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        []byte(jsonData),
		})
	failOnError(err, "Failed to publish a message")
	log.Printf(" [x] Sent %s\n", jsonData)
}
