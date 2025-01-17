"use server"

import { auth } from "@/auth"
import prisma from "@/lib/db"
import { INFRA_BE_URL } from "@/lib/vars"
import axios from "axios"
import SshPK from "sshpk"

export async function CreateAndSaveSSHKey({ key_name }: { key_name: string }) {
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
    const { data, status } = await axios.get(INFRA_BE_URL + "/gensshkey")
    if (status !== 200) {
      throw new Error("SSH Key backend is down")
    }

    // Task 1: Save the SSH key to the database
    await prisma.ssh_keys.create({
      data: {
        nick_name: key_name,
        public_key: data.public_key,
        private_key: data.private_key,
        UserDataId: user?.UserData?.id as string
      }
    })
    return {
      success: true,
      message: "",
      private_key: data.private_key,
      public_key: data.public_key
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
    const public_key = SshPK.parsePrivateKey(private_key)
      .toPublic()
      .toString("ssh")

    // Task 1: Save the SSH key to the database
    await prisma.ssh_keys.create({
      data: {
        nick_name: key_name,
        public_key: public_key,
        private_key: private_key,
        UserDataId: user?.UserData?.id as string
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

export async function deleteSSHKey({ id }: { id: string }) {
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
    await prisma.ssh_keys.delete({
      where: {
        id: id,
        UserDataId: user?.UserData?.id as string
      }
    })
    return {
      success: true,
      message: "Deleted ssh key successfully"
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
