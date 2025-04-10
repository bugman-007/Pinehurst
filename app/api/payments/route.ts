import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { customer_id, parcel_id, amount_due, amount_paid, balance, date, paid_date, method, status } =
      await req.json()

    // Update validation to accept the new status values
    // Validate input
    if (!customer_id || !amount_due || !amount_paid || !method || !status) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Format the date values
    const formattedDate = new Date(date).toISOString().slice(0, 19).replace("T", " ")

    // Remove the automatic status logic
    // Handle paid_date based on status
    let formattedPaidDate = null
    if (status === "paid" && paid_date) {
      formattedPaidDate = new Date(paid_date).toISOString().slice(0, 19).replace("T", " ")
    }

    // Create payment
    await db.query(
      `
      INSERT INTO payments (
        customer_id, 
        parcel_id, 
        amount_due, 
        amount_paid, 
        balance, 
        date, 
        paid_date, 
        method, 
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [customer_id, parcel_id, amount_due, amount_paid, balance, formattedDate, formattedPaidDate, method, status],
    )

    return NextResponse.json({ message: "Payment created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
