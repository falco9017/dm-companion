import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = (credentials.email as string).toLowerCase().trim()
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      // Always refresh subscription tier from DB so JWT never goes stale.
      // This ensures chat UI, campaign limits, and all enforcement are consistent.
      const userId = token.id as string
      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { subscriptionTier: true, subscriptionStatus: true, subscriptionPeriodEnd: true },
        })
        if (dbUser) {
          let effectiveTier = 'basic'
          if (dbUser.subscriptionTier === 'pro') {
            if (dbUser.subscriptionStatus === 'active' || dbUser.subscriptionStatus === 'trialing' || dbUser.subscriptionStatus === 'past_due') {
              effectiveTier = 'pro'
            } else if (dbUser.subscriptionStatus === 'canceled' && dbUser.subscriptionPeriodEnd && dbUser.subscriptionPeriodEnd > new Date()) {
              effectiveTier = 'pro'
            }
          }
          token.subscriptionTier = effectiveTier
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.subscriptionTier = (token.subscriptionTier as string) || 'basic'
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/campaigns'
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
})
