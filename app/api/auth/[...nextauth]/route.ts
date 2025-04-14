import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await db.query("SELECT * FROM users WHERE email = ?", [credentials.email])

          if (!user || !user[0]) {
            return null
          }

          const passwordMatch = await compare(credentials.password, user[0].password)

          if (!passwordMatch) {
            return null
          }

          return {
            id: user[0].id.toString(),
            name: user[0].name,
            email: user[0].email,
            role: user[0].role,
            address: user[0].address,
            city: user[0].city,
            state: user[0].state,
            zip: user[0].zip,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add all user properties to the token
        token.id = user.id
        token.name = user.name 
        token.email = user.email
        token.role = user.role
        token.address = user.address
        token.city = user.city
        token.state = user.state
        token.zip = user.zip
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // Add all token properties to the session.user
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as string
        session.user.address = token.address as string
        session.user.city = token.city as string
        session.user.state = token.state as string
        session.user.zip = token.zip as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
