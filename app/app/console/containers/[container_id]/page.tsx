import { notFound } from "next/navigation"
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
          domainName: true,
          port: true,
          name: true
        }
      }
    }
  })

  if (!container) {
    notFound()
  }

  const inbound_rules = container?.InboundRules.map((rule) => {
    return {
      id: rule.id,
      domainName: rule.domainName,
      port: rule.port,
      ruleName: rule.name
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
      {/* <div className="rounded-lg md:flex md:flex-row gap-4 flex flex-col">
        <MemoryUsesChart />
        <CpuUsesChart />
      </div> */}

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
