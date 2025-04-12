"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Pencil, Trash, Users, FileText, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { DateFormatter } from "@/components/date-formatter"

interface Property {
  id: string
  status: string
  parcel_id: string
  street_number: string
  street_name: string
  city: string
  state: string
  zip: string
  created_at: string
  assigned_users_count: number
}

interface PropertyTableProps {
  properties: Property[]
}

export function PropertyTable({ properties: initialProperties }: PropertyTableProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async (propertyId: string) => {
    if (confirm("Are you sure you want to delete this property? This will also delete all associated data.")) {
      setIsDeleting(propertyId)

      try {
        const response = await fetch(`/api/properties/${propertyId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete property")
        }

        toast({
          title: "Success",
          description: "Property deleted successfully",
        })

        // Remove the deleted property from the list
        setProperties(properties.filter((p) => p.id !== propertyId))
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete property",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>
      case "financing":
        return <Badge className="bg-blue-500">Financing</Badge>
      case "loan in default":
        return <Badge className="bg-red-500">Loan in Default</Badge>
      case "sold":
        return <Badge className="bg-gray-500">Sold</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getAddress = (property: Property) => {
    const parts = []
    if (property.street_number) parts.push(property.street_number)
    if (property.street_name) parts.push(property.street_name)

    const streetAddress = parts.join(" ")

    const cityStateZip = [property.city, property.state, property.zip].filter(Boolean).join(", ")

    return [streetAddress, cityStateZip].filter(Boolean).join(", ") || "No address provided"
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parcel ID</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No properties found
              </TableCell>
            </TableRow>
          ) : (
            properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">{property.parcel_id}</TableCell>
                <TableCell>{getAddress(property)}</TableCell>
                <TableCell>{getStatusBadge(property.status)}</TableCell>
                <TableCell>
                  {property.assigned_users_count > 0 ? (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {property.assigned_users_count}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <DateFormatter date={property.created_at} />
                </TableCell>
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
                          onClick={() => router.push(`/dashboard/properties/${property.id}`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          View & Edit
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start cursor-pointer"
                          onClick={() => router.push(`/dashboard/properties/${property.id}/users`)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Manage Users
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start cursor-pointer"
                          onClick={() => router.push(`/dashboard/properties/${property.id}/photos`)}
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Photos
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start cursor-pointer"
                          onClick={() => router.push(`/dashboard/properties/${property.id}/tax-documents`)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Tax Documents
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start cursor-pointer text-destructive"
                          onClick={() => handleDelete(property.id)}
                          disabled={isDeleting === property.id}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          {isDeleting === property.id ? "Deleting..." : "Delete"}
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
