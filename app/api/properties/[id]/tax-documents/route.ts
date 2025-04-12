import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { put } from "@vercel/blob"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const propertyId = params.id

    // Check if property exists
    const property = await db.query("SELECT * FROM properties WHERE id = ?", [propertyId])

    if (!property || property.length === 0) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    // Get tax documents
    const taxDocuments = await db.query(
      `
      SELECT * FROM property_tax_documents
      WHERE property_id = ?
      ORDER BY uploaded_at DESC
    `,
      [propertyId],
    )

    return NextResponse.json({ taxDocuments }, { status: 200 })
  } catch (error) {
    console.error("Property tax documents fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const propertyId = params.id

    // Check if property exists
    const property = await db.query("SELECT * FROM properties WHERE id = ?", [propertyId])

    if (!property || property.length === 0) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const taxYear = formData.get("taxYear") as string

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Create a unique path for the file
    const fileName = `tax-doc-${propertyId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = `property-tax-documents/${fileName}`

    // Upload the file to Vercel Blob
    const blob = await put(filePath, file, {
      access: "public",
      addRandomSuffix: false,
    })

    // Save the document record in the database
    await db.query(
      "INSERT INTO property_tax_documents (property_id, file_url, file_name, tax_year) VALUES (?, ?, ?, ?)",
      [propertyId, blob.url, file.name, taxYear || null],
    )

    return NextResponse.json(
      {
        message: "Tax document uploaded successfully",
        fileUrl: blob.url,
        fileName: file.name,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Property tax document upload error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const propertyId = params.id
    const url = new URL(req.url)
    const documentId = url.searchParams.get("documentId")

    if (!documentId) {
      return NextResponse.json({ message: "Document ID is required" }, { status: 400 })
    }

    // Check if document exists and belongs to the property
    const document = await db.query("SELECT * FROM property_tax_documents WHERE id = ? AND property_id = ?", [
      documentId,
      propertyId,
    ])

    if (!document || document.length === 0) {
      return NextResponse.json({ message: "Document not found or does not belong to this property" }, { status: 404 })
    }

    // Delete the document from Vercel Blob
    try {
      await fetch(document[0].file_url, { method: "DELETE" })
    } catch (blobError) {
      console.error("Error deleting document from Blob storage:", blobError)
      // Continue with database deletion even if blob deletion fails
    }

    // Delete the document record from the database
    await db.query("DELETE FROM property_tax_documents WHERE id = ?", [documentId])

    return NextResponse.json({ message: "Tax document deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Property tax document deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
