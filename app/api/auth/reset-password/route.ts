import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
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

    const userId = tokens[0].user_id

    // Hash the new password
    const hashedPassword = await hash(password, 10)

    // Update the user's password
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId])

    // Delete the used token
    await db.query("DELETE FROM password_reset_tokens WHERE token = ?", [token])

    return NextResponse.json({ message: "Password reset successful" }, { status: 200 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
