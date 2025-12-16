import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { createAuthMiddleware } from "better-auth/api"
import prisma from "./db"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  secret: process.env.BETTER_AUTH_SECRET || "xyz",
  user: {
    additionalFields: {
      completedSignup: {
        type: "string",
        defaultValue: "false",
        required: true,
        input: false
      }
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession
      if (newSession) {
        const user = await prisma.user.findUnique({
          where: {
            id: newSession.user.id
          }
        })
        if (user?.completedSignup === "false") {
          ctx.redirect(`/welcome`)
        }
      }
    })
  }
})
