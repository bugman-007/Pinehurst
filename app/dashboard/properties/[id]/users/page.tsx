import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PropertyUserManager } from "./property-user-manager"
import { notFound } from "next/navigation"

interface PropertyUsersPageProps {
  params: {
    id: string
  }
}

export default async function PropertyUsersPage({ params }: PropertyUsersPageProps) {
  await requireAdmin()

  const propertyId = params.id

  // Fetch property data
  const properties = await db.query("SELECT * FROM properties WHERE id = ?", [propertyId])

  if (!properties || properties.length === 0) {
    notFound()
  }

  const property = properties[0]

  // Fetch assigned users
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

  // Fetch all customers for assignment
  const customers = await db.query(`
    SELECT id, name, email
    FROM users
    WHERE role = 'customer'
    ORDER BY name
  `)

  return (
    <DashboardLayout
      heading={`Manage Users for ${property.parcel_id}`}
      subheading="Assign or remove users from this property"
    >
      <div className="max-w-4xl mx-auto">
        <PropertyUserManager propertyId={propertyId} assignedUsers={assignedUsers} availableUsers={customers} />
      </div>
    </DashboardLayout>
  )
}
