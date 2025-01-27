import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function main() {
  const node = await prisma.nodes.create({
    data: {
      node_name: "docker_host_vm",
      node_ip: "192.168.122.2",
      node_type: "FREE"
    }
  })

  function networkAddressGenerator() {
    const temp = []
    for (let i = 0; i <= 50; i++) {
      temp.push({
        nodeId: node.id,
        network: `15.0.${i}.0`,
        cidr: `15.0.${i}.0/24`,
        gateway: `15.0.${i}.1`,
        used: false
      })
    }
    return temp
  }
  await prisma.available_vpc.createMany({
    data: networkAddressGenerator()
  })

  function PortNumberGenerator(): {
    ssh_proxy_node_name: string
    ssh_proxy_port: number
    used: boolean
  }[] {
    const temp = []
    for (let i = 2000; i <= 2200; i++) {
      temp.push({
        ssh_proxy_node_name: "ssh_proxy",
        ssh_proxy_port: i,
        used: false
      })
    }
    return temp
  }
  await prisma.available_ssh_proxy_ports.createMany({
    data: PortNumberGenerator()
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
