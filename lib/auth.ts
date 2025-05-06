import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

// Define the custom session user type
export interface CustomSessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

export interface CustomSession {
  user: CustomSessionUser;
}

// ✅ 1. Always call in async function context
export async function getSession(): Promise<CustomSession | null> {
  try {
    const session = await getServerSession(authOptions);
    return session as CustomSession;
  } catch (err) {
    console.error("Failed to get session:", err);
    return null;
  }
}

// ✅ 2. Get current user (can be called in pages/APIs)
export async function getCurrentUser(): Promise<CustomSessionUser | null> {
  const session = await getSession();
  return session?.user || null;
}

// ✅ 3. Require user (redirects if not logged in)
export async function requireAuth(): Promise<CustomSessionUser> {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin"); // Only use in Server Components
  }

  try {
    const [result]: any[] = await db.query("SELECT * FROM users WHERE id = ?", [session.user.id]);

    if (result) {
      return {
        id: result.id.toString(),
        name: result.name,
        email: result.email,
        role: result.role,
        address: result.address,
        city: result.city,
        state: result.state,
        zip: result.zip,
      };
    }

    return session.user;
  } catch (err) {
    console.error("Error fetching full user from DB:", err);
    return session.user;
  }
}

// ✅ 4. Require admin (redirects if not admin)
export async function requireAdmin(): Promise<CustomSessionUser> {
  const user = await requireAuth();

  if (user.role !== "admin") {
    redirect("/dashboard"); // Use this only in Server Component route
  }

  return user;
}
