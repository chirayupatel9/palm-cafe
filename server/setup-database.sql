-- Palm Cafe Database Setup Script
-- Run this script in your MySQL server to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS palm_cafe;
USE palm_cafe;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create menu_items table with category reference
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
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

-- Insert default categories
INSERT INTO categories (id, name, description, sort_order) VALUES
('cat-1', 'Beverages', 'Hot and cold drinks', 1),
('cat-2', 'Food', 'Meals and snacks', 2),
('cat-3', 'Desserts', 'Sweet treats and pastries', 3)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), sort_order = VALUES(sort_order);

-- Insert default menu items with categories
INSERT INTO menu_items (id, category_id, name, description, price, sort_order) VALUES
('1', 'cat-1', 'Espresso', 'Single shot of espresso', 3.50, 1),
('2', 'cat-1', 'Cappuccino', 'Espresso with steamed milk and foam', 4.50, 2),
('3', 'cat-1', 'Latte', 'Espresso with steamed milk', 4.75, 3),
('4', 'cat-1', 'Americano', 'Espresso with hot water', 3.75, 4),
('5', 'cat-2', 'Croissant', 'Buttery French pastry', 3.25, 1),
('6', 'cat-3', 'Chocolate Cake', 'Rich chocolate layer cake', 5.50, 1)
ON DUPLICATE KEY UPDATE 
  category_id = VALUES(category_id),
  name = VALUES(name), 
  description = VALUES(description), 
  price = VALUES(price),
  sort_order = VALUES(sort_order);

-- Insert default tax setting
INSERT INTO tax_settings (tax_rate, tax_name) VALUES (8.5, 'Sales Tax')
ON DUPLICATE KEY UPDATE tax_rate = VALUES(tax_rate), tax_name = VALUES(tax_name);

-- Create indexes for better performance
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_name ON menu_items(name);
CREATE INDEX idx_categories_sort ON categories(sort_order);
CREATE INDEX idx_menu_items_sort ON menu_items(sort_order);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoice_items_invoice_number ON invoice_items(invoice_number);

-- Show tables
SHOW TABLES;

-- Show sample data
SELECT c.name as category, m.name as item, m.price 
FROM menu_items m 
JOIN categories c ON m.category_id = c.id 
ORDER BY c.sort_order, m.sort_order;
SELECT * FROM tax_settings; 