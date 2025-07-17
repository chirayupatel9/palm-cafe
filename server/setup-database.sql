-- Palm Cafe Database Setup Script
-- Run this script in your MySQL server to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS palm_cafe;
USE palm_cafe;

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create tax_settings table
CREATE TABLE IF NOT EXISTS tax_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  tax_name VARCHAR(100) DEFAULT 'Tax',
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  invoice_number VARCHAR(20) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(20) NOT NULL,
  menu_item_id VARCHAR(36) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (invoice_number) REFERENCES invoices(invoice_number) ON DELETE CASCADE
);

-- Insert default menu items
INSERT INTO menu_items (id, name, description, price) VALUES
('1', 'Espresso', 'Single shot of espresso', 3.50),
('2', 'Cappuccino', 'Espresso with steamed milk and foam', 4.50),
('3', 'Latte', 'Espresso with steamed milk', 4.75),
('4', 'Americano', 'Espresso with hot water', 3.75),
('5', 'Croissant', 'Buttery French pastry', 3.25),
('6', 'Chocolate Cake', 'Rich chocolate layer cake', 5.50)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), price = VALUES(price);

-- Insert default tax setting
INSERT INTO tax_settings (tax_rate, tax_name) VALUES (8.5, 'Sales Tax')
ON DUPLICATE KEY UPDATE tax_rate = VALUES(tax_rate), tax_name = VALUES(tax_name);

-- Create indexes for better performance
CREATE INDEX idx_menu_items_name ON menu_items(name);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoice_items_invoice_number ON invoice_items(invoice_number);

-- Show tables
SHOW TABLES;

-- Show sample data
SELECT * FROM menu_items;
SELECT * FROM tax_settings; 