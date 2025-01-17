"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
export function ContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextThemesProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </>
  )
}
