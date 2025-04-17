"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  X,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "admin";
  const isComplete =
    session?.user?.address !== "" &&
    session?.user?.city !== "" &&
    session?.user?.state !== "" &&
    session?.user?.zip !== "";

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    window.location.href = "/";
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={closeSidebar}
      />
      <aside
        className={`top-0 bottom-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link
            href="/dashboard"
            className="font-semibold text-lg"
            onClick={closeSidebar}
          >
            {isAdmin ? "Admin Dashboard" : "User Dashboard"}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted ${
              pathname === "/dashboard" ? "bg-muted font-medium" : ""
            }`}
            onClick={closeSidebar}
          >
            <Home className="h-5 w-5" />
            Dashboard
          </Link>

          {isAdmin && (
            <Link
              href="/dashboard/users"
              className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted ${
                pathname === "/dashboard/users" ? "bg-muted font-medium" : ""
              }`}
              onClick={closeSidebar}
            >
              <Users className="h-5 w-5" />
              User Management
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/dashboard/properties"
              className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted ${
                pathname.startsWith("/dashboard/properties")
                  ? "bg-muted font-medium"
                  : ""
              }`}
              onClick={closeSidebar}
            >
              <Building className="h-5 w-5" />
              Property Management
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/dashboard/payments"
              className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted ${
                pathname === "/dashboard/payments" ? "bg-muted font-medium" : ""
              }`}
              onClick={closeSidebar}
            >
              <CreditCard className="h-5 w-5" />
              Payment Management
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/dashboard/documents"
              className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted ${
                pathname === "/dashboard/documents"
                  ? "bg-muted font-medium"
                  : ""
              }`}
              onClick={closeSidebar}
            >
              <FileText className="h-5 w-5" />
              Documents
            </Link>
          )}

          {/* {!isAdmin && isComplete && (
            <Link
              href="/dashboard/payment-history"
              className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted ${
                pathname === "/dashboard/payment-history"
                  ? "bg-muted font-medium"
                  : ""
              }`}
              onClick={closeSidebar}
            >
              <CreditCard className="h-5 w-5" />
              Payment History
            </Link>
          )} */}

          {!isAdmin && (
            <Link
              href="/dashboard/user-properties"
              className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted ${
                pathname === "/dashboard/user-properties"
                  ? "bg-muted font-medium"
                  : ""
              }`}
              onClick={closeSidebar}
            >
              <Building className="h-5 w-5" />
              My Properties
            </Link>
          )}

          <div className="mt-auto pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign out
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
}
