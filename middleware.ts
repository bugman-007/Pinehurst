import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { join } from "path"
import { stat, readFile } from "fs/promises"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only handle requests to the /uploads path
  if (pathname.startsWith("/uploads/")) {
    try {
      // Get the file path from the pathname
      const filePath = join(process.cwd(), pathname)

      // Check if the file exists
      await stat(filePath)

      // Read the file
      const file = await readFile(filePath)

      // Determine the content type based on file extension
      const extension = pathname.split(".").pop()?.toLowerCase() || ""
      let contentType = "application/octet-stream"

      if (extension === "pdf") contentType = "application/pdf"
      else if (extension === "doc" || extension === "docx") contentType = "application/msword"
      else if (extension === "jpg" || extension === "jpeg") contentType = "image/jpeg"
      else if (extension === "png") contentType = "image/png"

      // Return the file with the appropriate content type
      return new NextResponse(file, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${pathname.split("/").pop()}"`,
        },
      })
    } catch (error) {
      // If the file doesn't exist or there's an error, return a 404
      return NextResponse.json({ message: "File not found" }, { status: 404 })
    }
  }

  // Continue the middleware chain for other requests
  return NextResponse.next()
}

export const config = {
  matcher: "/uploads/:path*",
}

