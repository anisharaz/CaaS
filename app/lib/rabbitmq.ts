import amqplib, { Connection, Channel } from "amqplib"
import { RMQSendError } from "./types"
const rmqUser = process.env.RMQ_USER || "guest"
const rmqPass = process.env.RMQ_PASS || "guest"
const rmqhost = process.env.RMQ_HOST || "localhost"

class RabbitMQConnection {
  connection!: Connection
  channel!: Channel
  private connected!: boolean
  private exchange!: string

  constructor({ exchange }: { exchange: string }) {
    this.exchange = exchange
  }
  async connect() {
    if (this.connected && this.channel) return

    this.connection = await amqplib.connect(
      `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672/caas`
    )
    this.channel = await this.connection.createChannel()
    this.connected = true
    this.channel.on("close", () => {
      setTimeout(() => {
        this.connect()
      }, 5000)
    })
    this.channel.assertExchange(this.exchange, "direct", {
      durable: true
    })
    console.log(`RMQ Connected`)
  }

  async SendActionToRMQ({
    message,
    action_type
  }: {
    message: object
    action_type:
      | "docker_actions"
      | "init_user_actions"
      | "dns_actions"
      | "nginx_actions"
  }) {
    if (!this.channel) {
      await this.connect()
    }
    const res = this.channel.publish(
      this.exchange,
      action_type,
      Buffer.from(JSON.stringify(message)),
      {
        contentType: "application/json"
      }
    )
    if (!res) {
      throw new RMQSendError("Failed to send message to RMQ")
    }
  }
}

export const RMQClient = new RabbitMQConnection({ exchange: "main" })
