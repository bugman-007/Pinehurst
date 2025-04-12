import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const propertyId = params.id

    // Check if property exists
    const property = await db.query("SELECT * FROM properties WHERE id = ?", [propertyId])

    if (!property || property.length === 0) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    // Get assigned users
    const assignedUsers = await db.query(
      `
      SELECT u.id, u.name, u.email, u.role, pu.assigned_at
      FROM property_users pu
      JOIN users u ON pu.user_id = u.id
      WHERE pu.property_id = ?
      ORDER BY pu.assigned_at DESC
    `,
      [propertyId],
    )

    return NextResponse.json({ users: assignedUsers }, { status: 200 })
  } catch (error) {
    console.error("Property users fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const propertyId = params.id
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Check if property exists
    const property = await db.query("SELECT * FROM properties WHERE id = ?", [propertyId])

    if (!property || property.length === 0) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    // Check if user exists
    const userCheck = await db.query("SELECT * FROM users WHERE id = ?", [userId])

    if (!userCheck || userCheck.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if assignment already exists
    const existingAssignment = await db.query("SELECT * FROM property_users WHERE property_id = ? AND user_id = ?", [
      propertyId,
      userId,
    ])

    if (existingAssignment && existingAssignment.length > 0) {
      return NextResponse.json({ message: "User is already assigned to this property" }, { status: 409 })
    }

    // Create the assignment
    await db.query("INSERT INTO property_users (property_id, user_id) VALUES (?, ?)", [propertyId, userId])

    return NextResponse.json({ message: "User assigned to property successfully" }, { status: 201 })
  } catch (error) {
    console.error("Property user assignment error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const propertyId = params.id
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Check if assignment exists
    const existingAssignment = await db.query("SELECT * FROM property_users WHERE property_id = ? AND user_id = ?", [
      propertyId,
      userId,
    ])

    if (!existingAssignment || existingAssignment.length === 0) {
      return NextResponse.json({ message: "User is not assigned to this property" }, { status: 404 })
    }

    // Delete the assignment
    await db.query("DELETE FROM property_users WHERE property_id = ? AND user_id = ?", [propertyId, userId])

    return NextResponse.json({ message: "User removed from property successfully" }, { status: 200 })
  } catch (error) {
    console.error("Property user removal error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
