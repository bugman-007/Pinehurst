// api/documents/upload/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 });

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileContent = Buffer.from(buffer).toString("base64");

    // Create unique filename
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const remotePath = `/var/www/uploads/${fileName}`;

    // SSH command to create directory and write file
    const sshCommand = `
      mkdir -p /var/www/uploads && 
      echo "${fileContent}" | base64 --decode > ${remotePath}
    `;

    // Execute via SSH (configure your SSH credentials properly)
    await execAsync(`ssh user@your-vps-ip "${sshCommand}"`);

    // Save to database
    const fileUrl = `https://209.97.155.164/uploads/${fileName}`;
    await db.query(
      "INSERT INTO documents (user_id, file_url, uploaded_at) VALUES (?, ?, NOW())",
      [user.id, fileUrl]
    );

    return NextResponse.json({ message: "File uploaded successfully", fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}