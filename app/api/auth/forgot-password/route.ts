import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { db } from "@/lib/db"
import { sendMail } from "@/lib/mail"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const users = await db.query("SELECT * FROM users WHERE email = ?", [email])

    if (!users || users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return NextResponse.json(
        { message: "If your email exists in our system, you will receive a reset link" },
        { status: 200 },
      )
    }

    // Generate a reset token
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Store the reset token in the database
    // First, check if we need to create a new table for reset tokens
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Delete any existing tokens for this user
    await db.query("DELETE FROM password_reset_tokens WHERE user_id = ?", [users[0].id])

    // Insert the new token
    await db.query("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [
      users[0].id,
      token,
      expiresAt,
    ])

    
    // In a real application, you would send an email with the reset link
    // For this example, we'll just log it to the console
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
    console.log("Password reset link:", resetLink)
    
    // For development purposes, include the token in the response
    // In production, you would NOT include this in the response
    // if (process.env.NODE_ENV === "development") {
    //     return NextResponse.json(
    //         {
    //             message: "Password reset link sent",
    //             devInfo: { token, resetLink },
    //         },
    //         { status: 200 },
    //     )
    // }
    
  console.log("111111111111111111111111111111111111111111")
  console.log(email)
    await sendMail({
        to: email,
        subject: "Password Reset Request",
        text:  `Click the following link to reset your password: ${resetLink}`,
        html: `<p>Click the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    })
    
    return NextResponse.json(
      { message: "If your email exists in our system, you will receive a reset link" },
      { status: 200 },
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
