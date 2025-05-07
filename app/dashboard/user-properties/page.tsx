import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserPropertyList } from "./user-property-list"
// import PaymentHistoryPage from "../payment-history/page"
// import DocumentsPage from "../documents/page"
// import PaymentsPage from "../payments/page"

export default async function UserPropertiesPage() {
  const user = await requireAuth()

  // Fetch properties assigned to the user
  const properties = await db.query(
    `
    SELECT p.*, pu.assigned_at
    FROM properties p
    JOIN property_users pu ON p.id = pu.property_id
    WHERE pu.user_id = ?
    ORDER BY pu.assigned_at DESC
  `,
    [user.id],
  )

  return (
    <DashboardLayout heading="My Properties" subheading="View properties assigned to you">
      <div className=" mx-auto">
        <UserPropertyList properties={properties} />
      </div>
      
    </DashboardLayout>
  )
}