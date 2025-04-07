import mysql from "mysql2/promise"

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 3000, // 3 second timeout
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  debug: process.env.NODE_ENV === "development" // Enable debug logs in dev
});

export const db = {
  query: async (sql: string, params?: any[]) => {
    try {
      const [rows] = await pool.execute(sql, params)
      return rows
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  },

  // Helper method to test the connection
  testConnection: async () => {
    try {
      await pool.query("SELECT 1")
      return { success: true, message: "Database connection successful" }
    } catch (error) {
      console.error("Database connection error:", error)
      return {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
}

