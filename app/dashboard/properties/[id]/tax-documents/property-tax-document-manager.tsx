"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, Trash, FileText, Download, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { DateFormatter } from "@/components/date-formatter"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TaxDocument {
  id: string
  file_url: string
  file_name: string
  tax_year: string | null
  uploaded_at: string
}

interface PropertyTaxDocumentManagerProps {
  propertyId: string
  documents: TaxDocument[]
}

export function PropertyTaxDocumentManager({
  propertyId,
  documents: initialDocuments,
}: PropertyTaxDocumentManagerProps) {
  const [documents, setDocuments] = useState<TaxDocument[]>(initialDocuments)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [taxYear, setTaxYear] = useState(new Date().getFullYear().toString())
  const [previewDocument, setPreviewDocument] = useState<TaxDocument | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    // Check file type
    if (!file.type.includes("pdf") && !file.type.includes("document")) {
      toast({
        title: "Error",
        description: "Please select a PDF or document file",
        variant: "destructive",
      })
      return
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size exceeds 10MB limit",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("taxYear", taxYear)

      const response = await fetch(`/api/properties/${propertyId}/tax-documents`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to upload document")
      }

      const result = await response.json()

      // Add the new document to the list
      setDocuments([
        {
          id: result.id || Date.now().toString(), // Use the returned ID or fallback
          file_url: result.fileUrl,
          file_name: result.fileName,
          tax_year: taxYear,
          uploaded_at: new Date().toISOString(),
        },
        ...documents,
      ])

      toast({
        title: "Success",
        description: "Tax document uploaded successfully",
      })

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setIsDeleting(documentId)

      try {
        const response = await fetch(`/api/properties/${propertyId}/tax-documents?documentId=${documentId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || "Failed to delete document")
        }

        // Remove the document from the list
        setDocuments(documents.filter((doc) => doc.id !== documentId))

        toast({
          title: "Success",
          description: "Tax document deleted successfully",
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

  const handleDownload = (document: TaxDocument) => {
    // Create a temporary anchor element
    const link = document.createElement("a")
    link.href = document.file_url
    link.download = document.file_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (extension === "pdf") {
      return <FileText className="h-5 w-5 text-red-500" />
    } else if (extension === "doc" || extension === "docx") {
      return <FileText className="h-5 w-5 text-blue-500" />
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Tax Document</CardTitle>
          <CardDescription>Upload a new tax document for this property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tax-year">Tax Year</Label>
              <Input id="tax-year" value={taxYear} onChange={(e) => setTaxYear(e.target.value)} placeholder="YYYY" />
            </div>

            <div className="flex items-end gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="document-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Select Document"}
              </Button>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Documents</CardTitle>
          <CardDescription>Manage tax documents for this property</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No tax documents yet</h3>
              <p className="text-sm text-muted-foreground">Upload tax documents for this property</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Tax Year</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(document.file_name)}
                        <span className="font-medium">{document.file_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{document.tax_year || "N/A"}</TableCell>
                    <TableCell>
                      <DateFormatter date={document.uploaded_at} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewDocument(document)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(document)} title="Download">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDocument(document.id)}
                          disabled={isDeleting === document.id}
                          title="Delete"
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewDocument} onOpenChange={(open) => !open && setPreviewDocument(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewDocument?.file_name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[70vh] overflow-auto">
            {previewDocument && (
              <iframe
                src={previewDocument.file_url}
                className="w-full h-[60vh] border rounded"
                title={previewDocument.file_name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
