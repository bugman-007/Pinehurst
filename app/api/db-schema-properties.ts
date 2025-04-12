import { db } from "@/lib/db"

export async function createPropertiesSchema() {
  try {
    // Create properties table
    await db.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status ENUM('Available', 'Financing', 'Loan in Default', 'Sold') NOT NULL DEFAULT 'Available',
        parcel_id VARCHAR(50) UNIQUE NOT NULL,
        ppin VARCHAR(50),
        lot_size VARCHAR(100),
        lot_sf VARCHAR(100),
        lot_acres VARCHAR(100),
        street_number VARCHAR(20),
        street_name VARCHAR(100),
        cross_streets VARCHAR(200),
        city VARCHAR(100),
        state VARCHAR(50),
        zip VARCHAR(20),
        county VARCHAR(100),
        gps_coordinates VARCHAR(100),
        google_maps_link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create property_users table (for many-to-many relationship)
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL,
        user_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY (property_id, user_id)
      )
    `)

    // Create property_photos table
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_photos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `)

    // Create property_tax_documents table
    await db.query(`
      CREATE TABLE IF NOT EXISTS property_tax_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        tax_year VARCHAR(10),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )
    `)

    console.log("Properties schema created successfully")
    return { success: true }
  } catch (error) {
    console.error("Error creating properties schema:", error)
    return { success: false, error }
  }
}
