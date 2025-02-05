export const DEFAULT_VPC_NAME = "Default"
export const INFRA_BE_URL = process.env.INFRA_BE_URL as string
export const METRICS_BE_URL = process.env.METRICS_BE_URL as string

export enum ContainerActions {
  START = "start",
  STOP = "stop",
  RESTART = "restart"
}
