import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  ...authConfig,
  // callbacks: {
  //   // this function determines if the user is allowed to signing or not, it runs before the user is created in the database
  //   async signIn({ user, account, profile, email, credentials }) {
  //     return true;
  //   },
  // },
});
