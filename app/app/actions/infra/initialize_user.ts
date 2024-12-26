"use server";
import prisma from "@/lib/db";
import axios from "axios";
import { v4 as uuid } from "uuid";

export async function initializeUser({ username }: { username: string }) {
  const userEmail = "abc@gmail.com";
  const vpcID = uuid();
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    const userID = user?.id as string;

    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        username: username,
      },
    });

    const availableVPC = await prisma.available_vpc.findFirst({
      where: {
        used: false,
      },
    });

    // backend post request
    const createNetworkResponse = await axios.post("backendURl", {
      network_name: vpcID,
      network_subnet: availableVPC?.cidr,
      network_gateway: availableVPC?.gateway,
    });
    if (createNetworkResponse.data !== 0) {
      return {
        success: false,
        message: "error, failed to create network",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.available_vpc.update({
        where: {
          id: availableVPC?.id,
        },
        data: {
          used: true,
        },
      });
      await tx.vpc.create({
        data: {
          id: vpcID,
          vpc_name: "Default",
          node: "oracle_arm",
          network: availableVPC?.network as string,
          cidr: availableVPC?.cidr as string,
          gateway: availableVPC?.gateway as string,
          userId: userID,
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
      message: "Failed creating network try again",
    };
  }
}
