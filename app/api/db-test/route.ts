import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    // Only allow admins to test the connection
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const result = await db.testConnection()

    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ message: result.message, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("DB test error:", error)
    return NextResponse.json(
      { message: "Error testing database connection", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

