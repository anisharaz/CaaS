import { auth } from "@/auth"
import { ConsoleOptions, ConsoleContainers } from "./ConsoleHomeComponents"
import prisma from "@/lib/db"

async function ConsolePage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string
    },
    include: {
      UserData: {
        select: {
          vpc: {
            select: {
              id: true,
              vpc_name: true
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
          <ConsoleContainers vpcs={user?.UserData?.vpc} />
        </div>
      </div>
    </>
  )
}

export default ConsolePage
