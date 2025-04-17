"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DateFormatter } from "@/components/date-formatter"
import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role?: string
  assigned_at?: string
}

interface DocumentUserManagerProps {
  documentId: string
  assignedUsers: User[]
  availableUsers: User[]
}

export function DocumentUserManager({
  documentId,
  assignedUsers: initialAssignedUsers,
  availableUsers,
}: DocumentUserManagerProps) {
  const [assignedUsers, setAssignedUsers] = useState<User[]>(initialAssignedUsers)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Filter out already assigned users
  const unassignedUsers = availableUsers.filter((user) => !assignedUsers.some((assigned) => assigned.id === user.id))

  const handleAssignUser = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user to assign",
        variant: "destructive",
      })
      return
    }

    setIsAssigning(true)

    try {
      const response = await fetch(`/api/documents/${documentId}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUserId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to assign user")
      }

      // Find the assigned user from available users
      const assignedUser = availableUsers.find((user) => user.id === selectedUserId)

      if (assignedUser) {
        // Add to assigned users with current date
        setAssignedUsers([
          ...assignedUsers,
          {
            ...assignedUser,
            assigned_at: new Date().toISOString(),
          },
        ])
      }

      setSelectedUserId("")

      toast({
        title: "Success",
        description: "User assigned to property successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign user",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (confirm("Are you sure you want to remove this user from the property?")) {
      setIsRemoving(userId)

      try {
        const response = await fetch(`/api/documents/${documentId}/users`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || "Failed to remove user")
        }

        // Remove from assigned users
        setAssignedUsers(assignedUsers.filter((user) => user.id !== userId))

        toast({
          title: "Success",
          description: "User removed from property successfully",
        })

        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to remove user",
          variant: "destructive",
        })
      } finally {
        setIsRemoving(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign User</CardTitle>
          <CardDescription>Select a user to assign to this property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled = {assignedUsers.length > 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedUsers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available users
                    </SelectItem>
                  ) : (
                    unassignedUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignUser} disabled={!selectedUserId || isAssigning}>
              {isAssigning ? "Assigning..." : "Assign User"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Users</CardTitle>
          <CardDescription>Users who have access to this property</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No users assigned to this property
                  </TableCell>
                </TableRow>
              ) : (
                assignedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <DateFormatter date={user.assigned_at || new Date().toISOString()} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveUser(user.id)}
                        disabled={isRemoving === user.id}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
