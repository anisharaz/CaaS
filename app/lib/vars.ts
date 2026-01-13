export const DEFAULT_VPC_NAME = "default"

export enum ContainerActions {
  START = "start",
  STOP = "stop",
  RESTART = "restart"
}

export const AWS_CAAS_SNS_TOPIC_ARN = process.env
  .AWS_CAAS_SNS_TOPIC_ARN as string

export function GetCloudInitConfig(sshkey: string) {
  return `
#cloud-config

package_update: true
package_upgrade: false

packages:
  - openssh-server

users:
  - name: ubuntu
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    ssh_authorized_keys:
      - ${sshkey.trim()}

runcmd:
  - systemctl enable ssh
  - systemctl start ssh
  - systemctl restart ssh
`
}
