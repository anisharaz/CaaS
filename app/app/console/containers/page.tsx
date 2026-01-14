import { CreateContainer } from "./CreateContainer"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import ContainerTable from "./ContainerTable"
import { headers } from "next/headers"
import { AlertTriangle } from "lucide-react"
async function ContainersPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string
    },
    include: {
      userData: {
        select: {
          id: true,
          Vpc: {
            select: {
              id: true,
              vpcName: true
            }
          },
          SshKeys: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  })

  const user_vpc = await prisma.vpc.findMany({
    where: {
      UserDataId: user?.userData?.id
    },
    select: {
      id: true,
      vpcName: true
    }
  })

  return (
    <div
      style={{ height: "calc(100vh - 65px)" }}
      className="lg:overflow-auto md:p-6 p-2 space-y-4"
    >
      <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-200">
          <span className="font-semibold">Demo Limitations:</span> A maximum of
          2 containers are allowed per user. All containers are automatically
          deleted after <strong>30 minutes</strong> to conserve resources.
        </div>
      </div>
      <div className="text-2xl font-bold flex justify-between items-center">
        <div>Containers</div>
        <div>
          <CreateContainer
            vpcs={user?.userData?.Vpc}
            ssh_keys={user?.userData?.SshKeys}
          />
        </div>
      </div>
      <div className="md:p-6 p-2 space-y-4 border-2 rounded-xl">
        <ContainerTable vpcs={user_vpc} />
      </div>
    </div>
  )
}

export default ContainersPage
