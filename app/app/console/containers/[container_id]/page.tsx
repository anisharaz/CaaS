import { TriangleAlert } from "lucide-react"
import { CpuUsesChart } from "./Metricscharts/CpuUses"
import { MemoryUsesChart } from "./Metricscharts/MemoryUses"
import ContainerDetailTabs from "./tabs"
import prisma from "@/lib/db"
import { ContainerMetricsContextProvider } from "@/context/ContainerMetricsContext"

async function ContainerDetail({
  params
}: {
  params: {
    container_id: string
  }
}) {
  const container = await prisma.containers.findUnique({
    where: {
      name: params.container_id
    },
    include: {
      inbound_rules: {
        select: {
          id: true,
          rule_name: true,
          domain_name: true,
          service_protocol: true,
          container_ip: true,
          port: true
        }
      }
    }
  })
  const inbound_rules = container?.inbound_rules.map((rule) => {
    return {
      id: rule.id,
      config_name: rule.rule_name,
      domain_name: rule.domain_name,
      protocol: rule.service_protocol,
      container_ip: rule.container_ip,
      port: rule.port
    }
  })
  return (
    <ContainerMetricsContextProvider container_id={params.container_id}>
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
        <div className="flex items-center gap-6 border-2 rounded-lg max-h-fit p-4 text-sm text-sky-400">
          <TriangleAlert className="h-8 w-8" />
          <div>
            <p className="text-lg md:text-2xl font-bold">Info! </p>
            <p className="md:text-lg">
              The ram uses is slightly inaccurate due to the limitations of
              docker API.
            </p>
            <p className="">
              The graph shows uses during 30s. Do not assume the uses based on
              the graph height, hover to see actual value.
            </p>
          </div>
        </div>
        <div>
          <ContainerDetailTabs
            container_name={params.container_id}
            createdAt={container?.createdAt as Date}
            nick_name={container?.nick_name as string}
            ip_address={container?.ip_address as string}
            node={container?.node as string}
            image={container?.image + ":" + container?.tag}
            inbound_rules={inbound_rules!}
          />
        </div>
      </div>
    </ContainerMetricsContextProvider>
  )
}

export default ContainerDetail
