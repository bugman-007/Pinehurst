import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: ReactNode
  heading: string
  subheading?: string
  action?: ReactNode
}

export function DashboardLayout({ children, heading, subheading, action }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <div className="border-b bg-card">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-bold">{heading}</h1>
              {subheading && <p className="text-sm text-muted-foreground">{subheading}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

