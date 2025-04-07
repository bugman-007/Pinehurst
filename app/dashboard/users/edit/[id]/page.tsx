import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserForm } from "../../user-form"
import { notFound } from "next/navigation"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  await requireAdmin()

  const userId = params.id

  // Fetch user data
  const users = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [userId])

  if (!users || users.length === 0) {
    notFound()
  }

  const user = users[0]

  return (
    <DashboardLayout heading="Edit User" subheading="Update user information">
      <div className="max-w-2xl mx-auto">
        <UserForm user={user} isEditing />
      </div>
    </DashboardLayout>
  )
}

