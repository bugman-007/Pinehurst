import { requireAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { notFound } from "next/navigation"

interface EditPropertyPageProps {
  params: {
    id: string
  }
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  await requireAdmin()


  return (
    <DashboardLayout heading="Edit Property" subheading="Update property information">
    </DashboardLayout>
  )
}
