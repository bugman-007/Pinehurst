import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 })
    }

    // Check if the token exists and is not expired
    const tokens = await db.query(
      `
      SELECT * FROM password_reset_tokens 
      WHERE token = ? AND expires_at > NOW()
    `,
      [token],
    )

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
    }

    return NextResponse.json({ message: "Token is valid" }, { status: 200 })
  } catch (error) {
    console.error("Verify reset token error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
