"use server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { DEFAULT_VPC_NAME, INFRA_BE_URL } from "@/lib/vars";
import axios from "axios";
import { v4 as uuid } from "uuid";

export async function initializeUser({ username }: { username: string }) {
  const session = await auth();
  const userEmail = session?.user?.email as string;
  const vpcID = uuid();
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    const userID = user?.id as string;

    const availableVPC = await prisma.available_vpc.findFirst({
      where: {
        used: false,
      },
    });
    if (!availableVPC) {
      return {
        success: false,
        message: "No available VPC",
      };
    }
    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        username: username,
      },
    });

    const createNetworkResponse = await axios.post(INFRA_BE_URL + "/network", {
      network_name: vpcID,
      network_subnet: availableVPC?.cidr,
      network_gateway: availableVPC?.gateway,
    });
    if (createNetworkResponse.data.return_code !== 0) {
      return {
        success: false,
        message: "error, failed to create network",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.vpc.create({
        data: {
          id: vpcID,
          vpc_name: DEFAULT_VPC_NAME,
          node: "oracle_arm",
          network: availableVPC?.network as string,
          cidr: availableVPC?.cidr as string,
          gateway: availableVPC?.gateway as string,
          userId: userID,
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

    return {
      success: true,
      message: "",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed creating network try again",
    };
  }
}
