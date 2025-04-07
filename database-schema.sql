-- Create the database
CREATE DATABASE IF NOT EXISTS pine;
USE pine;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  method VARCHAR(50) NOT NULL,
  status ENUM('paid', 'pending', 'failed') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create an admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Test User', 'testuser@example.com', '$2b$10$JqHRrKpnVAQRKxs1Yk6Ose.XQCiGGmKRoLz3jc3F9AhQQ7OAEo7Uy', 'customer');

-- Create some customer users (password: password123)
INSERT INTO users (name, email, password, role)
VALUES 
  ('John Doe', 'john@example.com', '$2b$10$JqHRrKpnVAQRKxs1Yk6Ose.XQCiGGmKRoLz3jc3F9AhQQ7OAEo7Uy', 'customer'),
  ('Jane Smith', 'jane@example.com', '$2b$10$JqHRrKpnVAQRKxs1Yk6Ose.XQCiGGmKRoLz3jc3F9AhQQ7OAEo7Uy', 'customer');

-- Add some sample payments
INSERT INTO payments (customer_id, amount, date, method, status)
VALUES 
  (2, 99.99, '2023-01-15 10:30:00', 'credit_card', 'paid'),
  (2, 149.99, '2023-02-20 14:45:00', 'paypal', 'paid'),
  (3, 199.99, '2023-03-10 09:15:00', 'credit_card', 'pending'),
  (3, 49.99, '2023-04-05 16:20:00', 'bank_transfer', 'paid');

-- Add some sample documents
INSERT INTO documents (user_id, file_url, uploaded_at)
VALUES 
  (2, '/uploads/invoice-jan-2023.pdf', '2023-01-16 11:30:00'),
  (2, '/uploads/contract-2023.pdf', '2023-02-21 15:45:00'),
  (3, '/uploads/receipt-march-2023.pdf', '2023-03-11 10:15:00'),
  (3, '/uploads/agreement-2023.pdf', '2023-04-06 17:20:00');

