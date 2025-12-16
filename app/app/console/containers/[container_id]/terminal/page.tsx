import { Separator } from "@/components/ui/separator"
import prisma from "@/lib/db"
import dynamic from "next/dynamic"

const TerminalComponent = dynamic(() => import("./terminal"), {
  ssr: false
})

async function Terminal({
  params
}: {
  params: Promise<{
    container_id: string
  }>
}) {
  const { container_id } = await params
  const container = await prisma.containers.findUnique({
    where: {
      name: container_id
    },
    include: {
      vpc: true
    }
  })
  return (
    <div>
      <div className="overflow-hidden rounded-sm">
        <TerminalComponent />
      </div>
      <div className="text-xl p-2 space-y-4 ">
        <Separator />
        <div>VPC - {container?.vpc.vpc_name}</div>
        <Separator />
        <div>Container Nick Name - {container?.nick_name}</div>
        <Separator />
        <div>Internal IP - {container?.ip_address}</div>
        <Separator />
      </div>
    </div>
  )
}

export default Terminal
