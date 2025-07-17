-- Fix datetime format for invoices table
USE palm_cafe;

-- Update the date column to use DATETIME instead of TIMESTAMP if needed
ALTER TABLE invoices MODIFY COLUMN date DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Update the created_at column as well
ALTER TABLE invoices MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Show the table structure to verify
DESCRIBE invoices; 