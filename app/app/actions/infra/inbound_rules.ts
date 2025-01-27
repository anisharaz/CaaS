"use server"
import prisma from "@/lib/db"
import axios from "axios"
import { inbound_rules_schema } from "@/lib/zod"
import { INFRA_BE_URL } from "@/lib/vars"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { CfClient } from "@/lib/cloudflare."

export async function createInboundRule({
  domain_name,
  container_port,
  config_name,
  container_name
}: {
  domain_name: string
  container_port: number
  config_name: string
  container_name: string
}) {
  const session = await auth()
  try {
    const validation = inbound_rules_schema.safeParse({
      config_name: config_name,
      domain_name: domain_name,
      port: container_port
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

    const container = await prisma.containers.findUnique({
      where: {
        name: container_name
      },
      include: {
        nodes: true
      }
    })

    if (!container) {
      throw new Error("Container not found")
    }

    const doesDomainAlreadyExists = await prisma.inbound_rules.findUnique({
      where: {
        domain_name: domain_name
      }
    })

    if (doesDomainAlreadyExists) {
      throw new Error("Domain already in use")
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let create_dns: any = null

    if (process.env.MODE === "prod") {
      // Task 1: Create DNS record
      create_dns = await CfClient.dns.records.create({
        type: "A",
        zone_id: process.env.CLOUDFLARE_ZONE_ID as string,
        name: domain_name,
        content: process.env.ORACLE_NODE_IP as string,
        proxied: true,
        comment: user?.id as string
      })

      if (!create_dns) {
        throw new Error("Failed to create DNS record")
      }
    }

    // Task 2: Create Inbound rule in database
    const res = await prisma.inbound_rules.create({
      data: {
        nodeId: container.nodes.id,
        rule_name: config_name,
        domain_name: domain_name,
        service_protocol: "http",
        container_ip: container?.ip_address as string,
        port: container_port,
        UserDataId: user?.UserData?.id as string,
        containersName: container?.name as string,
        cloudflare_record_id: create_dns.id as string,
        cloudflare_zone: process.env.CLOUDFLARE_ZONE_ID as string
      }
    })

    // Task 3: Create Inbound rule on the node
    const createInboundRulesResponse = await axios.post(
      INFRA_BE_URL + "/nginx",
      {
        config_id: res.id,
        domain_name: domain_name,
        // maybe changed
        protocol: "http",
        ip: container?.ip_address,
        port: container_port,
        container_name: container?.name,
        dockerHostName: container.nodes.node_name
      }
    )
    if (createInboundRulesResponse.data.return_code !== 0) {
      throw new Error("failed to create inbound rule on the node")
    }

    // Revalidate cache made by nextjs
    revalidatePath("/console/containers/[container_id]")

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

export async function editInboundRule({
  config_name,
  domain_name,
  container_port,
  inbound_rule_id
}: {
  config_name: string
  domain_name: string
  container_port: number
  inbound_rule_id: string
}) {
  const session = await auth()
  try {
    const validation = inbound_rules_schema.safeParse({
      config_name,
      domain_name,
      port: container_port
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

    const inbound_rule = await prisma.inbound_rules.findUnique({
      where: {
        id: inbound_rule_id,
        UserDataId: user?.UserData?.id as string
      }
    })

    if (!inbound_rule) {
      throw new Error("Inbound rule not found")
    }

    // No need to check of container exist because
    // if inbound_rule exist then it must be associated to any container.
    const container = await prisma.containers.findUnique({
      where: {
        name: inbound_rule?.containersName
      },
      include: {
        nodes: true
      }
    })

    // Task 1: Edit inbound rule on node
    const editInboundRulesResponse = await axios.post(
      INFRA_BE_URL + "/edit_nginx",
      {
        config_id: inbound_rule.id,
        domain_name: domain_name,
        // maybe changed
        protocol: "http",
        ip: container?.ip_address,
        port: container_port,
        container_name: container?.name,
        dockerHostName: container?.nodes.node_name
      }
    )
    if (editInboundRulesResponse.data.return_code !== 0) {
      throw new Error("failed to edit inbound rule on the node")
    }

    // Task 2: Update DNS record
    const update_dns_record = await CfClient.dns.records.update(
      inbound_rule.cloudflare_record_id,
      {
        type: "A",
        zone_id: inbound_rule.cloudflare_zone,
        name: domain_name,
        content: process.env.ORACLE_NODE_IP as string,
        proxied: true,
        comment: user?.UserData?.id as string
      }
    )

    // Task 3: Update inbound rule in database
    await prisma.inbound_rules.update({
      where: {
        id: inbound_rule_id,
        UserDataId: user?.UserData?.id as string
      },
      data: {
        rule_name: config_name,
        domain_name,
        port: container_port,
        cloudflare_record_id: update_dns_record.id
      }
    })

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

export async function deleteInboundRule({
  inbound_rule_id
}: {
  inbound_rule_id: string
}) {
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
    const rule = await prisma.inbound_rules.findUnique({
      where: {
        id: inbound_rule_id,
        UserDataId: user?.UserData?.id as string
      },
      include: {
        nodes: true
      }
    })
    if (!rule) {
      throw new Error("Inbound rule not found")
    }

    // Task 1: Delete inbound rule on node
    const deleteInboundRuleResponse = await axios.delete(
      INFRA_BE_URL + "/nginx",
      {
        data: {
          config_id: rule.id,
          container_name: rule?.containersName,
          dockerHostName: rule.nodes.node_name
        }
      }
    )

    if (deleteInboundRuleResponse.data.return_code !== 0) {
      throw new Error("Failed to delete inbound rule on the node")
    }

    // Task 2: Delete DNS record in cloudflare
    await CfClient.dns.records.delete(rule.cloudflare_record_id, {
      zone_id: process.env.CLOUDFLARE_ZONE_ID as string
    })

    // Task 3: Delete inbound rule in database
    await prisma.inbound_rules.delete({
      where: {
        id: inbound_rule_id
      }
    })

    // revalidate cache made by nextjs
    revalidatePath("/console/containers/[container_id]")

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
