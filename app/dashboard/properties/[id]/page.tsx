import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PropertyForm } from "../property-form"
import { notFound } from "next/navigation"

interface EditPropertyPageProps {
  params: {
    id: string
  }
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  await requireAdmin()

  const propertyId = params.id

  // Fetch property data
  const properties = await db.query("SELECT * FROM properties WHERE id = ?", [propertyId])
  

  if (!properties || properties.length === 0) {
    notFound()
  }

  const property = properties[0]

  return (
    <DashboardLayout heading="Edit Property" subheading="Update property information">
      <div className="max-w-4xl mx-auto">
        <PropertyForm property={property} isEditing />
      </div>
    </DashboardLayout>
  )
}
