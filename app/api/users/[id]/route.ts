import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id
    const { name, email, password, role } = await req.json()

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.query("SELECT * FROM users WHERE id = ?", [userId])

    if (!existingUser || existingUser.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    const emailCheck = await db.query("SELECT * FROM users WHERE email = ? AND id != ?", [email, userId])

    if (emailCheck && emailCheck.length > 0) {
      return NextResponse.json({ message: "Email already in use by another user" }, { status: 409 })
    }

    // Update user
    if (password) {
      // If password is provided, update it too
      const hashedPassword = await hash(password, 10)
      await db.query("UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?", [
        name,
        email,
        hashedPassword,
        role,
        userId,
      ])
    } else {
      // Otherwise, just update other fields
      await db.query("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?", [name, email, role, userId])
    }

    return NextResponse.json({ message: "User updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("User update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Check if user exists
    const userToDelete = await db.query("SELECT * FROM users WHERE id = ?", [userId])

    if (!userToDelete || userToDelete.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Delete the user
    await db.query("DELETE FROM users WHERE id = ?", [userId])

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("User deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

