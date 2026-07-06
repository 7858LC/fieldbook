import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { business: true },
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          businessId: user.businessId,
          businessName: user.business?.name ?? null,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        const u = user as { businessId?: string | null; businessName?: string | null; role?: string }
        token.businessId = u.businessId ?? null
        token.businessName = u.businessName ?? null
        token.role = u.role ?? "OWNER"
      }
      // Refresh from DB on token refresh (covers Google OAuth users)
      if (token.id && !token.businessId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { business: true },
        })
        token.businessId = dbUser?.businessId ?? null
        token.businessName = dbUser?.business?.name ?? null
        token.role = dbUser?.role ?? "OWNER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.businessId = token.businessId as string | null
        session.user.businessName = token.businessName as string | null
        session.user.role = token.role as string
      }
      return session
    },
  },
}
