import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const documentId = params.id

    // Check if document exists
    const document = await db.query("SELECT * FROM documents WHERE id = ?", [documentId])

    if (!document || document.length === 0) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 })
    }

    // Check if user is authorized to delete this document
    if (user.role !== "admin" && document[0].user_id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Delete the document
    await db.query("DELETE FROM documents WHERE id = ?", [documentId])

    // In a real application, you would also delete the file from storage

    return NextResponse.json({ message: "Document deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Document deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

