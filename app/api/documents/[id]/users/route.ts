import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const documentId = params.id;
    const { userId } = await req.json()

    // Check if document exists
    const document = await db.query("SELECT * FROM documents WHERE id = ?", [
      documentId,
    ]);

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (user.role !== "admin" && document.user_id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Check if new user exists
    const [newUser] = await db.query("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);
    if (!newUser) {
      return NextResponse.json(
        { message: "Target user not found" },
        { status: 400 }
      );
    }

    // Update document
    await db.query("UPDATE documents SET user_id = ? WHERE id = ?", [
      userId,
      documentId,
    ]);

    return NextResponse.json(
      { message: "Document updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Document update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const documentId = params.id;

    // Check if document exists
    const document = await db.query("SELECT * FROM documents WHERE id = ?", [
      documentId,
    ]);

    if (!document || document.length === 0) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // Check if user is authorized to delete this document
    if (user.role !== "admin" && document[0].user_id !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", documentId);

    // Update the document
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.query("UPDATE documents SET user_id = ? WHERE id = ?", [
      -1,
      documentId,
    ]);
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    return NextResponse.json(
      { message: "Document deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Document deletion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
