import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { writeFile } from "fs/promises"
import { join } from "path"
import { mkdir } from "fs/promises"

// Define the upload directory on your VPS
// Change this to your desired location on the VPS
const UPLOAD_DIR = process.env.UPLOAD_DIR || "/var/www/uploads"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    try {
      await mkdir(UPLOAD_DIR, { recursive: true })
    } catch (error) {
      console.error("Error creating upload directory:", error)
      return NextResponse.json({ message: "Error creating upload directory" }, { status: 500 })
    }

    // Create a unique filename with user ID for better organization
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `${user.id}-${Date.now()}-${safeFileName}`
    const filePath = join(UPLOAD_DIR, fileName)

    // Convert the file to an ArrayBuffer
    const buffer = await file.arrayBuffer()

    try {
      // Write the file to the VPS filesystem
      await writeFile(filePath, Buffer.from(buffer))
    } catch (error) {
      console.error("Error writing file:", error)
      return NextResponse.json({ message: "Error writing file to storage" }, { status: 500 })
    }

    // Create a relative path for storage in the database and for serving
    const fileUrl = `/uploads/${fileName}`

    // Save the document record in the database
    await db.query("INSERT INTO documents (user_id, file_url, uploaded_at) VALUES (?, ?, NOW())", [user.id, fileUrl])

    return NextResponse.json({ message: "Document uploaded successfully", fileUrl }, { status: 201 })
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
