import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DocumentUserManager } from "./document-user-manager"
import { notFound } from "next/navigation"

interface PropertyUsersPageProps {
  params: {
    id: string
  }
}

export default async function PropertyUsersPage({ params }: PropertyUsersPageProps) {
  await requireAdmin()

  const documentId = params.id

  // Fetch doucment data
  const documents = await db.query("SELECT * FROM documents WHERE id = ?", [documentId])

  if (!documents || documents.length === 0) {
    notFound()
  }

  const document = documents[0]

  // Fetch assigned users
  // const assignedUsers = await db.query(
  //   `
  //   SELECT u.id, u.name, u.email, u.role, pu.assigned_at
  //   FROM property_users pu
  //   JOIN users u ON pu.user_id = u.id
  //   WHERE pu.property_id = ?
  //   ORDER BY pu.assigned_at DESC
  // `,
  //   [documentId],
  // )

  const assignedUsers = await db.query("SELECT * FROM users WHERE id = ?", [document.user_id])
  console.log("sssssssssssssssssssssss" ,assignedUsers)

  // Fetch all customers for assignment
  const customers = await db.query(`
    SELECT id, name, email
    FROM users
    WHERE role = 'customer'
    ORDER BY name
  `)

  return (
    <DashboardLayout
      heading={`Manage Users for `}
      subheading="Assign or remove users from this property"
    >
      <div className="max-w-4xl mx-auto">
        <DocumentUserManager documentId={documentId} assignedUsers={assignedUsers} availableUsers={customers} />
      </div>
    </DashboardLayout>
  )
}
