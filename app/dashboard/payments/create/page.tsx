import { requireAdmin } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PaymentForm } from "./payment-form"

export default async function CreatePaymentPage() {
  await requireAdmin()

  return (
    <DashboardLayout heading="Create Payment" subheading="Add a new payment to the system">
      <div className="max-w-2xl mx-auto">
        <PaymentForm />
      </div>
    </DashboardLayout>
  )
}
