"use server";
import prisma from "@/lib/db";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { vpc_schema } from "@/lib/zod";

export async function createVPC({ vpc_name }: { vpc_name: string }) {
  try {
    //validation
    const validation = vpc_schema.safeParse({
      name: vpc_name,
    });
    if (!validation.success) {
      return new Error(
        `Validation failed: ${validation.error.errors
          .map((err) => err.message)
          .join(", ")}`
      );
    }
    const userEmail = "abc@gmail.com";
    const availableVPC = await prisma.available_vpc.findFirst({
      where: {
        used: false,
      },
    });
    const networkID = uuid();
    const createVPCResponse = await axios.post("backendURL", {
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
          vpc_name,
          node: "oracle_arm",
          network: availableVPC?.network as string,
          cidr: availableVPC?.cidr as string,
          gateway: availableVPC?.gateway as string,
          userId: userId as string,
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
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create VPC",
    };
  }
}

//cidr, and new VPC name
export async function editVPC({
  vpc_name,
  cidr,
}: {
  vpc_name: string;
  cidr: string;
}) {
  try {
    //validation
    const validation = vpc_schema.safeParse({
      name: vpc_name,
      cidr: cidr,
    });
    if (!validation.success) {
      return new Error(
        `Validation failed: ${validation.error.errors
          .map((err) => err.message)
          .join(", ")}`
      );
    }
    await prisma.vpc.update({
      where: {
        cidr,
      },
      data: {
        // new name
        vpc_name,
      },
    });
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to edit VPC",
    };
  }
}

export async function deleteVPC({ cidr }: { cidr: string }) {
  try {
    const vpc = await prisma.vpc.findFirst({
      where: {
        cidr,
      },
    });
    if (vpc?.containers.length > 0) {
      // return with error to delete containers
      throw new Error("Delete all containers in the VPC");
    }
    const deleteVPCResponse = await axios.post("backendURL", {
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
        id: vpc?.id,
      },
    });
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete VPC",
    };
  }
}
