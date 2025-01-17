"use server"
import prisma from "@/lib/db"
import axios from "axios"
import { container_create_schema } from "@/lib/zod"
import { ContainerActions, INFRA_BE_URL } from "@/lib/vars"
import { v4 as uuid } from "uuid"
import { $Enums } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

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
        ssh_config: true
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
          container_name: container_name
        }
      }
    )
    if (deleteSSHFiles.data.return_code !== 0) {
      throw new Error("Error, failed to delete the ssh files")
    }

    // Task 3: Delete the ssh tunnel
    // TODO: add fall
    await axios.delete(INFRA_BE_URL + "/sshtunnel", {
      data: {
        ssh_tunnel_pid: container.ssh_config.ssh_tunnel_process_id
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

    const ContainerName = uuid()

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

    // Task 1: Create ssh key
    const create_authorized_key = await axios.post(
      INFRA_BE_URL + "/authorized_keys",
      {
        userData_id: user?.UserData?.id,
        ssh_public_key: sshKey.public_key,
        container_name: ContainerName
      }
    )
    if (create_authorized_key.data.return_code !== 0) {
      throw new Error("Error, Failed to create ssh key")
    }

    // Task 2: Create container
    const createContainerResponse = await axios.post(
      INFRA_BE_URL + "/container",
      {
        container_name: ContainerName,
        image: "aaraz/caas",
        tag: "1.2",
        network: vpc?.id,
        storage: "3G",
        userData_id: user?.UserData?.id
      }
    )
    if (createContainerResponse.data.return_code !== 0) {
      throw new Error("Error, Failed to create container")
    }

    // Task 3: Create ssh tunnel
    const sshTunnelResponse = await axios.post(INFRA_BE_URL + "/sshtunnel", {
      ssh_proxy_port: available_ssh_proxy_port?.ssh_proxy_port,
      container_ip: createContainerResponse.data.container_ip,
      node_name: available_ssh_proxy_port?.ssh_proxy_node_name,
      ssh_tunnel_pid: 0
    })
    if (sshTunnelResponse.data.return_code !== 0) {
      throw new Error("Error, Failed to create ssh tunnel")
    }

    const containerIP = createContainerResponse.data.container_ip

    // Task 4: Update the database
    await prisma.$transaction(async (tx) => {
      await tx.available_ssh_proxy_ports.update({
        where: {
          id: available_ssh_proxy_port?.id as string
        },
        data: {
          used: true
        }
      })

      const ssh_config = await tx.ssh_config.create({
        data: {
          ssh_proxy_node_name: available_ssh_proxy_port.ssh_proxy_node_name,
          ssh_proxy_port: available_ssh_proxy_port.ssh_proxy_port,
          ssh_tunnel_process_id: sshTunnelResponse.data.ssh_tunnel_pid,
          available_ssh_proxy_portsId: available_ssh_proxy_port.id,
          UserDataId: user?.UserData?.id as string
        }
      })

      await tx.containers.create({
        data: {
          name: ContainerName,
          nick_name: container_name,
          node: "oracle_arm",
          image: "aaraz/caas",
          tag: "1.2",
          state: $Enums.CONTAINER_STATE.STARTED,
          vpcId: vpc?.id as string,
          ip_address: containerIP,
          UserDataId: user?.UserData?.id as string,
          ssh_config_id: ssh_config.id,
          ssh_keysId: sshKey.id
        }
      })
    })

    // Revalidate cache used by Nextjs
    revalidatePath("/console/containers")

    return {
      success: true,
      message: "Container Created Successfully"
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
