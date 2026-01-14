"use server"
import prisma from "@/lib/db"
import { inbound_rules_schema } from "@/lib/zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { CfClient } from "@/lib/cloudflare"
import { headers } from "next/headers"
import { nanoid } from "nanoid"

export async function createInboundRule({
  domain_name,
  container_port,
  config_name,
  container_id
}: {
  domain_name: string
  container_port: number
  config_name: string
  container_id: string
}) {
  const session = await auth.api.getSession({
    header: await headers()
  })
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
        userData: true
      }
    })

    const container = await prisma.containers.findUnique({
      where: {
        id: container_id
      }
    })

    if (!container) {
      throw new Error("Container not found")
    }

    const doesDomainAlreadyExists = await prisma.inboundRules.findUnique({
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
        comment: user?.id as string,
        ttl: 300
      })

      if (!create_dns) {
        throw new Error("Failed to create DNS record")
      }
    }

    // Task 2: Create Inbound rule in database
    const res = await prisma.inboundRules.create({
      data: {
        id: nanoid(),
        domain_name: domain_name,
        service_protocol: "http",
        container_ip: container?.ipAddress as string,
        port: container_port,
        UserDataId: user?.userData?.id as string,
        containersId: container?.id as string,
        cloudflare_record_id: create_dns.id as string,
        cloudflare_zone: process.env.CLOUDFLARE_ZONE_ID as string
      }
    })

    // Task 3: Create Inbound rule on the node
    //  TODO: use caddy api
    // async function addTcpForward({
    //   adminUrl, // e.g. "https://caddy_host:2020"
    //   serverName, // e.g. "tcp_2222"
    //   listenPort, // e.g. 2222
    //   targetIp, // e.g. "10.22.0.12"
    //   targetPort // e.g. 22
    // }: {
    //   adminUrl: string
    //   serverName: string
    //   listenPort: number
    //   targetIp: string
    //   targetPort: number
    // }) {
    //   const payload = {
    //     [serverName]: {
    //       listen: [`:${listenPort}`],
    //       routes: [
    //         {
    //           handle: [
    //             {
    //               handler: "proxy",
    //               upstreams: [
    //                 {
    //                   dial: [`${targetIp}:${targetPort}`]
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   }

    //   const res = await fetch(`${adminUrl}/config/apps/layer4/servers`, {
    //     method: "PATCH",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(payload)
    //   })

    //   if (!res.ok) {
    //     const text = await res.text()
    //     throw new Error(`Caddy API error: ${text}`)
    //   }

    //   return res.json()
    // }

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

export async function deleteInboundRule({
  inbound_rule_id
}: {
  inbound_rule_id: string
}) {
  const session = await auth.api.getSession({
    header: await headers()
  })
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      },
      include: {
        userData: true
      }
    })
    const rule = await prisma.inboundRules.findUnique({
      where: {
        id: inbound_rule_id,
        UserDataId: user?.userData?.id as string
      }
    })
    if (!rule) {
      throw new Error("Inbound rule not found")
    }

    // Task 1: Delete inbound rule on node
    // use caddy api

    // Task 2: Delete DNS record in cloudflare
    await CfClient.dns.records.delete(rule.cloudflare_record_id, {
      zone_id: process.env.CLOUDFLARE_ZONE_ID as string
    })

    // Task 3: Delete inbound rule in database
    await prisma.inboundRules.delete({
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
