import mysql from "mysql2/promise"

// Create a connection pool
const pool = mysql.createPool({
  host: "localhost",
  // host: process.env.MYSQL_HOST,
  user: "root",
  // user: process.env.MYSQL_USER,
  password: "qweqeqeqwe1234",
  // password: process.env.MYSQL_PASSWORD,
  database: "pine",
  // database: process.env.MYSQL_DATABASE,
  port: Number.parseInt("3306"),
  // port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === "production" ? {} : undefined, // Enable SSL in production
})

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

