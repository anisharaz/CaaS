"use server"
import { auth } from "@/lib/auth"
import {
  createNetwork,
  createProject,
  setDefaultProfileNetworkAndVolume
} from "@/lib/axios"
import prisma from "@/lib/db"
import { nanoid } from "@/lib/utils"
import { headers } from "next/headers"
export async function initializeUser({ username }: { username: string }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // create network
  const vpcID = nanoid(15)
  const incusProjectId = nanoid(15)
  console.log(vpcID, incusProjectId)
  await createProject(incusProjectId)
  await createNetwork(vpcID)
  await setDefaultProfileNetworkAndVolume(incusProjectId, vpcID)

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email as string
      },
      include: {
        userData: true
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
      await tx.incusProject.create({
        data: {
          id: incusProjectId,
          UserDataId: ud.id
        }
      })
      await tx.resourcesAndLimits.create({
        data: {
          userDataId: ud.id
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
