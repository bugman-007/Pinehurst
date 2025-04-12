import { requireAdmin } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PropertyForm } from "../property-form"

export default async function CreatePropertyPage() {
  await requireAdmin()

  return (
    <DashboardLayout heading="Create Property" subheading="Add a new property to the system">
      <div className="max-w-4xl mx-auto">
        <PropertyForm />
      </div>
    </DashboardLayout>
  )
}
