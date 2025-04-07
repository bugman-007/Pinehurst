import { requireAdmin } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { UserForm } from "../user-form"

export default async function CreateUserPage() {
  await requireAdmin()

  return (
    <DashboardLayout heading="Create User" subheading="Add a new user to the system">
      <div className="max-w-2xl mx-auto">
        <UserForm />
      </div>
    </DashboardLayout>
  )
}

