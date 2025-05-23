import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PaymentTable } from "./payment-table"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { updatePaymentsTable } from "@/app/api/db-schema-update"

export default async function PaymentsPage() {
  const user = await requireAdmin()

  // Update the payments table schema if needed
  await updatePaymentsTable()

  // Fetch payments from the database with user information
  const payments = await db.query(`
  SELECT 
    p.id, 
    p.customer_id, 
    p.parcel_id, 
    p.amount_due as amount_due, 
    p.amount_paid, 
    p.balance, 
    p.date, 
    p.paid_date, 
    p.method, 
    p.status, 
    p.notes,
    u.name as customer_name
  FROM payments p
  JOIN users u ON p.customer_id = u.id
  ORDER BY p.date DESC
`)

  return (
    <DashboardLayout
      heading="Payment Management"
      subheading="Manage all payment transactions in the system"
      action={
        <Button asChild>
          <Link href="/dashboard/payments/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Payment
          </Link>
        </Button>
      }
    >
      <div className="rounded-lg border bg-card">
        <PaymentTable payments={payments} />
      </div>
    </DashboardLayout>
  )
}
