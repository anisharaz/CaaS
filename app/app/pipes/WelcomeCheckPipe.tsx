import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { USER_STATE } from "@/prisma/lib/generated/prisma/client"
import { headers } from "next/headers"
import { permanentRedirect } from "next/navigation"

async function WelcomeCheckPipe({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string
    },
    include: {
      userData: true
    }
  })

  if (!user?.userData) {
    permanentRedirect("/welcome")
  }
  if (user?.userData?.userState === USER_STATE.SETTING_UP) {
    return (
      <>
        <div>setting up user account</div>
      </>
    )
  }
  return <>{children}</>
}

export default WelcomeCheckPipe
