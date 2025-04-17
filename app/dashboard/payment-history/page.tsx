import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardLayout } from "@/components/dashboard-layout";
import { PaymentHistoryTable } from "./payment-history-table";

export default async function PaymentHistoryPage() {
  const user = await requireAuth();

  // Fetch payments for the current user
  const payments = await db.query(
    `
    SELECT p.id, p.amount, p.date, p.method, p.status
    FROM payments p
    WHERE p.customer_id = ?
    ORDER BY p.date DESC
  `,
    [user.id]
  );

  return (
    <div>
      <DashboardLayout
        heading="Payment History"
        subheading="View your payment history and transaction details"
      >
        <div className="flex justify-between items-center m-4">
          <h1 className="text-2xl font-bold">Payment History</h1>
        </div>
        <div className="rounded-lg border bg-card">
          <PaymentHistoryTable payments={payments} />
        </div>
      </DashboardLayout>
    </div>
  );
}
