import { type NextRequest, NextResponse } from "next/server"
import { join } from "path"
import { stat, readFile } from "fs/promises"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Get the current user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the file path from the params
    // Use the same upload directory as defined in the upload route
    const uploadDir = process.env.UPLOAD_DIR || "/var/www/uploads"
    const filePath = join(uploadDir, ...params.path)

    // Check if the file exists
    try {
      await stat(filePath)
    } catch (error) {
      console.error("File not found:", filePath, error)
      return NextResponse.json({ message: "File not found" }, { status: 404 })
    }

    // Read the file
    const file = await readFile(filePath)

    // Determine the content type based on file extension
    const extension = params.path[params.path.length - 1].split(".").pop()?.toLowerCase() || ""
    let contentType = "application/octet-stream"

    if (extension === "pdf") contentType = "application/pdf"
    else if (extension === "doc" || extension === "docx") contentType = "application/msword"
    else if (extension === "jpg" || extension === "jpeg") contentType = "image/jpeg"
    else if (extension === "png") contentType = "image/png"

    // Return the file with the appropriate content type
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${params.path[params.path.length - 1]}"`,
      },
    })
  } catch (error) {
    console.error("File serving error:", error)
    return NextResponse.json(
      { message: "Error serving file", error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
