import { db } from "@/lib/db"
import { hash } from "bcryptjs"

async function initializeDatabase() {
  try {
    console.log("Starting database initialization...")

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("Users table created or already exists")

    // Create payments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        method VARCHAR(50) NOT NULL,
        status ENUM('partially paid', 'paid', 'not paid', 'past due') NOT NULL DEFAULT 'not paid',
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log("Payments table created or already exists")

    // Create documents table
    await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log("Documents table created or already exists")

    // Check if admin user exists
    const adminCheck = await db.query("SELECT * FROM users WHERE email = 'admin@example.com'")

    if (!adminCheck || (adminCheck as any[]).length === 0) {
      // Create admin user
      const hashedPassword = await hash("admin123", 10)
      await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
        "Admin User",
        "admin@example.com",
        hashedPassword,
        "admin",
      ])
      console.log("Admin user created")

      // Create sample customer users
      await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
        "John Doe",
        "john@example.com",
        hashedPassword,
        "customer",
      ])

      await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
        "Jane Smith",
        "jane@example.com",
        hashedPassword,
        "customer",
      ])
      console.log("Sample customer users created")

      // Add sample data
      const johnId = await db.query("SELECT id FROM users WHERE email = 'john@example.com'")
      const janeId = await db.query("SELECT id FROM users WHERE email = 'jane@example.com'")

      if (johnId && (johnId as any[])[0] && janeId && (janeId as any[])[0]) {
        // Add sample payments
        await db.query("INSERT INTO payments (customer_id, amount, date, method, status) VALUES (?, ?, ?, ?, ?)", [
          (johnId as any[])[0].id,
          99.99,
          new Date("2023-01-15"),
          "credit_card",
          "paid",
        ])

        await db.query("INSERT INTO payments (customer_id, amount, date, method, status) VALUES (?, ?, ?, ?, ?)", [
          (johnId as any[])[0].id,
          149.99,
          new Date("2023-02-20"),
          "paypal",
          "paid",
        ])

        await db.query("INSERT INTO payments (customer_id, amount, date, method, status) VALUES (?, ?, ?, ?, ?)", [
          (janeId as any[])[0].id,
          199.99,
          new Date("2023-03-10"),
          "credit_card",
          "not_paid",
        ])

        await db.query("INSERT INTO payments (customer_id, amount, date, method, status) VALUES (?, ?, ?, ?, ?)", [
          (janeId as any[])[0].id,
          49.99,
          new Date("2023-04-05"),
          "bank_transfer",
          "paid",
        ])
        console.log("Sample payments created")

        // Add sample documents
        await db.query("INSERT INTO documents (user_id, file_url, uploaded_at) VALUES (?, ?, ?)", [
          (johnId as any[])[0].id,
          "/uploads/invoice-jan-2023.pdf",
          new Date("2023-01-16"),
        ])

        await db.query("INSERT INTO documents (user_id, file_url, uploaded_at) VALUES (?, ?, ?)", [
          (johnId as any[])[0].id,
          "/uploads/contract-2023.pdf",
          new Date("2023-02-21"),
        ])

        await db.query("INSERT INTO documents (user_id, file_url, uploaded_at) VALUES (?, ?, ?)", [
          (janeId as any[])[0].id,
          "/uploads/receipt-march-2023.pdf",
          new Date("2023-03-11"),
        ])

        await db.query("INSERT INTO documents (user_id, file_url, uploaded_at) VALUES (?, ?, ?)", [
          (janeId as any[])[0].id,
          "/uploads/agreement-2023.pdf",
          new Date("2023-04-06"),
        ])
        console.log("Sample documents created")
      }
    } else {
      console.log("Admin user already exists, skipping sample data creation")
    }

    console.log("Database initialization completed successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
  } finally {
    process.exit()
  }
}

initializeDatabase()

