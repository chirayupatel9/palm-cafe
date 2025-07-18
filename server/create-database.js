const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '172.18.103.11',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function createDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL server...');
    
    // First connect without database to create it
    connection = await mysql.createConnection({
      ...dbConfig,
      database: undefined
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    console.log('📦 Creating database...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'palm_cafe'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'palm_cafe'}' created/verified`);
    
    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'palm_cafe'}`);
    
    // Create menu_items table
    console.log('📋 Creating menu_items table...');
    await connection.execute(`
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
    
    // Create invoices table
    console.log('📋 Creating invoices table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        invoice_number VARCHAR(20) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        total DECIMAL(10,2) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ invoices table created');
    
    // Create invoice_items table
    console.log('📋 Creating invoice_items table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(20) NOT NULL,
        menu_item_id VARCHAR(36) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (invoice_number) REFERENCES invoices(invoice_number) ON DELETE CASCADE
      )
    `);
    console.log('✅ invoice_items table created');
    
    // Create indexes
    console.log('📊 Creating indexes...');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_number ON invoice_items(invoice_number)');
    console.log('✅ Indexes created');
    
    // Insert default menu items if table is empty
    console.log('🍽️  Checking for default menu items...');
    const [menuRows] = await connection.execute('SELECT COUNT(*) as count FROM menu_items');
    
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
        await connection.execute(
          'INSERT INTO menu_items (id, name, description, price) VALUES (?, ?, ?, ?)',
          [item.id, item.name, item.description, item.price]
        );
      }
      console.log('✅ Default menu items inserted');
    } else {
      console.log('✅ Menu items already exist');
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('📊 Database schema:');
    console.log('   - menu_items: Store cafe menu items');
    console.log('   - invoices: Store invoice headers');
    console.log('   - invoice_items: Store invoice line items');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your MySQL server is running');
    console.log('2. Verify database credentials in .env file');
    console.log('3. Ensure the MySQL user has CREATE privileges');
    console.log('4. Check if the database name is correct');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔐 Access denied error:');
      console.log('- Check username and password in .env file');
      console.log('- Ensure the MySQL user exists and has proper permissions');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
createDatabase(); 