"use server"
import prisma from "@/lib/db"
import { inbound_rules_schema } from "@/lib/zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { CfClient } from "@/lib/cloudflare"
import { headers } from "next/headers"
import { nanoid } from "nanoid"
import { addRoute, deleteRoute } from "@/lib/caddy"

export async function createInboundRule({
  domainName,
  container_port,
  config_name,
  containerId
}: {
  domainName: string
  container_port: number
  config_name: string
  containerId: string
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  try {
    const validation = inbound_rules_schema.safeParse({
      domainName: domainName,
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
        id: containerId
      }
    })

    if (!container) {
      throw new Error("Container not found")
    }

    const doesDomainAlreadyExists = await prisma.inboundRules.findUnique({
      where: {
        domainName: domainName
      }
    })

    if (doesDomainAlreadyExists) {
      throw new Error("Domain already in use")
    }

    const resCloudflare = await CfClient.dns.records.list({
      zone_id: process.env.CLOUDFLARE_ZONE_ID!,
      name: {
        startswith: domainName
      }
    })

    if (resCloudflare.result.length > 0) {
      throw new Error("Domain not available")
    }
    const routeId = nanoid()

    await addRoute({
      domainName: domainName + process.env.NEXT_PUBLIC_CLOUDFLARE_ROOT_DOMAIN,
      routeId: routeId,
      upstreamHost: container.ipAddress as string,
      upstreamPort: container_port
    })

    const create_dns = await CfClient.dns.records.create({
      type: "A",
      zone_id: process.env.CLOUDFLARE_ZONE_ID as string,
      name: domainName,
      content: process.env.INCUS_HOST_CADDY_PROXY_IP,
      proxied: true,
      comment: user?.id as string,
      ttl: 300
    })

    if (!create_dns) {
      throw new Error("Failed to create DNS record")
    }

    await prisma.inboundRules.create({
      data: {
        id: routeId,
        domainName: domainName,
        port: container_port,
        UserDataId: user?.userData?.id as string,
        containersId: container?.id as string,
        cloudflareRecordId: create_dns.id,
        name: config_name
      }
    })

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
    headers: await headers()
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

    await deleteRoute(rule.id)

    // Task 2: Delete DNS record in cloudflare
    await CfClient.dns.records.delete(rule.cloudflareRecordId, {
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
