import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const paymentId = params.id

    // Check if payment exists
    const payment = await db.query("SELECT * FROM payments WHERE id = ?", [paymentId])

    if (!payment || payment.length === 0) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    // Delete the payment
    await db.query("DELETE FROM payments WHERE id = ?", [paymentId])

    return NextResponse.json({ message: "Payment deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Payment deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

