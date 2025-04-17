import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DocumentTable } from "./document-table";
import Link from "next/link";
import { Upload } from "lucide-react";

export default async function DocumentsPage() {
  const user = await requireAuth();

  // Fetch documents based on user role
  let documents;

  if (user.role === "admin") {
    // Admin can see all documents
    documents = await db.query(`SELECT 
  d.id, 
  d.file_url, 
  d.uploaded_at, 
  COALESCE(u.name, 'NONE') as user_name, 
  COALESCE(u.id, 'NONE') as user_id
FROM documents d
LEFT JOIN users u ON d.user_id = u.id
ORDER BY d.uploaded_at DESC`);
  } else {
    // Customer can only see their own documents
    documents = await db.query(
      `
      SELECT d.id, d.file_url, d.uploaded_at, u.name as user_name, u.id as user_id
      FROM documents d
      JOIN users u ON d.user_id = u.id
      WHERE d.user_id = ?
      ORDER BY d.uploaded_at DESC
    `,
      [user.id]
    );
  }

  return (
    <div>
      {/* {user.role === "admin" ? ( */}
      <DashboardLayout
        heading={user.role === "admin" ? "Document Management" : "My Documents"}
        subheading={
          user.role === "admin"
            ? "Manage all documents in the system"
            : "View and manage your documents"
        }
        action={
          user.role === "admin" && (
            <Button asChild>
              <Link href="/dashboard/documents/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Link>
            </Button>
          )
        }
      >
        <div className="rounded-lg border bg-card">
          <DocumentTable
            documents={documents}
            isAdmin={user.role === "admin"}
          />
        </div>
      </DashboardLayout>
      {/* // ) : (
      //   <>
      //     <div className="flex justify-between items-center m-4">
      //       <h1 className = "text-2xl font-bold">Document Management</h1>
      //       <Button asChild>
      //         <Link href="/dashboard/documents/upload">
      //           <Upload className="mr-2 h-4 w-4" />
      //           Upload Document
      //         </Link>
      //       </Button>
      //     </div>
      //     <div className="rounded-lg border bg-card">
      //       <DocumentTable
      //         documents={documents}
      //         isAdmin={user.role === "admin"}
      //       />
      //     </div>
      //   </>
      // )} */}
    </div>
  );
}
