"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Download, MoreHorizontal, Trash, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DateFormatter } from "@/components/date-formatter"

interface Document {
  id: string
  user_id: string
  user_name: string
  file_url: string
  uploaded_at: string
}

interface DocumentTableProps {
  documents: Document[]
  isAdmin: boolean
}

export function DocumentTable({ documents, isAdmin }: DocumentTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async (documentId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setIsDeleting(documentId)

      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete document")
        }

        toast({
          title: "Success",
          description: "Document deleted successfully",
        })

        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete document",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Create a temporary anchor element
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (extension === "pdf") {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          PDF
        </Badge>
      )
    } else if (extension === "doc" || extension === "docx") {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          DOC
        </Badge>
      )
    } else if (extension === "jpg" || extension === "jpeg" || extension === "png") {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          IMAGE
        </Badge>
      )
    }

    return <Badge variant="outline">FILE</Badge>
  }

  const canPreview = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return extension === "pdf" || extension === "jpg" || extension === "jpeg" || extension === "png"
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {isAdmin && <TableHead>User</TableHead>}
            <TableHead>File Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 5 : 4} className="text-center">
                No documents found
              </TableCell>
            </TableRow>
          ) : (
            documents.map((document) => {
              const fileName = document.file_url.split("/").pop() || "document"

              return (
                <TableRow key={document.id}>
                  {isAdmin && <TableCell>{document.user_name}</TableCell>}
                  <TableCell className="font-medium">{fileName}</TableCell>
                  <TableCell>{getFileIcon(fileName)}</TableCell>
                  <TableCell>
                    <DateFormatter date={document.uploaded_at} />
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
                        {canPreview(fileName) && (
                          <DropdownMenuItem onClick={() => setPreviewDocument(document)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDownload(document.file_url, fileName)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(document.id)}
                          disabled={isDeleting === document.id}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          {isDeleting === document.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      <Dialog open={!!previewDocument} onOpenChange={(open) => !open && setPreviewDocument(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewDocument?.file_url.split("/").pop()}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[70vh] overflow-auto">
            {previewDocument && (
              <iframe
                src={previewDocument.file_url}
                // className="w-full h-[60vh] border rounded"
                // title={previewDocument.file_url.split("/").pop() || "Document preview"}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

