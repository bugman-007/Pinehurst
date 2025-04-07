"use client"

import { format } from "date-fns"

interface DateFormatterProps {
  date: string | Date
  formatString?: string
}

export function DateFormatter({ date, formatString = "MMM d, yyyy" }: DateFormatterProps) {
  return <>{format(new Date(date), formatString)}</>
}

