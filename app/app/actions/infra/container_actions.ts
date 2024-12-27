"use server";
import prisma from "@/lib/db";
import axios from "axios";
import { container_create_schema } from "@/lib/zod";
import { ContainerActions, INFRA_BE_URL } from "@/lib/vars";
import { v4 as uuid } from "uuid";
import { $Enums } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function startContainer({
  container_name,
}: {
  container_name: string;
}) {
  const userEmail = "zyx";
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    const container = await prisma.containers.findUnique({
      where: {
        name: container_name,
        userId: user?.id,
      },
    });
    if (!container) {
      return {
        success: false,
        message: "Error, container not found",
      };
    }
    const startContainerResponse = await axios.post(INFRA_BE_URL, {
      container_name: container_name,
      action: ContainerActions.START,
    });
    if (startContainerResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to start the container",
      };
    }
    await prisma.containers.update({
      where: {
        name: container_name,
      },
      data: {
        state: $Enums.CONTAINER_STATE.STARTED,
      },
    });
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    console.log(error);
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
  const userEmail = "zyx";
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    const container = await prisma.containers.findUnique({
      where: {
        name: container_name,
        userId: user?.id,
      },
    });

    if (!container) {
      return {
        success: false,
        message: "Error, container not found",
      };
    }

    const stopContainerResponse = await axios.post(INFRA_BE_URL, {
      container_name: container_name,
      action: ContainerActions.STOP,
    });
    if (stopContainerResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to stop the container",
      };
    }
    await prisma.containers.update({
      where: {
        name: container_name,
      },
      data: {
        state: $Enums.CONTAINER_STATE.STOPPED,
      },
    });
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to stop the container",
    };
  }
}

export async function createContainer({
  container_name,
  vpc_id,
}: {
  container_name: string;
  vpc_id: string;
}) {
  const userEmail = "zyx";
  try {
    // validation
    const validation = container_create_schema.safeParse({
      container_name: container_name,
      vpc: vpc_id,
    });
    if (!validation.success) {
      return {
        success: false,
        message: "Error, Invalid input",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    const vpc = await prisma.vpc.findUnique({
      where: {
        id: vpc_id,
        userId: user?.id,
      },
    });
    const ContainerName = uuid();
    const createContainerResponse = await axios.post(INFRA_BE_URL, {
      container_name: ContainerName,
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
        name: ContainerName,
        nick_name: container_name,
        node: "oracle_arm",
        image: "aaraz/caas",
        tag: "1.1",
        state: $Enums.CONTAINER_STATE.STARTED,
        vpcId: vpc?.id as string,
        ip_address: containerIP,
        userId: user?.id as string,
      },
    });
    revalidatePath("/console/containers");
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    console.log(error);
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
  const userEmail = "zyx";
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    const container = await prisma.containers.findUnique({
      where: {
        name: container_name,
        userId: user?.id,
      },
    });

    if (!container) {
      return {
        success: false,
        message: "Error, container not found",
      };
    }

    const deleteContainerResponse = await axios.post(INFRA_BE_URL, {
      container_name,
      image: container?.image,
      tag: container?.tag,
      network: container.vpcId,
      storage: "3G",
    });
    if (deleteContainerResponse.data !== 0) {
      return {
        success: false,
        message: "failed to delete container",
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
    console.log(error);
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
  const userEmail = "zyx";
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    const container = await prisma.containers.findUnique({
      where: {
        name: container_name,
        userId: user?.id,
      },
    });

    if (!container) {
      return {
        success: false,
        message: "Error, container not found",
      };
    }

    const restartContainerResponse = await axios.post(INFRA_BE_URL, {
      container_name: container_name,
      action: ContainerActions.RESTART,
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
    console.log(error);
    return {
      success: false,
      message: "Failed to restart container",
    };
  }
}
