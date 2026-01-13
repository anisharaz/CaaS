"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import axios from "axios"
import { nanoid } from "nanoid"
import { headers } from "next/dist/server/request/headers"
import SshPK from "sshpk"

export async function CreateAndSaveSSHKey({ key_name }: { key_name: string }) {
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

    // Task 1: Save the SSH key to the database
    await prisma.sshKeys.create({
      data: {
        id: nanoid(),
        name: key_name,
        publicKey: "",
        UserDataId: user?.userData?.id as string
      }
    })
    return {
      success: true,
      message: "",
      public_key: ""
    }
    // eslint-disable-next-line
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: error.message,
      private_key: "",
      public_key: ""
    }
  }
}

export async function SaveSSHKey({
  key_name,
  private_key
}: {
  key_name: string
  private_key: string
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
    const public_key = SshPK.parsePrivateKey(private_key)
      .toPublic()
      .toString("ssh")

    // Task 1: Save the SSH key to the database
    await prisma.sshKeys.create({
      data: {
        id: nanoid(),
        name: key_name,
        publicKey: public_key,
        UserDataId: user?.userData?.id as string
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
