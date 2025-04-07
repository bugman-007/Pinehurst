import type { ReactNode } from "react"

interface DashboardHeaderProps {
  heading: string
  subheading?: string
  action?: ReactNode
}

export function DashboardHeader({ heading, subheading, action }: DashboardHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-bold">{heading}</h1>
          {subheading && <p className="text-sm text-muted-foreground">{subheading}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}

