const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔧 Fixing DateTime Format Issue\n');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 3306
};

async function fixDateTime() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL server...');
    
    connection = await mysql.createConnection({
      ...dbConfig,
      database: process.env.DB_NAME || 'palm_cafe'
    });
    
    console.log('✅ Connected to database');
    
    // Fix the date column format
    console.log('📅 Fixing date column format...');
    await connection.query(`
      ALTER TABLE invoices MODIFY COLUMN date DATETIME DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('✅ Date column updated');
    
    // Fix the created_at column format
    console.log('📅 Fixing created_at column format...');
    await connection.query(`
      ALTER TABLE invoices MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('✅ Created_at column updated');
    
    // Show table structure
    console.log('\n📊 Updated table structure:');
    const [columns] = await connection.query('DESCRIBE invoices');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n🎉 DateTime format fix completed!');
    console.log('✅ Invoice creation should now work properly');
    
  } catch (error) {
    console.error('\n❌ Error fixing datetime format:');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    
    if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('\n💡 Column might already be in correct format');
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

fixDateTime(); 