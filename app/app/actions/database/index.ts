"use server"

import { auth } from "@/lib/auth"
import { lambdaClient } from "@/lib/aws"
import prisma from "@/lib/db"
import { InvokeCommand } from "@aws-sdk/client-lambda"
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

    const payload = {
      length: 1024
    }
    const command = new InvokeCommand({
      FunctionName: "ssh-key-gen",
      InvocationType: "RequestResponse", // synchronous
      Payload: Buffer.from(JSON.stringify(payload))
    })

    const response = await lambdaClient.send(command)
    const result: {
      body: string
    } = JSON.parse(new TextDecoder("utf-8").decode(response.Payload))

    const { private_key, public_key } = JSON.parse(result.body)

    // Task 1: Save the SSH key to the database
    await prisma.sshKeys.create({
      data: {
        id: nanoid(),
        name: key_name,
        publicKey: public_key,
        privateKey: private_key,
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
