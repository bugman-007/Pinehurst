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

    // Get property photos
    const photos = await db.query(
      `
      SELECT * FROM property_photos
      WHERE property_id = ?
      ORDER BY uploaded_at DESC
    `,
      [propertyId],
    )

    return NextResponse.json({ photos }, { status: 200 })
  } catch (error) {
    console.error("Property photos fetch error:", error)
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

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Create a unique path for the file
    const fileName = `property-${propertyId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filePath = `properties/${fileName}`

    // Upload the file to Vercel Blob
    const blob = await put(filePath, file, {
      access: "public",
      addRandomSuffix: false,
    })

    // Save the photo record in the database
    await db.query("INSERT INTO property_photos (property_id, file_url, file_name) VALUES (?, ?, ?)", [
      propertyId,
      blob.url,
      file.name,
    ])

    return NextResponse.json(
      {
        message: "Photo uploaded successfully",
        fileUrl: blob.url,
        fileName: file.name,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Property photo upload error:", error)
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
    const photoId = url.searchParams.get("photoId")

    if (!photoId) {
      return NextResponse.json({ message: "Photo ID is required" }, { status: 400 })
    }

    // Check if photo exists and belongs to the property
    const photo = await db.query("SELECT * FROM property_photos WHERE id = ? AND property_id = ?", [
      photoId,
      propertyId,
    ])

    if (!photo || photo.length === 0) {
      return NextResponse.json({ message: "Photo not found or does not belong to this property" }, { status: 404 })
    }

    // Delete the photo from Vercel Blob
    try {
      await fetch(photo[0].file_url, { method: "DELETE" })
    } catch (blobError) {
      console.error("Error deleting photo from Blob storage:", blobError)
      // Continue with database deletion even if blob deletion fails
    }

    // Delete the photo record from the database
    await db.query("DELETE FROM property_photos WHERE id = ?", [photoId])

    return NextResponse.json({ message: "Photo deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Property photo deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
