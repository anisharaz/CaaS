import { auth } from "@/auth"
import prisma from "@/lib/db"
import { $Enums } from "@prisma/client"
import { permanentRedirect } from "next/navigation"

async function WelcomeCheckPipe({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string
    },
    include: {
      UserData: true
    }
  })

  if (!user?.UserData) {
    permanentRedirect("/welcome")
  }
  if (user?.UserData?.user_state === $Enums.USER_STATE.SETTING_UP) {
    return (
      <>
        <div>setting up user account</div>
      </>
    )
  }
  return <>{children}</>
}

export default WelcomeCheckPipe
