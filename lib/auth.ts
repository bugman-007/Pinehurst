import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

// Define the custom session type
interface CustomSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function getSession(): Promise<CustomSession | null> {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}
