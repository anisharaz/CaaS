import { auth } from "@/lib/auth"
import { ConsoleOptions, ConsoleContainers } from "./ConsoleHomeComponents"
import prisma from "@/lib/db"
import { headers } from "next/headers"
import { permanentRedirect } from "next/navigation"

async function ConsolePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    permanentRedirect("/auth/login")
  }
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string
    },
    include: {
      userData: {
        select: {
          Vpc: {
            select: {
              id: true,
              vpcName: true
            }
          }
        }
      }
    }
  })

  return (
    <>
      <div className="2xl:max-w-(--breakpoint-2xl) xl:max-w-(--breakpoint-xl) lg:max-w-(--breakpoint-lg) md:space-y-6 space-y-2 md:m-auto mx-2">
        <div className="text-2xl md:text-4xl font-bold md:mt-4 mt-2">
          Console Home
        </div>
        <div className="md:grid grid-cols-2 gap-4">
          <ConsoleOptions />
          <ConsoleContainers vpcs={user?.userData?.Vpc} />
        </div>
      </div>
    </>
  )
}

export default ConsolePage
