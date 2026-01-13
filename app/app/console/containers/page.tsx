import { CreateContainer } from "./CreateContainer"
import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import ContainerTable from "./ContainerTable"
import { headers } from "next/headers"
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
