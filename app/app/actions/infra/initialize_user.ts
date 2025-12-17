"use server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { headers } from "next/headers"
import { v4 as uuid } from "uuid"

export async function initializeUser({ username }: { username: string }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // create network
  // create project with network

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      }
    })

    const userDataID = uuid()

    await prisma.$transaction(async (tx) => {
      const resource_limit = await tx.resources_limit.create({
        data: {}
      })

      await tx.userData.create({
        data: {
          id: userDataID,
          userId: user?.id as string,
          resources_limitId: resource_limit.id,
          username: username,
          user_state: "ACTIVE"
        }
      })
    })

    return {
      success: true,
      message: ""
    }
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: error.message
    }
  }
}
