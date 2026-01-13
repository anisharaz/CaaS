export const DEFAULT_VPC_NAME = "default"

export enum ContainerActions {
  START = "start",
  STOP = "stop",
  RESTART = "restart"
}

export const AWS_CAAS_SNS_TOPIC_ARN = process.env
  .AWS_CAAS_SNS_TOPIC_ARN as string
