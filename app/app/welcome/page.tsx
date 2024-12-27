import { AnimatedText } from "@/components/AnimatedText";
import UsernameInput from "./username_form";

async function WelcomePage() {
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
  );
}

export default WelcomePage;
