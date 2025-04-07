import { DashboardLayout } from "@/components/dashboard-layout"
import { DocumentUploadForm } from "./document-upload-form"
import { requireAuth } from "@/lib/auth"

export default async function UploadDocumentPage() {
  await requireAuth()

  return (
    <DashboardLayout heading="Upload Document" subheading="Upload a new document to your account">
      <div className="mx-auto max-w-md">
        <DocumentUploadForm />
      </div>
    </DashboardLayout>
  )
}

