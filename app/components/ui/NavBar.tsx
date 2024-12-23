"use client";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function NavBar() {
  const { setTheme, theme } = useTheme();
  const [themeValue, setThemeValue] = useState("dark");
  useEffect(() => {
    const val = localStorage.getItem("theme");
    if (val) {
      setThemeValue(val);
    }
  }, [theme]);
  return (
    <nav className="bg-white border-gray-400 border-b dark:border-zinc-900 dark:bg-black">
      <div className="flex flex-wrap items-center justify-between mx-auto md:px-4 px-2 py-2">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image
            src={`https://static.aaraz.me/caas/logo_${themeValue}.svg`}
            className="w-16"
            height={100}
            width={100}
            alt="caas"
          />
        </a>
        <Sheet>
          <SheetTrigger className="md:hidden px-2">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </SheetTrigger>
          <SheetContent>
            {/* <SheetHeader>
              <SheetTitle>Are you absolutely sure?</SheetTitle>
              <SheetDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </SheetDescription>
            </SheetHeader> */}
            <div className="flex flex-col gap-6 ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="text-[28px] font-bold">Menu</div>
              <Link
                href={"/docs"}
                className="text-lg text-blue-500 hover:text-blue-800 underline-offset-2 hover:underline"
              >
                Docs
              </Link>
              <Link
                href={"/console"}
                className="text-lg text-blue-500 hover:text-blue-800 underline-offset-2 hover:underline"
              >
                My Console
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden w-full md:block md:w-auto " id="navbar-default">
          <ul className="font-medium flex flex-col items-center p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:flex-row md:space-x-6 rtl:space-x-reverse md:mt-0 md:border-0">
            <li>
              <Link
                href={"/docs"}
                className="py-2 px-3 text-blue-500 hover:text-blue-800 underline-offset-2 hover:underline"
              >
                Docs
              </Link>
            </li>
            <li>
              <Link
                href={"/console"}
                className="py-2 px-3 text-blue-500 hover:text-blue-800 underline-offset-2 hover:underline"
              >
                My Console
              </Link>
            </li>
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
