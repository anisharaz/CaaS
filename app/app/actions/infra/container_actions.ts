"use server"
import prisma from "@/lib/db"
import { auth } from "@/lib/auth"
import { v4 } from "uuid"
import { headers } from "next/headers"

export async function createContainer({
  container_name,
  vpc_id,
  ssh_key_id
}: {
  container_name: string
  vpc_id: string
  ssh_key_id: string
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  try {
    return {
      success: true,
      message: "Container scheduled Successfully"
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error)
    return {
      success: false,
      message: error.message
    }
  }
}
