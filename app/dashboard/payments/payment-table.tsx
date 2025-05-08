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
import { Skeleton } from "@/components/ui/skeleton"

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
  notes?: string
}

interface PaymentTableProps {
  payments: Payment[]
  readOnly?: boolean
}

export function PaymentTable({ payments: initialPayments, readOnly = false }: PaymentTableProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedPayment, setEditedPayment] = useState<Payment | null>(null)
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [notesValue, setNotesValue] = useState("")
  const [notesPaymentId, setNotesPaymentId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [sortBy, setSortBy] = useState<keyof Payment | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

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

    if (field === "amount_due" || field === "amount_paid") {
      const amountDue = field === "amount_due" ? Number(value) : editedPayment.amount_due
      const amountPaid = field === "amount_paid" ? Number(value) : editedPayment.amount_paid
      const balance = Math.max(0, amountDue - amountPaid)

      updatedPayment = {
        ...updatedPayment,
        balance,
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
      case "partially_paid":
        return <Badge className="bg-blue-500">Partially Paid</Badge>
      case "not_paid":
        return <Badge className="bg-yellow-500">Not Paid</Badge>
      case "past_due":
        return <Badge className="bg-red-500">Past Due</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const dateFields = ["date", "paid_date"]
  const numericFields = ["amount_due", "amount_paid", "balance"]

  const sortedPayments = [...payments].sort((a, b) => {
    if (!sortBy) return 0
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    if (numericFields.includes(sortBy)) {
      aValue = Number(aValue)
      bValue = Number(bValue)
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    if (dateFields.includes(sortBy)) {
      const aTime = aValue ? new Date(aValue).getTime() : 0
      const bTime = bValue ? new Date(bValue).getTime() : 0
      return sortDirection === "asc" ? aTime - bTime : bTime - aTime
    }

    if (aValue == null) return 1
    if (bValue == null) return -1
    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue))
  })

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {!readOnly && <TableHead>
              Customer {sortBy === "customer_name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </TableHead>}
            {!readOnly && <TableHead>
              Parcel ID {sortBy === "parcel_id" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </TableHead>}
            <TableHead
              onClick={() => {
                if (sortBy === "amount_due") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                } else {
                  setSortBy("amount_due")
                  setSortDirection("asc")
                }
              }}
              className="cursor-pointer"
            >
              Starting Balance {sortBy === "amount_due" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </TableHead>
            <TableHead
              onClick={() => {
                if (sortBy === "amount_paid") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                } else {
                  setSortBy("amount_paid")
                  setSortDirection("asc")
                }
              }}
              className="cursor-pointer"
            >
              Amount Paid {sortBy === "amount_paid" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </TableHead>
            <TableHead
              onClick={() => {
                if (sortBy === "balance") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                } else {
                  setSortBy("balance")
                  setSortDirection("asc")
                }
              }}
              className="cursor-pointer"
            >
              Ending Balance {sortBy === "balance" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </TableHead>
            <TableHead
              onClick={() => {
                if (sortBy === "date") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                } else {
                  setSortBy("date")
                  setSortDirection("asc")
                }
              }}
              className="cursor-pointer"
            >
              Due Date {sortBy === "date" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </TableHead>
            <TableHead
              onClick={() => {
                if (sortBy === "paid_date") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                } else {
                  setSortBy("paid_date")
                  setSortDirection("asc")
                }
              }}
              className="cursor-pointer"
            >
              Paid Date {sortBy === "paid_date" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </TableHead>
            <TableHead
              onClick={() => {
                if (sortBy === "method") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                } else {
                  setSortBy("method")
                  setSortDirection("asc")
                }
              }}
              className="cursor-pointer"
            >
              Method {sortBy === "method" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </TableHead>
            <TableHead
              onClick={() => {
                if (sortBy === "status") {
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                } else {
                  setSortBy("status")
                  setSortDirection("asc")
                }
              }}
              className="cursor-pointer"
            >
              Status {sortBy === "status" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
            </TableHead>
            {!readOnly && <TableHead className="w-[100px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={readOnly ? 7 : 10} className="text-center">
                No payments found
              </TableCell>
            </TableRow>
          ) : (
            sortedPayments.map((payment) => (
              <TableRow key={payment.id}>
                {!readOnly && <TableCell>{payment.customer_name}</TableCell>}
                {!readOnly && <TableCell>{payment.parcel_id || "-"}</TableCell>}
                <TableCell>${payment.amount_due}</TableCell>
                <TableCell>${payment.amount_paid}</TableCell>
                <TableCell>${payment.balance}</TableCell>
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
                <TableCell className="capitalize">
                  {payment.method ? payment.method.replace("_", " ") : "-"}
                </TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                {!readOnly && (
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
                            className="w-full justify-start cursor-pointer"
                            onClick={() => {
                              setNotesModalOpen(true)
                              setNotesValue(payment.notes || "")
                              setNotesPaymentId(payment.id)
                            }}
                          >
                            📝 View/Edit Notes
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
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {notesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">View/Edit Notes</h2>
            <textarea
              className="w-full border rounded p-2 mb-4 text-black dark:text-white dark:bg-gray-800"
              rows={5}
              value={notesValue}
              onChange={e => setNotesValue(e.target.value)}
              placeholder="Enter notes here..."
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNotesModalOpen(false)
                  setNotesValue("")
                  setNotesPaymentId(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!notesPaymentId) return
                  try {
                    const paymentToUpdate = payments.find(p => p.id === notesPaymentId)
                    if (!paymentToUpdate) return
                    const updatedPayment = { ...paymentToUpdate, notes: notesValue }
                    const response = await fetch(`/api/payments/${notesPaymentId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(updatedPayment),
                    })
                    if (!response.ok) throw new Error("Failed to update notes")
                    setPayments(payments.map(p => p.id === notesPaymentId ? updatedPayment : p))
                    toast({ title: "Success", description: "Notes updated." })
                    setNotesModalOpen(false)
                    setNotesValue("")
                    setNotesPaymentId(null)
                    router.refresh()
                  } catch (error) {
                    toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update notes", variant: "destructive" })
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}