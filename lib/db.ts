import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 30,
  queueLimit: 0,
  connectTimeout: 3000,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  // debug: process.env.NODE_ENV === "development",
});

// Generic query function
async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Health check
async function testConnection() {
  try {
    await pool.query("SELECT 1");
    return { success: true, message: "Database connection successful" };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Close pool (useful for graceful shutdown)
async function close() {
  await pool.end();
}

export const db = {
  query,
  testConnection,
  close,
};
