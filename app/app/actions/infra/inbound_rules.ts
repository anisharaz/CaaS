"use server";
import prisma from "@/lib/db";
import axios from "axios";
import { inbound_rules_schema } from "@/lib/zod";
import { INFRA_BE_URL } from "@/lib/vars";
import { revalidatePath } from "next/cache";

export async function createInboundRule({
  domain_name,
  container_port,
  config_name,
  container_name,
}: {
  domain_name: string;
  container_port: number;
  config_name: string;
  container_name: string;
}) {
  const userEmail = "xyz";
  try {
    // validation check
    const validation = inbound_rules_schema.safeParse({
      config_name: config_name,
      domain_name: domain_name,
      port: container_port,
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

    // get container details
    const container = await prisma.containers.findUnique({
      where: {
        name: container_name,
      },
    });
    // check if domain is already allocated
    const doesDomainAlreadyExists = await prisma.inbound_rules.findUnique({
      where: {
        domain_name: domain_name,
      },
    });
    if (doesDomainAlreadyExists) {
      return {
        success: false,
        message:
          "Domain already in use, you may edit the inbound rule for the same",
      };
    }

    const createInboundRulesResponse = await axios.post(INFRA_BE_URL, {
      config_name: config_name,
      domain_name: domain_name,
      // maybe changed
      protocol: "http",
      ip: container?.ip_address,
      port: container_port,
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
        domain_name: domain_name,
        service_protocol: "http",
        container_ip: container?.ip_address as string,
        port: container_port,
        userId: user?.id as string,
        containersName: container?.name as string,
      },
    });
    revalidatePath("/console/containers/[container_id]");
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to create inbound rule",
    };
  }
}

export async function editInboundRule({
  config_name,
  domain_name,
  container_port,
  inbound_rule_id,
}: {
  config_name: string;
  domain_name: string;
  container_port: number;
  inbound_rule_id: string;
}) {
  const userEmail = "xyz";
  try {
    //validation
    const validation = inbound_rules_schema.safeParse({
      config_name,
      domain_name,
      port: container_port,
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

    const rule = await prisma.inbound_rules.findUnique({
      where: {
        id: inbound_rule_id,
      },
    });
    try {
      await prisma.inbound_rules.update({
        where: {
          id: inbound_rule_id,
          userId: user?.id as string,
        },
        data: {
          rule_name: config_name,
          domain_name,
          port: container_port,
        },
      });
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Error, failed to edit inbound rule",
      };
    }

    const editInboundRuleResponse = await axios.post(INFRA_BE_URL, {
      config_name: config_name,
      container_name: rule?.containersName,
      domain_name: domain_name,
      container_port: container_port,
    });
    if (editInboundRuleResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to edit inbound rule",
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
      message: "Failed to edit inbound rule",
    };
  }
}

export async function deleteInboundRule({
  config_name,
  inbound_rule_id,
}: {
  config_name: string;
  inbound_rule_id: string;
}) {
  const userEmail = "xyz";
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    const rule = await prisma.inbound_rules.findUnique({
      where: {
        id: inbound_rule_id,
        userId: user?.id as string,
      },
    });
    if (!rule) {
      return {
        success: false,
        message: "Inbound rule not found",
      };
    }

    const deleteInboundRuleResponse = await axios.post(INFRA_BE_URL, {
      config_name: config_name,
      container_name: rule?.containersName,
    });
    if (deleteInboundRuleResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to delete inbound rule",
      };
    }
    await prisma.inbound_rules.delete({
      where: {
        id: inbound_rule_id,
      },
    });
    revalidatePath("/console/containers/[container_id]");
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to delete inbound rule",
    };
  }
}
