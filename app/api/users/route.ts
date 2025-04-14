import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const role = url.searchParams.get("role")

    let query = "SELECT id, name FROM users"
    const params = []

    if (role) {
      query += " WHERE role = ?"
      params.push(role)
    }

    const users = await db.query(query, params)

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, password, role,address,city,state,zip } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = ?", [email])

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    await db.query("INSERT INTO users (name, email, password, role ,address,city,state,zip) VALUES (?, ?, ?, ?,?,?,?,?)", [
      name,
      email,
      hashedPassword,
      role || "customer",
      address,city,state,zip
    ])

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("User creation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
