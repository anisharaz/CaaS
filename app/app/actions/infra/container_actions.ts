"use server"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { v4 } from "uuid"
import { headers } from "next/headers"
import { AWS_CAAS_SNS_TOPIC_ARN } from "@/lib/vars"
import { snsClient } from "@/lib/aws"
import { PublishCommand } from "@aws-sdk/client-sns"

export async function createContainer({
  container_name,
  vpc_id,
  ssh_key_id
}: {
  container_name: string
  vpc_id: string
  ssh_key_id: string
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      throw new Error("Unauthorized")
    }

    const user = await prisma.user.findUnique({
      where: { id: session?.user.id },
      include: {
        userData: {
          include: {
            incusProject: true,
            resourcesAndLimits: true
          }
        }
      }
    })

    if (
      (user?.userData?.resourcesAndLimits?.container as number) >=
      (user?.userData?.resourcesAndLimits?.containerLimit as number)
    ) {
      throw new Error("Container limit reached")
    }

    const sshkey = await prisma.sshKeys.findUnique({
      where: {
        id: ssh_key_id
      }
    })

    const sshPort = await prisma.sshProxyAvailablePorts.findFirst({
      where: {
        used: false
      }
    })

    const res = await prisma.containers.create({
      data: {
        id: v4(),
        name: container_name,
        vpcId: vpc_id,
        UserDataId: user?.userData?.id as string,
        SshKeysId: ssh_key_id,
        state: "PENDING",
        SshPortId: sshPort?.id as string
      }
    })
    await prisma.sshProxyAvailablePorts.update({
      where: {
        id: sshPort?.id
      },
      data: {
        used: true
      }
    })
    await prisma.resourcesAndLimits.update({
      where: {
        userDataId: user?.userData?.id as string
      },
      data: {
        container: {
          increment: 1
        }
      }
    })
    const payload = {
      action: "CREATE",
      container: res,
      sshkey: sshkey?.publicKey as string,
      project: user?.userData?.incusProject?.id as string,
      sshport: sshPort?.sshProxyPort as number,
      autoDelete: true
    }

    const params = {
      TopicArn: AWS_CAAS_SNS_TOPIC_ARN,
      Message: JSON.stringify(payload), // SNS Message body
      MessageGroupId: payload.action, // group by action or any grouping key
      MessageDeduplicationId: `${Date.now()}`
    }

    const command = new PublishCommand(params)

    await snsClient.send(command)

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

export async function deleteContainer({
  containerId
}: {
  containerId: string
}) {
  const res = await prisma.containers.findUnique({
    where: {
      id: containerId
    },
    include: {
      SshPort: true,
      UserData: {
        include: {
          resourcesAndLimits: true,
          incusProject: true
        }
      }
    }
  })

  await prisma.containers.update({
    where: { id: containerId },
    data: {
      state: "DELETING"
    }
  })
  const payload = {
    action: "DELETE",
    sshProxyAvailablePortsId: res?.SshPort?.id as string,
    containerId: containerId,
    resourcesAndLimitsId: res?.UserData?.resourcesAndLimits?.id as string,
    incusProjectId: res?.UserData?.incusProject?.id as string
  }

  const params = {
    TopicArn: AWS_CAAS_SNS_TOPIC_ARN,
    Message: JSON.stringify(payload), // SNS Message body
    MessageGroupId: payload.action, // group by action or any grouping key
    MessageDeduplicationId: `${Date.now()}`
  }

  const command = new PublishCommand(params)

  await snsClient.send(command)
  return {
    success: true,
    message: "Container deletion scheduled Successfully"
  }
}
