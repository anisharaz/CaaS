"use server"
import { auth } from "@/lib/auth"
import {
  createNetwork,
  createProject,
  setDefaultProfileNetworkAndVolume
} from "@/lib/axios"
import prisma from "@/lib/db"
import { headers } from "next/headers"
import { nanoid } from "nanoid"
export async function initializeUser({ username }: { username: string }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // create network
  const vpcID = nanoid()
  const incusProjectId = nanoid()
  await createNetwork(vpcID)
  await createProject(incusProjectId)
  await setDefaultProfileNetworkAndVolume(incusProjectId, vpcID)

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      }
    })

    await prisma.$transaction(async (tx) => {
      const ud = await tx.userData.create({
        data: {
          userId: user?.id as string,
          username: username,
          userState: "ACTIVE"
        }
      })
      await tx.vpc.create({
        data: {
          id: vpcID,
          vpcName: "default",
          UserDataId: ud.id
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
