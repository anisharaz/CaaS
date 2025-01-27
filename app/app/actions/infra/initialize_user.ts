"use server"
import { auth } from "@/auth"
import prisma from "@/lib/db"
import { DEFAULT_VPC_NAME, INFRA_BE_URL } from "@/lib/vars"
import axios from "axios"
import { v4 as uuid } from "uuid"

export async function initializeUser({ username }: { username: string }) {
  const session = await auth()
  const vpcID = uuid()
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      }
    })

    const availableVPC = await prisma.available_vpc.findFirst({
      where: {
        used: false
      },
      include: {
        nodes: true
      }
    })
    if (!availableVPC) {
      throw new Error("error, no available VPC")
    }

    const userDataID = uuid()

    // Task 1: Create network in the node
    const createNetworkResponse = await axios.post(INFRA_BE_URL + "/network", {
      network_name: vpcID,
      network_subnet: availableVPC?.cidr,
      network_gateway: availableVPC?.gateway
    })
    if (createNetworkResponse.data.return_code !== 0) {
      throw new Error("failed to create network")
    }

    // Task 2: Create user ssh folder in the node
    const create_ssh_folder = await axios.post(INFRA_BE_URL + "/init_user", {
      userData_id: userDataID,
      userDefaultVPCNodeName: availableVPC.nodes.node_name
    })

    if (create_ssh_folder.data.return_code !== 0) {
      throw new Error("failed to create user ssh folder on the node")
    }

    // Task 3: update the database
    await prisma.$transaction(async (tx) => {
      const resource_limit = await tx.resources_limit.create({
        data: {}
      })

      await tx.userData.create({
        data: {
          id: userDataID,
          userId: user?.id as string,
          resources_limitId: resource_limit.id,
          username: username,
          user_state: "ACTIVE"
        }
      })

      await tx.vpc.create({
        data: {
          id: vpcID,
          vpc_name: DEFAULT_VPC_NAME,
          nodeId: availableVPC.nodeId,
          network: availableVPC?.network as string,
          cidr: availableVPC?.cidr as string,
          gateway: availableVPC?.gateway as string,
          UserDataId: userDataID,
          available_vpcId: availableVPC?.id as string
        }
      })
      await tx.available_vpc.update({
        where: {
          id: availableVPC?.id
        },
        data: {
          used: true
        }
      })
    })

    return {
      success: true,
      message: ""
    }

    // eslint-disable-next-line
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: error.message
    }
  }
}
