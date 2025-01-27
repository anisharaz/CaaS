import { AnimatedText } from "@/components/AnimatedText"
import UsernameInput from "./username_form"
import prisma from "@/lib/db"
import { auth } from "@/auth"
import { permanentRedirect } from "next/navigation"
import { $Enums } from "@prisma/client"

async function WelcomePage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email as string
    },
    include: {
      UserData: true
    }
  })

  if (
    user?.UserData?.user_state === $Enums.USER_STATE.ACTIVE ||
    user?.UserData?.user_state === $Enums.USER_STATE.SETTING_UP
  ) {
    permanentRedirect("/console")
  }
  return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-zinc-900">
      <div className="rounded-lg p-2 shadow-2xl h-[500px] w-[700px] ">
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
