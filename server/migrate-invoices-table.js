const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔄 Invoice Table Migration Script\n');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'palm_cafe'
};

async function migrateInvoicesTable() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL database...');
    console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`User: ${dbConfig.user}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // Check if columns already exist
    console.log('🔍 Checking current table structure...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'invoices'
    `, [dbConfig.database]);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('Current columns:', existingColumns);
    
    const requiredColumns = ['subtotal', 'tax_amount', 'tip_amount'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All required columns already exist!');
      return;
    }
    
    console.log(`📝 Missing columns: ${missingColumns.join(', ')}`);
    console.log('🔄 Adding missing columns...');
    
    // Add missing columns
    for (const column of missingColumns) {
      let columnDefinition;
      switch (column) {
        case 'subtotal':
          columnDefinition = 'ADD COLUMN subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER customer_phone';
          break;
        case 'tax_amount':
          columnDefinition = 'ADD COLUMN tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER subtotal';
          break;
        case 'tip_amount':
          columnDefinition = 'ADD COLUMN tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER tax_amount';
          break;
        default:
          console.log(`⚠️  Unknown column: ${column}`);
          continue;
      }
      
      try {
        await connection.query(`ALTER TABLE invoices ${columnDefinition}`);
        console.log(`✅ Added column: ${column}`);
      } catch (error) {
        console.error(`❌ Failed to add column ${column}:`, error.message);
      }
    }
    
    // Update existing records to have proper values
    console.log('🔄 Updating existing invoice records...');
    const [existingInvoices] = await connection.query('SELECT invoice_number, total FROM invoices');
    
    if (existingInvoices.length > 0) {
      console.log(`📊 Found ${existingInvoices.length} existing invoices to update`);
      
      for (const invoice of existingInvoices) {
        // For existing invoices, set subtotal = total, tax_amount = 0, tip_amount = 0
        await connection.query(`
          UPDATE invoices 
          SET subtotal = ?, tax_amount = 0.00, tip_amount = 0.00 
          WHERE invoice_number = ?
        `, [invoice.total, invoice.invoice_number]);
      }
      console.log('✅ Updated existing invoice records');
    } else {
      console.log('ℹ️  No existing invoices to update');
    }
    
    // Verify the changes
    console.log('🔍 Verifying table structure...');
    const [newColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'invoices'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database]);
    
    console.log('\n📋 Final table structure:');
    newColumns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}) ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''}`);
    });
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('🚀 You can now restart your server and use the new tax/tip features');
    
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔐 Access denied - Check username and password');
    } else if (error.code === 'ER_DBACCESS_DENIED_ERROR') {
      console.log('\n🔐 Database access denied - User may not have ALTER privileges');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔌 Connection refused - Check if MySQL server is running');
    }
    
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('\n🔌 Database connection closed');
      } catch (err) {
        console.log('⚠️  Error closing connection:', err.message);
      }
    }
  }
}

migrateInvoicesTable(); 