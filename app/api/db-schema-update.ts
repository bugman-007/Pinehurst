import { db } from "@/lib/db"

export async function updatePaymentsTable() {
  try {
    // Check if columns already exist
    const checkColumns = await db.query(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'payments' 
      AND TABLE_SCHEMA = ?
    `,
      [process.env.MYSQL_DATABASE],
    )

    const columns = checkColumns.map((col: any) => col.COLUMN_NAME.toLowerCase())

    // Add new columns if they don't exist
    if (!columns.includes("parcel_id")) {
      await db.query(`ALTER TABLE payments ADD COLUMN parcel_id VARCHAR(50) DEFAULT NULL`)
    }

    if (!columns.includes("amount_due")) {
      await db.query(`ALTER TABLE payments ADD COLUMN amount_due DECIMAL(10, 2) DEFAULT 0.00`)
    }

    if (!columns.includes("amount_paid")) {
      await db.query(`ALTER TABLE payments ADD COLUMN amount_paid DECIMAL(10, 2) DEFAULT 0.00`)
    }

    if (!columns.includes("balance")) {
      await db.query(`ALTER TABLE payments ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0.00`)
    }

    if (!columns.includes("paid_date")) {
      await db.query(`ALTER TABLE payments ADD COLUMN paid_date TIMESTAMP NULL DEFAULT NULL`)
    }

    // Rename amount to amount_paid for existing records if needed
    if (columns.includes("amount") && columns.includes("amount_paid")) {
      await db.query(`
        UPDATE payments 
        SET amount_paid = amount, 
            amount_due = amount, 
            balance = 0 
        WHERE amount_paid = 0
      `)
    }

    console.log("Payments table updated successfully")
    return { success: true }
  } catch (error) {
    console.error("Error updating payments table:", error)
    return { success: false, error }
  }
}
