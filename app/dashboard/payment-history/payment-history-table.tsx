"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DateFormatter } from "@/components/date-formatter"

interface Payment {
  id: string
  amount: number
  date: string
  method: string
  status: string
}

interface PaymentHistoryTableProps {
  payments: Payment[]
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit_card":
        return "💳"
      case "paypal":
        return "🅿️"
      case "bank_transfer":
        return "🏦"
      default:
        return "💰"
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No payment history found
            </TableCell>
          </TableRow>
        ) : (
          payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">#{payment.id.substring(0, 8)}</TableCell>
              <TableCell>${payment.amount.toFixed(2)}</TableCell>
              <TableCell>
                <DateFormatter date={payment.date} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{getMethodIcon(payment.method)}</span>
                  <span className="capitalize">{payment.method.replace("_", " ")}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(payment.status)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

