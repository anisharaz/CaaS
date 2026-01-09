import { AnimatedText } from "@/components/AnimatedText"
import UsernameInput from "./username_form"
import prisma from "@/lib/db"
import { permanentRedirect } from "next/navigation"
import { USER_STATE } from "@/prisma/lib/generated/prisma/enums"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

async function WelcomePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    permanentRedirect("/auth/login")
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string
    },
    include: {
      userData: true
    }
  })

  if (
    user?.userData?.userState === USER_STATE.ACTIVE ||
    user?.userData?.userState === USER_STATE.SETTING_UP
  ) {
    permanentRedirect("/console")
  }
  return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-zinc-900">
      <div className="rounded-lg p-2 shadow-2xl h-125 w-175 ">
        <div className="flex flex-col items-center">
          <AnimatedText text="Welcome ✨" type="calmInUp" />
          <div className="text-xl">Lets start by selecting a username</div>
          <UsernameInput />
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
