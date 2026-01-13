import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { headers } from "next/headers"
import { NextRequest } from "next/server"
export const fetchCache = "force-no-store"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const searchParams = request.nextUrl.searchParams
  const vpc_id = searchParams.get("vpc_id")
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string
    },
    include: {
      userData: true
    }
  })
  const containers = await prisma.containers.findMany({
    where: {
      UserDataId: user?.userData?.id as string,
      Vpc: {
        id: vpc_id as string
      }
    },
    include: {
      SshPort: true
    }
  })
  return Response.json(
    containers.map((container) => {
      return {
        container_id: container.id,
        container_name: container.name,
        container_ip: container.ipAddress,
        created_at: container.createdAt,
        ssh_port: container.SshPort?.sshProxyPort,
        status: container.state
      }
    })
  )
}
