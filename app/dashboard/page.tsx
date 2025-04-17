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

export default async function Dashboard() {
  const user = await requireAuth();
  console.log(user)
  const isAdmin = user.role === "admin";

  // Fetch statistics based on user role
  const stats = {
    totalUsers: 0,
    totalPayments: 0,
    totalDocuments: 0,
  };

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
        <div className={`grid gap-6 md:grid-cols-2 ${isAdmin ?"lg:grid-cols-3":"lg:grid-cols-2"}`}>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? "Total Payments" : "Your Payments"}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Payments processed" : "Payments made"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? "Total Documents" : "Your Documents"}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Documents in the system" : "Documents uploaded"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        {/* <div className="grid gap-6 md:grid-cols-2"> */}
        <div className="flex gap-6 ">
          <UserCard
            initialUser={user}
          ></UserCard>
          {isAdmin && <DatabaseStatusWrapper />}
        </div>
      </div>
    </DashboardLayout>
  );
}
