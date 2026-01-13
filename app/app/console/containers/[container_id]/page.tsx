import { TriangleAlert } from "lucide-react"
import { CpuUsesChart } from "./Metricscharts/CpuUses"
import { MemoryUsesChart } from "./Metricscharts/MemoryUses"
import ContainerDetailTabs from "./tabs"
import prisma from "@/lib/db"

async function ContainerDetail({
  params
}: {
  params: Promise<{
    container_id: string
  }>
}) {
  const { container_id } = await params
  const container = await prisma.containers.findUnique({
    where: {
      id: container_id
    },
    include: {
      InboundRules: {
        select: {
          id: true,
          domain_name: true,
          service_protocol: true,
          container_ip: true,
          port: true
        }
      }
    }
  })
  const inbound_rules = container?.InboundRules.map((rule) => {
    return {
      id: rule.id,
      domain_name: rule.domain_name,
      protocol: rule.service_protocol,
      container_ip: rule.container_ip,
      port: rule.port
    }
  })
  return (
    <div
      style={{
        height: "calc(100vh - 65px)",
        overflow: "auto"
      }}
      className="p-4 space-y-6"
    >
      <div className="rounded-lg md:flex md:flex-row gap-4 flex flex-col">
        <MemoryUsesChart />
        <CpuUsesChart />
      </div>

      <div>
        <ContainerDetailTabs
          container_name={container_id}
          createdAt={container?.createdAt as Date}
          nick_name={container?.name as string}
          ip_address={container?.ipAddress as string}
          inbound_rules={inbound_rules!}
        />
      </div>
    </div>
  )
}

export default ContainerDetail
