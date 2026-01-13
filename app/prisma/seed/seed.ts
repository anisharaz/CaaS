import { nanoid } from "@/lib/utils"
import { PrismaClient } from "@/prisma/lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})
const prisma = new PrismaClient({
  adapter
})

async function main() {
  await prisma.sshProxyAvailablePorts.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      sshProxyPort: 4000 + i,
      used: false,
      id: nanoid()
    }))
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
