"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  const checkConnection = async () => {
    setIsChecking(true)
    setStatus("loading")

    try {
      const response = await fetch("/api/db-test")
      const data = await response.json()

      if (response.ok) {
        setStatus("connected")
        setErrorMessage(null)
        toast({
          title: "Success",
          description: "Database connection is working properly",
        })
      } else {
        setStatus("error")
        setErrorMessage(data.error || data.message || "Unknown error")
        toast({
          title: "Connection Error",
          description: data.error || data.message || "Failed to connect to database",
          variant: "destructive",
        })
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage("Failed to check database connection")
      toast({
        title: "Error",
        description: "Failed to check database connection",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card style={{flexGrow:1}}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Database Status</CardTitle>
          <CardDescription>MySQL Connection</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={checkConnection} disabled={isChecking} className="h-8 w-8">
          <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh connection status</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {status === "connected" ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-500">Connected</span>
            </>
          ) : status === "error" ? (
            <>
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="font-medium text-destructive">Connection Error</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Checking connection...</span>
            </>
          )}
        </div>

        {errorMessage && <p className="mt-2 text-xs text-destructive">{errorMessage}</p>}

        <div className="mt-2 text-xs text-muted-foreground">
          {/* <p>Host: {process.env.MYSQL_HOST || ""}</p> */}
          <p>Host: {process.env.NEXT_PUBLIC_DB_HOST || "209.97.155.164"}</p>
          <p>Database: {process.env.NEXT_PUBLIC_DB_NAME || "pine"}</p>
        </div>
      </CardContent>
    </Card>
  )
}

