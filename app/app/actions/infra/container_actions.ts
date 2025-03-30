"use server"
import prisma from "@/lib/db"
import axios from "axios"
import { container_create_schema } from "@/lib/zod"
import {
  ContainerActions,
  DEFAULT_CONTAINER_IMAGE,
  INFRA_BE_URL
} from "@/lib/vars"
import { $Enums } from "@prisma/client"
import { auth } from "@/auth"
import { v4 } from "uuid"
import { RMQClient } from "@/lib/rabbitmq"

export async function startContainer({
  container_name
}: {
  container_name: string
}) {
  const session = await auth()
  const userEmail = session?.user?.email as string
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail
      },
      include: {
        UserData: true
      }
    })
    const container = await prisma.containers.findUnique({
      where: {
        name: container_name,
        UserDataId: user?.UserData?.id as string
      }
    })
    if (!container) {
      throw new Error("Error, container not found")
    }

    // Task 1: Start the container
    const startContainerResponse = await axios.post(
      INFRA_BE_URL + "/container_actions",
      {
        container_name: container_name,
        action: ContainerActions.START
      }
    )
    if (startContainerResponse.data.return_code !== 0) {
      throw new Error("Error, failed to start the container")
    }

    // Task 2: Update the database
    await prisma.containers.update({
      where: {
        name: container_name
      },
      data: {
        state: $Enums.CONTAINER_STATE.STARTED
      }
    })

    return {
      success: true,
      message: ""
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: error.message
    }
  }
}

export async function stopContainer({
  container_name
}: {
  container_name: string
}) {
  const session = await auth()
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      },
      include: {
        UserData: true
      }
    })

    const container = await prisma.containers.findUnique({
      where: {
        name: container_name,
        UserDataId: user?.UserData?.id as string
      }
    })

    if (!container) {
      throw new Error("Error, container not found")
    }

    // Task 1: Stop the container
    const stopContainerResponse = await axios.post(
      INFRA_BE_URL + "/container_actions",
      {
        container_name: container_name,
        action: ContainerActions.STOP
      }
    )
    if (stopContainerResponse.data.return_code !== 0) {
      throw new Error("Error, failed to stop the container")
    }

    // Task 2: Update the database
    await prisma.containers.update({
      where: {
        name: container_name
      },
      data: {
        state: $Enums.CONTAINER_STATE.STOPPED
      }
    })

    return {
      success: true,
      message: ""
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: error.message
    }
  }
}

export async function deleteContainer({
  container_name
}: {
  container_name: string
}) {
  const session = await auth()
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      },
      include: {
        UserData: true
      }
    })

    const container = await prisma.containers.findUnique({
      where: {
        name: container_name,
        UserDataId: user?.UserData?.id as string
      },
      include: {
        ssh_config: true,
        nodes: true
      }
    })
    if (!container) {
      throw new Error("Error, container not found")
    }

    // Task 1: Delete the container
    const deleteContainerResponse = await axios.delete(
      INFRA_BE_URL + "/container",
      {
        data: {
          container_name: container_name
        }
      }
    )
    if (deleteContainerResponse.data.return_code !== 0) {
      throw new Error("Error, failed to delete the container")
    }

    // Task 2: Delete the ssh files
    const deleteSSHFiles = await axios.delete(
      INFRA_BE_URL + "/authorized_keys",
      {
        data: {
          userData_id: user?.UserData?.id,
          container_name: container_name,
          dockerHostName: container.nodes.node_name
        }
      }
    )
    if (deleteSSHFiles.data.return_code !== 0) {
      throw new Error("Error, failed to delete the ssh files")
    }

    // Task 3: Delete the ssh tunnel
    await axios.delete(INFRA_BE_URL + "/sshtunnel", {
      data: {
        ssh_tunnel_pid: container.ssh_config.ssh_tunnel_process_id,
        ssh_proxy_node_name: container.ssh_config.ssh_proxy_node_name
      }
    })

    // Task 4: Update the database
    await prisma.$transaction(async (tx) => {
      await tx.containers.delete({
        where: {
          name: container_name
        }
      })
      const res = await tx.ssh_config.delete({
        where: {
          id: container.ssh_config.id
        }
      })
      await tx.available_ssh_proxy_ports.update({
        where: {
          id: res.available_ssh_proxy_portsId
        },
        data: {
          used: false
        }
      })
    })

    return {
      success: true,
      message: ""
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: error.message
    }
  }
}

export async function restartContainer({
  container_name
}: {
  container_name: string
}) {
  const session = await auth()
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      },
      include: {
        UserData: true
      }
    })

    const container = await prisma.containers.findUnique({
      where: {
        name: container_name,
        UserDataId: user?.UserData?.id as string
      }
    })

    if (!container) {
      throw new Error("Error, container not found")
    }

    // Task 1: Restart the container
    const restartContainerResponse = await axios.post(
      INFRA_BE_URL + "/container_actions",
      {
        container_name: container_name,
        action: ContainerActions.RESTART
      }
    )
    if (restartContainerResponse.data.return_code !== 0) {
      throw new Error("Error, failed to restart the container")
    }

    return {
      success: true,
      message: "Container restart succeeded"
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: error.message
    }
  }
}

export async function createContainer({
  container_name,
  vpc_id,
  ssh_key_id
}: {
  container_name: string
  vpc_id: string
  ssh_key_id: string
}) {
  const session = await auth()
  try {
    const validation = container_create_schema.safeParse({
      container_name: container_name,
      vpc_id: vpc_id,
      ssh_key_id: ssh_key_id
    })
    if (!validation.success) {
      throw new Error("Data Validation error")
    }
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      },
      include: {
        UserData: true
      }
    })
    const vpc = await prisma.vpc.findUnique({
      where: {
        id: vpc_id,
        UserDataId: user?.UserData?.id as string
      },
      include: {
        nodes: true
      }
    })
    const sshKey = await prisma.ssh_keys.findUnique({
      where: {
        id: ssh_key_id
      }
    })
    if (!vpc) {
      throw new Error("VPC not found")
    }
    if (!sshKey) {
      throw new Error("SSH Key not found")
    }

    const userData = await prisma.userData.findUnique({
      where: {
        id: user?.UserData?.id as string
      },
      include: {
        resources_limit: true,
        containers: true
      }
    })
    // User's container limit check
    if (
      (userData?.containers.length as number) >=
      (userData?.resources_limit.container_limit as number)
    ) {
      throw new Error("Error, Container limit reached")
    }

    const available_ssh_proxy_port =
      await prisma.available_ssh_proxy_ports.findFirst({
        where: {
          used: false
        }
      })

    if (!available_ssh_proxy_port) {
      throw new Error("Error, No available ssh proxy port")
    }

    const res = await prisma.containers_scheduled.create({
      data: {
        container_nickname: container_name,
        UserDataId: userData?.id as string,
        ssh_keysId: sshKey.id,
        name: v4(),
        nodeId: vpc.nodeId,
        image: DEFAULT_CONTAINER_IMAGE.split(":")[0],
        tag: DEFAULT_CONTAINER_IMAGE.split(":")[1],
        network: vpc.id,
        storage: "3g"
      }
    })

    await RMQClient.SendActionToRMQ({
      message: {
        action: "create",
        container_schedule_id: res.id
      },
      action_type: "docker_actions"
    })

    return {
      success: true,
      message: "Container scheduled Successfully"
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: error.message
    }
  }
}
