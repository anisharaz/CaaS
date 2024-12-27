"use server";
import prisma from "@/lib/db";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { add_vpc_schema, edit_vpc_schema } from "@/lib/zod";
import { DEFAULT_VPC_NAME, INFRA_BE_URL } from "@/lib/vars";
import { revalidatePath } from "next/cache";

export async function createVPC({ vpc_name }: { vpc_name: string }) {
  const userEmail = "abc@gmail.com";
  try {
    //validation
    const validation = add_vpc_schema.safeParse({
      name: vpc_name,
    });
    if (!validation.success) {
      return {
        success: false,
        message: `Validation failed: ${validation.error.errors
          .map((err) => err.message)
          .join(", ")}`,
      };
    }
    const availableVPC = await prisma.available_vpc.findFirst({
      where: {
        used: false,
      },
    });
    const networkID = uuid();
    const createVPCResponse = await axios.post(INFRA_BE_URL, {
      network_name: networkID,
      network_subnet: availableVPC?.cidr,
      network_gateway: availableVPC?.gateway,
    });
    if (createVPCResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to create VPC",
      };
    }
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    const userId = user?.id;
    await prisma.$transaction(async (tx) => {
      await tx.vpc.create({
        data: {
          id: networkID,
          vpc_name: vpc_name,
          node: "oracle_arm",
          network: availableVPC?.network as string,
          cidr: availableVPC?.cidr as string,
          gateway: availableVPC?.gateway as string,
          userId: userId as string,
          available_vpcId: availableVPC?.id as string,
        },
      });
      await tx.available_vpc.update({
        where: {
          id: availableVPC?.id,
        },
        data: {
          used: true,
        },
      });
    });
    revalidatePath("/console/vpc");
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to create VPC",
    };
  }
}

export async function editVPC({
  vpc_id,
  vpc_name,
}: {
  vpc_name: string;
  vpc_id: string;
}) {
  const userEmail = "xyz";
  try {
    const validation = edit_vpc_schema.safeParse({
      name: vpc_name,
      id: vpc_id,
    });
    if (!validation.success) {
      return {
        success: false,
        message: `Validation failed: ${validation.error.errors
          .map((err) => err.message)
          .join(", ")}`,
      };
    }
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    await prisma.vpc.update({
      where: {
        id: vpc_id,
        userId: user?.id as string,
      },
      data: {
        vpc_name: vpc_name,
      },
    });
    revalidatePath("/console/vpc");
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to edit VPC",
    };
  }
}

export async function deleteVPC({ vpc_id }: { vpc_id: string }) {
  const userEmail = "xyz";
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    const vpc = await prisma.vpc.findFirst({
      where: {
        id: vpc_id,
        userId: user?.id as string,
      },
      include: {
        containers: true,
        available_vpc: true,
      },
    });
    if (!vpc) {
      return {
        success: false,
        message: "VPC not found",
      };
    }
    if (vpc?.containers.length !== 0) {
      return {
        success: false,
        message: "VPC is not empty, delete all containers first",
      };
    }
    if (vpc.vpc_name === DEFAULT_VPC_NAME) {
      return {
        success: false,
        message: "Default VPC cannot be deleted",
      };
    }
    const deleteVPCResponse = await axios.post(INFRA_BE_URL, {
      network_name: vpc?.id,
      network_subnet: vpc?.cidr,
      network_gateway: vpc?.gateway,
    });
    if (deleteVPCResponse.data !== 0) {
      return {
        success: false,
        message: "Error, Failed to delete VPC",
      };
    }
    await prisma.vpc.delete({
      where: {
        id: vpc_id,
      },
    });

    await prisma.available_vpc.update({
      where: {
        id: vpc.available_vpcId,
      },
      data: {
        used: false,
      },
    });
    revalidatePath("/console/vpc");
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to delete VPC",
    };
  }
}
