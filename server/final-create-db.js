const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🎯 Final Database Creation Script\n');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 3306
};

async function createDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL server...');
    console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`User: ${dbConfig.user}`);
    
    // Connect without specifying database
    connection = await mysql.createConnection({
      ...dbConfig,
      database: undefined
    });
    
    console.log('✅ Connected to MySQL server successfully!');
    
    // Create database using query instead of execute
    const dbName = process.env.DB_NAME || 'palm_cafe';
    console.log(`📦 Creating database '${dbName}'...`);
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created/verified`);
    
    // Use the database
    await connection.query(`USE \`${dbName}\``);
    console.log(`✅ Now using database '${dbName}'`);
    
    // Create tables using query instead of execute
    console.log('📋 Creating tables...');
    
    // menu_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ menu_items table created');
    
    // tax_settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tax_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        tax_name VARCHAR(100) DEFAULT 'Tax',
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ tax_settings table created');
    
    // Create invoices table with updated structure
    await connection.query(`
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
      )
    `);
    console.log('✅ invoices table created');
    
    // invoice_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(20) NOT NULL,
        menu_item_id VARCHAR(36) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        INDEX idx_invoice_number (invoice_number),
        FOREIGN KEY (invoice_number) REFERENCES invoices(invoice_number) ON DELETE CASCADE
      )
    `);
    console.log('✅ invoice_items table created');
    
    // Insert default menu items
    console.log('🍽️  Checking for default menu items...');
    const [menuRows] = await connection.query('SELECT COUNT(*) as count FROM menu_items');
    
    if (menuRows[0].count === 0) {
      console.log('📝 Inserting default menu items...');
      const defaultItems = [
        { id: '1', name: 'Espresso', description: 'Single shot of espresso', price: 3.50 },
        { id: '2', name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 4.50 },
        { id: '3', name: 'Latte', description: 'Espresso with steamed milk', price: 4.75 },
        { id: '4', name: 'Americano', description: 'Espresso with hot water', price: 3.75 },
        { id: '5', name: 'Croissant', description: 'Buttery French pastry', price: 3.25 },
        { id: '6', name: 'Chocolate Cake', description: 'Rich chocolate layer cake', price: 5.50 }
      ];
      
      for (const item of defaultItems) {
        await connection.query(
          'INSERT INTO menu_items (id, name, description, price) VALUES (?, ?, ?, ?)',
          [item.id, item.name, item.description, item.price]
        );
      }
      console.log('✅ Default menu items inserted');
    } else {
      console.log('✅ Menu items already exist');
    }
    
    // Insert default tax setting
    console.log('💰 Checking for default tax settings...');
    const [taxRows] = await connection.query('SELECT COUNT(*) as count FROM tax_settings');
    
    if (taxRows[0].count === 0) {
      console.log('📝 Inserting default tax setting...');
      await connection.query(
        'INSERT INTO tax_settings (tax_rate, tax_name) VALUES (?, ?)',
        [8.5, 'Sales Tax']
      );
      console.log('✅ Default tax setting inserted (8.5% Sales Tax)');
    } else {
      console.log('✅ Tax settings already exist');
    }
    
    // Show tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📊 Database tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    // Show sample data
    const [menuItems] = await connection.query('SELECT name, price FROM menu_items LIMIT 3');
    console.log('\n🍽️  Sample menu items:');
    menuItems.forEach(item => {
      console.log(`   - ${item.name}: $${item.price}`);
    });
    
    // Show tax settings
    const [taxSettings] = await connection.query('SELECT tax_rate, tax_name FROM tax_settings WHERE is_active = TRUE');
    console.log('\n💰 Current tax settings:');
    if (taxSettings.length > 0) {
      taxSettings.forEach(setting => {
        console.log(`   - ${setting.tax_name}: ${setting.tax_rate}%`);
      });
    } else {
      console.log('   - No active tax settings');
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('🚀 You can now start the application with: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔐 Access denied - Check username and password');
    } else if (error.code === 'ER_DBACCESS_DENIED_ERROR') {
      console.log('\n🔐 Database access denied - User may not have CREATE privileges');
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

createDatabase(); 