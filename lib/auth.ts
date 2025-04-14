import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

// Define the custom session type
interface CustomSession {
  user: {
    id: string
    name: string
    email: string
    role: string
    address?: string
    city?: string
    state?: string
    zip?: string
  }
}

export async function getSession(): Promise<CustomSession | null> {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Fetch complete user data from the database using the ID from the session
  try {
    const userResult = await db.query("SELECT * FROM users WHERE id = ?", [session.user.id])

    if (userResult && userResult[0]) {
      // Return complete user data
      return {
        id: userResult[0].id.toString(),
        name: userResult[0].name,
        email: userResult[0].email,
        role: userResult[0].role,
        address: userResult[0].address,
        city: userResult[0].city,
        state: userResult[0].state,
        zip: userResult[0].zip,
      }
    }

    // Fallback to session user if database query fails
    return session.user
  } catch (error) {
    console.error("Error fetching complete user data:", error)
    // Fallback to session user if database query fails
    return session.user
  }
}

export async function requireAdmin() {
  const user = await requireAuth()

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  return user
}
