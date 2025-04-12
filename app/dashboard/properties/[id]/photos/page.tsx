import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PropertyPhotoManager } from "./property-photo-manager"
import { notFound } from "next/navigation"

interface PropertyPhotosPageProps {
  params: {
    id: string
  }
}

export default async function PropertyPhotosPage({ params }: PropertyPhotosPageProps) {
  await requireAdmin()

  const propertyId = params.id

  // Fetch property data
  const properties = await db.query("SELECT * FROM properties WHERE id = ?", [propertyId])

  if (!properties || properties.length === 0) {
    notFound()
  }

  const property = properties[0]

  // Fetch property photos
  const photos = await db.query(
    `
    SELECT * FROM property_photos
    WHERE property_id = ?
    ORDER BY uploaded_at DESC
  `,
    [propertyId],
  )

  return (
    <DashboardLayout heading={`Photos for ${property.parcel_id}`} subheading="Manage property photos">
      <div className="max-w-5xl mx-auto">
        <PropertyPhotoManager propertyId={propertyId} photos={photos} />
      </div>
    </DashboardLayout>
  )
}
