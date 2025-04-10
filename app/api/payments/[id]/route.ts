import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const paymentId = params.id
    const { parcel_id, amount_due, amount_paid, balance, date, paid_date, method, status } = await req.json()

    // Check if payment exists
    const payment = await db.query("SELECT * FROM payments WHERE id = ?", [paymentId])

    if (!payment || payment.length === 0) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 })
    }

    // Format the date values
    const formattedDate = new Date(date).toISOString().slice(0, 19).replace("T", " ")

    // Handle paid_date based on status
    let formattedPaidDate = null
    if (status === "paid") {
      if (paid_date) {
        formattedPaidDate = new Date(paid_date).toISOString().slice(0, 19).replace("T", " ")
      }
    }

    // Update the payment
    await db.query(
      `
      UPDATE payments 
      SET 
        parcel_id = ?, 
        amount_due = ?, 
        amount_paid = ?, 
        balance = ?, 
        date = ?, 
        paid_date = ?, 
        method = ?, 
        status = ? 
      WHERE id = ?
    `,
      [parcel_id, amount_due, amount_paid, balance, formattedDate, formattedPaidDate, method, status, paymentId],
    )

    return NextResponse.json({ message: "Payment updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Payment update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

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
