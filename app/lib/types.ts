export class RMQSendError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RMQSendError"
    Object.setPrototypeOf(this, RMQSendError.prototype)
  }
}
