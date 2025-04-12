import { Button } from "@/components/ui/button"
import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PropertyTable } from "./property-table"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { createPropertiesSchema } from "@/app/api/db-schema-properties"

export default async function PropertiesPage() {
  const user = await requireAdmin()

  // Ensure the schema exists
  await createPropertiesSchema()

  // Fetch properties from the database
  const properties = await db.query(`
    SELECT p.*, 
      (SELECT COUNT(*) FROM property_users pu WHERE pu.property_id = p.id) as assigned_users_count
    FROM properties p
    ORDER BY p.created_at DESC
  `)

  return (
    <DashboardLayout
      heading="Property Management"
      subheading="Manage all properties in the system"
      action={
        <Button asChild>
          <Link href="/dashboard/properties/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      }
    >
      <div className="rounded-lg border bg-card">
        <PropertyTable properties={properties} />
      </div>
    </DashboardLayout>
  )
}
