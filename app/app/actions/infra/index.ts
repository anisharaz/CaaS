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

export async function createInboundRules({
  domain_name,
  serviceport,
  config_name,
  container_id,
}: {
  domain_name: string;
  serviceport: number;
  config_name: string;
  container_id: string;
}) {
  try {
    const container = await prisma.containers.findFirst({
      where: {
        name: container_id,
      },
    });
    const createInboundRulesResponse = await axios.post("backendURl", {
      config_name,
      domain_name,
      // maybe changed
      protocol: "http",
      ip: container?.ip_address,
      port: serviceport,
      container_name: container?.name,
    });
    if (createInboundRulesResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to create inbound rule",
      };
    }
    await prisma.inbound_rules.create({
      data: {
        node: "oracle_arm",
        rule_name: config_name,
        domain_name,
        service_protocol: "http",
        container_ip: container?.ip_address as string,
        port: serviceport,
        userId: container?.userId as string,
        //   array, need correction in schema
        containersName: "",
      },
    });
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create inbound rule",
    };
  }
}

// ACTIONS OF CONTAINER

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

// get container logs [optional]
