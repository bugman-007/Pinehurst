import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserTable } from "./user-table"
import Link from "next/link"
import { UserPlus } from "lucide-react"

export default async function UsersPage() {
  const user = await requireAdmin()

  // Fetch users from the database
  const users = await db.query("SELECT id, name, email, role FROM users")

  return (
    <DashboardLayout
      heading="User Management"
      subheading="Manage users and their access permissions"
      action={
        <Button asChild>
          <Link href="/dashboard/users/create">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      }
    >
      <div className="rounded-lg border bg-card">
        <UserTable users={users} />
      </div>
    </DashboardLayout>
  )
}

