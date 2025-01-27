"use server"
import prisma from "@/lib/db"
import axios from "axios"
import { v4 as uuid } from "uuid"
import { add_vpc_schema, edit_vpc_schema } from "@/lib/zod"
import { DEFAULT_VPC_NAME, INFRA_BE_URL } from "@/lib/vars"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createVPC({ vpc_name }: { vpc_name: string }) {
  const session = await auth()
  try {
    const validation = add_vpc_schema.safeParse({
      name: vpc_name
    })
    if (!validation.success) {
      throw new Error("Validation failed")
    }
    const availableVPC = await prisma.available_vpc.findFirst({
      where: {
        used: false
      }
    })
    if (!availableVPC) {
      throw new Error("No available VPC")
    }

    const networkID = uuid()

    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      },
      include: {
        UserData: {
          select: {
            id: true,
            vpc: true,
            resources_limit: true
          }
        }
      }
    })

    if (
      (user?.UserData?.vpc.length as number) >=
      (user?.UserData?.resources_limit.vpc_limit as number)
    ) {
      throw new Error("VPC limit reached")
    }

    // Task 1: Create VPC on node
    const createVPCResponse = await axios.post(INFRA_BE_URL + "/network", {
      network_name: networkID,
      network_subnet: availableVPC?.cidr,
      network_gateway: availableVPC?.gateway
    })
    if (createVPCResponse.data.return_code !== 0) {
      throw new Error("Error, Failed to create VPC")
    }

    // Task 2: Create VPC in database
    await prisma.$transaction(async (tx) => {
      await tx.vpc.create({
        data: {
          id: networkID,
          vpc_name: vpc_name,
          nodeId: availableVPC.nodeId,
          network: availableVPC?.network as string,
          cidr: availableVPC?.cidr as string,
          gateway: availableVPC?.gateway as string,
          UserDataId: user?.UserData?.id as string,
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

    // revalidate cache created bt nextjs
    revalidatePath("/console/vpc")

    return {
      success: true,
      message: "VPC created successfully"
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

export async function editVPC({
  vpc_id,
  vpc_name
}: {
  vpc_name: string
  vpc_id: string
}) {
  const session = await auth()
  try {
    const validation = edit_vpc_schema.safeParse({
      name: vpc_name,
      id: vpc_id
    })
    if (!validation.success) {
      throw new Error("Validation failed")
    }
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      },
      include: {
        UserData: true
      }
    })

    // Task 1: Edit VPC in database
    await prisma.vpc.update({
      where: {
        id: vpc_id,
        UserDataId: user?.UserData?.id as string
      },
      data: {
        vpc_name: vpc_name
      }
    })

    // revalidate cache created bt nextjs
    revalidatePath("/console/vpc")

    return {
      success: true,
      message: "VPC edited successfully"
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

export async function deleteVPC({ vpc_id }: { vpc_id: string }) {
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
    const vpc = await prisma.vpc.findFirst({
      where: {
        id: vpc_id,
        UserDataId: user?.UserData?.id as string
      },
      include: {
        containers: true,
        available_vpc: true
      }
    })
    if (!vpc) {
      throw new Error("VPC not found")
    }
    if (vpc?.containers.length !== 0) {
      throw new Error("VPC has containers, delete them first")
    }
    if (vpc.vpc_name === DEFAULT_VPC_NAME) {
      throw new Error("Cannot delete default VPC")
    }

    // Task 1: Delete VPC on node
    const deleteVPCResponse = await axios.delete(INFRA_BE_URL + "/network", {
      data: {
        network_name: vpc?.id,
        network_subnet: vpc?.cidr,
        network_gateway: vpc?.gateway
      }
    })
    if (deleteVPCResponse.data.return_code !== 0) {
      throw new Error("Error, Failed to delete VPC")
    }

    await prisma.$transaction(async (tx) => {
      await tx.vpc.delete({
        where: {
          id: vpc_id
        }
      })

      await tx.available_vpc.update({
        where: {
          id: vpc.available_vpcId
        },
        data: {
          used: false
        }
      })
    })

    // revalidate cache created bt nextjs
    revalidatePath("/console/vpc")

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
