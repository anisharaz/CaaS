"use server";
import prisma from "@/lib/db";
import axios from "axios";
import { inbound_rules_schema } from "@/lib/zod";

export async function createInboundRule({
  domain_name,
  container_port,
  config_name,
  container_id,
}: {
  domain_name: string;
  container_port: number;
  config_name: string;
  container_id: string;
}) {
  try {
    // validation check
    const validation = inbound_rules_schema.safeParse({
      config_name,
      domain_name,
      port: container_port,
    });

    if (!validation.success) {
      return new Error(
        `Validation failed: ${validation.error.errors
          .map((err) => err.message)
          .join(", ")}`
      );
    }
    // get container details
    const container = await prisma.containers.findFirst({
      where: {
        name: container_id,
      },
    });
    // check if domain is already allocated
    const doesDomainAlreadyExists = await prisma.inbound_rules.findFirst({
      where: { domain_name },
    });
    if (doesDomainAlreadyExists) {
      return new Error("Unavailable domain, please enter a new one");
    }

    const createInboundRulesResponse = await axios.post("backendURl", {
      config_name,
      domain_name,
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
        domain_name,
        service_protocol: "http",
        container_ip: container?.ip_address as string,
        port: container_port,
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

export async function editInboundRule({
  config_name,
  domain_name,
  container_port,
}: {
  config_name: string;
  domain_name: string;
  container_port: number;
}) {
  try {
    //validation
    const validation = inbound_rules_schema.safeParse({
      config_name,
      domain_name,
      port: container_port,
    });
    if (!validation.success) {
      return new Error(
        `Validation failed: ${validation.error.errors
          .map((err) => err.message)
          .join(", ")}`
      );
    }
    const rule = await prisma.inbound_rules.findFirst({
      where: {
        rule_name: config_name,
      },
    });
    // to be written, maybe changed
    const editInboundRuleResponse = await axios.post("backendUrl", {
      config_name,
      container_name: rule?.containersName,
      domain_name,
      container_port,
    });
    if (editInboundRuleResponse.data !== 0) {
      return {
        success: false,
        message: "Error, failed to edit inbound rule",
      };
    }
    await prisma.inbound_rules.update({
      where: {
        id: rule?.id,
      },
      data: {
        rule_name: config_name,
        domain_name,
        port: container_port,
      },
    });
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to edit inbound rule",
    };
  }
}

export async function deleteInboundRule({
  config_name,
}: {
  config_name: string;
}) {
  try {
    const rule = await prisma.inbound_rules.findFirst({
      where: {
        rule_name: config_name,
      },
    });
    const deleteInboundRuleResponse = await axios.post("backendURL", {
      config_name,
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
        id: rule?.id,
      },
    });
    return {
      success: true,
      message: "",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete inbound rule",
    };
  }
}
