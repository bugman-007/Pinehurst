import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PropertyTaxDocumentManager } from "./property-tax-document-manager"
import { notFound } from "next/navigation"

interface PropertyTaxDocumentsPageProps {
  params: {
    id: string
  }
}

export default async function PropertyTaxDocumentsPage({ params }: PropertyTaxDocumentsPageProps) {
  await requireAdmin()

  const propertyId = params.id

  // Fetch property data
  const properties = await db.query("SELECT * FROM properties WHERE id = ?", [propertyId])

  if (!properties || properties.length === 0) {
    notFound()
  }

  const property = properties[0]

  // Fetch tax documents
  const taxDocuments = await db.query(
    `
    SELECT * FROM property_tax_documents
    WHERE property_id = ?
    ORDER BY uploaded_at DESC
  `,
    [propertyId],
  )

  return (
    <DashboardLayout heading={`Tax Documents for ${property.parcel_id}`} subheading="Manage property tax documents">
      <div className="max-w-5xl mx-auto">
        <PropertyTaxDocumentManager propertyId={propertyId} documents={taxDocuments} />
      </div>
    </DashboardLayout>
  )
}
