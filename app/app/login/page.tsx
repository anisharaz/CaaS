"use client";

import NavBar from "@/components/ui/NavBar";
import { AnimatedBeamMultipleOutputDemo } from "@/components/AnimatedBeamMultiple";
// import { FaGoogle } from "react-icons/fa";

function Home() {
  return (
    <main style={{ height: "calc(100% - 80px)" }}>
      <div>
        <NavBar />
      </div>
      <section
        className="grid w-full lg:grid-cols-2"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <div>
          <AnimatedBeamMultipleOutputDemo />
        </div>
        <div className="border col-span-1">
          {/* form component */}
          <div className="absolute top-96 right-72 flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center">Get Started</h1>
            {/* <h3>Enter your email below to create your account</h3> */}
            {/* <input
              type="email"
              placeholder="name@example.com"
              className="py-2 px-1 border w-full rounded-md"
            /> */}
            <button className="px-6 border-2 w-full py-2 rounded-lg flex items-center gap-4 hover:bg-sky-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="24px"
                height="24px"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Continue with Google
            </button>
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or Continue with
                </span>
              </div>
            </div> */}

            {/* <button className="flex items-center justify-center py-2 gap-4 border rounded-md">
              <FaGithub className="text-2xl" />
              Github
            </button> */}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
