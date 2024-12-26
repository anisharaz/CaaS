"use server";
import prisma from "@/lib/db";
import axios from "axios";
import { container_create_schema } from "@/lib/zod";

export async function startContainer({
  container_name,
}: {
  container_name: string;
}) {
  try {
    const container = await prisma.containers.findFirst({
      where: {
        name: container_name,
      },
    });
    const startContainerResponse = await axios.post("backendURL", {
      container_name,
      image: container?.image,
      tag: container?.tag,
      network: container?.ip_address,
      storage: "3G",
    });
    if (startContainerResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to start the container",
      };
    }
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to start the container",
    };
  }
}

export async function stopContainer({
  container_name,
}: {
  container_name: string;
}) {
  try {
    const container = await prisma.containers.findFirst({
      where: {
        name: container_name,
      },
    });
    const stopContainerResponse = await axios.post("backendUrl", {
      container_name,
      image: container?.image,
      tag: container?.tag,
      network: container?.ip_address,
      storage: "3G",
    });
    if (stopContainerResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to stop the container",
      };
    }
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to stop the container",
    };
  }
}

export async function createContainer({
  container_name,
  vpc_name,
}: {
  container_name: string;
  vpc_name?: string;
}) {
  try {
    // validation
    const validation = container_create_schema.safeParse({
      container_name,
      vpc: vpc_name,
    });
    if (!validation.success) {
      return new Error(
        `Validation failed: ${validation.error.errors
          .map((err) => err.message)
          .join(", ")}`
      );
    }
    const vpc = await prisma.vpc.findFirst({
      where: {
        vpc_name: vpc_name ? vpc_name : "default",
      },
    });
    const createContainerResponse = await axios.post("backendUrl", {
      container_name,
      image: "aaraz/caas",
      tag: "1.1",
      network: vpc?.id,
      storage: "3G",
    });
    if (createContainerResponse.data.return_code !== 0) {
      return {
        success: false,
        message: "error, Failed to create container",
      };
    }

    const containerIP = createContainerResponse.data.container_ip;
    await prisma.containers.create({
      data: {
        name: container_name,
        node: "oracle_arm",
        image: "aaraz/caas",
        tag: "1.1",
        state: "STARTED",
        vpcId: vpc?.id as string,
        ip_address: containerIP,
        // inbound rules
        userId: vpc?.userId as string,
      },
    });
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "failed to create container",
    };
  }
}
export async function deleteContainer({
  container_name,
}: {
  container_name: string;
}) {
  try {
    const container = await prisma.containers.findFirst({
      where: {
        name: container_name,
      },
    });
    const deleteContainerResponse = await axios.post("backendURl", {
      container_name,
      image: container?.image,
      tag: container?.tag,
      network: container?.ip_address,
      storage: "3G",
    });
    if (deleteContainerResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to delete container",
      };
    }
    await prisma.containers.delete({
      where: {
        name: container_name,
      },
    });
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete container",
    };
  }
}

export async function restartContainer({
  container_name,
}: {
  container_name: string;
}) {
  try {
    const container = await prisma.containers.findFirst({
      where: {
        name: container_name,
      },
    });
    const restartContainerResponse = await axios.post("backendURL", {
      container_name,
      image: container?.image,
      tag: container?.tag,
      network: container?.ip_address,
      storage: "3G",
    });
    if (restartContainerResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to restart container",
      };
    }
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to restart container",
    };
  }
}
