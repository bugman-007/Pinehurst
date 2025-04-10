"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Pencil, Trash, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { DateFormatter } from "@/components/date-formatter"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Payment {
  id: string
  customer_id: string
  customer_name: string
  parcel_id: string
  amount_due: number
  amount_paid: number
  balance: number
  date: string
  paid_date: string | null
  method: string
  status: string
}

interface PaymentTableProps {
  payments: Payment[]
}

export function PaymentTable({ payments: initialPayments }: PaymentTableProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedPayment, setEditedPayment] = useState<Payment | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleEdit = (payment: Payment) => {
    setEditingId(payment.id)
    setEditedPayment({ ...payment })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditedPayment(null)
  }

  const handleInputChange = (field: keyof Payment, value: string | number) => {
    if (!editedPayment) return

    let updatedPayment = { ...editedPayment, [field]: value }

    // Recalculate balance when amount_due or amount_paid changes
    if (field === "amount_due" || field === "amount_paid") {
      const amountDue = field === "amount_due" ? Number(value) : editedPayment.amount_due

      const amountPaid = field === "amount_paid" ? Number(value) : editedPayment.amount_paid

      const balance = Math.max(0, amountDue - amountPaid)

      updatedPayment = {
        ...updatedPayment,
        balance,
        status: balance <= 0 ? "paid" : "pending",
      }
    }

    setEditedPayment(updatedPayment)
  }

  const handleSaveEdit = async () => {
    if (!editedPayment) return

    try {
      const response = await fetch(`/api/payments/${editedPayment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedPayment),
      })

      if (!response.ok) {
        throw new Error("Failed to update payment")
      }

      // Update the payments list with the edited payment
      setPayments(payments.map((p) => (p.id === editedPayment.id ? editedPayment : p)))

      toast({
        title: "Success",
        description: "Payment updated successfully",
      })

      setEditingId(null)
      setEditedPayment(null)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update payment",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (paymentId: string) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      setIsDeleting(paymentId)

      try {
        const response = await fetch(`/api/payments/${paymentId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete payment")
        }

        toast({
          title: "Success",
          description: "Payment deleted successfully",
        })

        // Remove the deleted payment from the list
        setPayments(payments.filter((p) => p.id !== paymentId))
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete payment",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Parcel ID</TableHead>
            <TableHead>Amount Due</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Paid Date</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                No payments found
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                {editingId === payment.id && editedPayment ? (
                  // Editing mode
                  <>
                    <TableCell>{payment.customer_name}</TableCell>
                    <TableCell>
                      <Input
                        value={editedPayment.parcel_id}
                        onChange={(e) => handleInputChange("parcel_id", e.target.value)}
                        className="w-full max-w-[120px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editedPayment.amount_due}
                        onChange={(e) => handleInputChange("amount_due", Number.parseFloat(e.target.value))}
                        className="w-full max-w-[100px]"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editedPayment.amount_paid}
                        onChange={(e) => handleInputChange("amount_paid", Number.parseFloat(e.target.value))}
                        className="w-full max-w-[100px]"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>${editedPayment.balance}</TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={new Date(editedPayment.date).toISOString().split("T")[0]}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        className="w-full max-w-[130px]"
                      />
                    </TableCell>
                    <TableCell>
                      {editedPayment.status === "paid" ? (
                        <Input
                          type="date"
                          value={
                            editedPayment.paid_date ? new Date(editedPayment.paid_date).toISOString().split("T")[0] : ""
                          }
                          onChange={(e) => handleInputChange("paid_date", e.target.value)}
                          className="w-full max-w-[130px]"
                        />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={editedPayment.method}
                        onValueChange={(value) => handleInputChange("method", value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{getStatusBadge(editedPayment.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={handleSaveEdit}>
                          <Save className="h-4 w-4" />
                          <span className="sr-only">Save</span>
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  // View mode
                  <>
                    <TableCell>{payment.customer_name}</TableCell>
                    <TableCell>{payment.parcel_id || "-"}</TableCell>
                    <TableCell>${payment.amount_due || "0.00"}</TableCell>
                    <TableCell>${payment.amount_paid || "0.00"}</TableCell>
                    <TableCell>${payment.balance || "0.00"}</TableCell>
                    <TableCell>
                      <DateFormatter date={payment.date} />
                    </TableCell>
                    <TableCell>
                      {payment.paid_date ? (
                        <DateFormatter date={payment.paid_date} />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{payment.method.replace("_", " ")}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start cursor-pointer"
                              onClick={() => handleEdit(payment)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start cursor-pointer text-destructive"
                              onClick={() => handleDelete(payment.id)}
                              disabled={isDeleting === payment.id}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              {isDeleting === payment.id ? "Deleting..." : "Delete"}
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
