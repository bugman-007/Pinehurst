import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CreditCard, FileText, Users } from "lucide-react";
import { DatabaseStatusWrapper } from "@/components/database-status-wrapper";
import UserCard from "@/components/UserCard";
import { PaymentTable } from "./payments/payment-table";
import Link from "next/link";

interface Document {
  id: string;
  file_url: string;
  uploaded_at: string;
}

export default async function Dashboard() {
  const user = await requireAuth();
  console.log(user);
  const isAdmin = user.role === "admin";

  // Fetch statistics based on user role
  const stats = {
    totalUsers: 0,
    totalPayments: 0,
    totalDocuments: 0,
  };

  let userDocuments: Document[] = [];

  if (isAdmin) {
    // Admin stats
    const usersCount = await db.query("SELECT COUNT(*) as count FROM users");
    const paymentsCount = await db.query(
      "SELECT COUNT(*) as count FROM payments"
    );
    const documentsCount = await db.query(
      "SELECT COUNT(*) as count FROM documents"
    );

    stats.totalUsers = usersCount[0].count;
    stats.totalPayments = paymentsCount[0].count;
    stats.totalDocuments = documentsCount[0].count;
  } else {
    // Customer stats
    const paymentsCount = await db.query(
      "SELECT COUNT(*) as count FROM payments WHERE customer_id = ?",
      [user.id]
    );
    const documentsCount = await db.query(
      "SELECT COUNT(*) as count FROM documents WHERE user_id = ?",
      [user.id]
    );

    stats.totalPayments = paymentsCount[0].count;
    stats.totalDocuments = documentsCount[0].count;

    // Fetch user's documents
    userDocuments = await db.query(
      `SELECT id, file_url, uploaded_at 
       FROM documents 
       WHERE user_id = ? 
       ORDER BY uploaded_at DESC`,
      [user.id]
    );
  }

  let userPayments = [];
  if (!isAdmin) {
    userPayments = await db.query(
      `SELECT p.id, p.customer_id, p.parcel_id, p.amount_due, p.amount_paid, p.balance, p.date, p.paid_date, p.method, p.status, u.name as customer_name FROM payments p JOIN users u ON p.customer_id = u.id WHERE p.customer_id = ? ORDER BY p.date DESC`,
      [user.id]
    );
  }

  async function onSave(user: {
    id: string;
    name: string;
    email: string;
    role: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  }) {
    // Update user data in database
    await db.query(
      `UPDATE users 
     SET name = ?, 
         email = ?,
         role = ?,
         address = ?,
         city = ?,
         state = ?,
         zip = ?
     WHERE id = ?`,
      [
        user.name,
        user.email,
        user.role,
        user.address,
        user.city,
        user.state,
        user.zip,
        user.id,
      ]
    );
  }

  return (
    <DashboardLayout
      heading={`Welcome, ${user.name}`}
      subheading="Here's an overview of your account"
    >
      <div className="grid gap-6">
        {/* Stats Cards */}
        <div
          className={`grid gap-6 md:grid-cols-1 ${
            isAdmin ? "lg:grid-cols-3" : "lg:grid-cols-1"
          }`}
        >
          {isAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users in the system
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? "Total Documents" : "Your Documents"}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground mb-4">
                {isAdmin ? "Documents in the system" : "Documents uploaded"}
              </p>
              {!isAdmin && (
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {userDocuments?.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        <span className="text-sm truncate text-primary underline group-hover:text-blue-600 cursor-pointer">{doc.file_url.split('/').pop()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Payments Table */}
        {!isAdmin && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Your Payments</h2>
            <PaymentTable payments={userPayments} readOnly />
          </div>
        )}

        {/* Account Information */}
        <div className="flex gap-6 ">
          <UserCard initialUser={user}></UserCard>
          {isAdmin && <DatabaseStatusWrapper />}
        </div>
      </div>
    </DashboardLayout>
  );
}
