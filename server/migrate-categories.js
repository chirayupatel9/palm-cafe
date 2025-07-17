const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔄 Categories Migration Script\n');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'palm_cafe'
};

async function migrateCategories() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL database...');
    console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`User: ${dbConfig.user}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // Check if categories table exists
    console.log('🔍 Checking for categories table...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories'
    `, [dbConfig.database]);
    
    if (tables.length === 0) {
      console.log('📝 Creating categories table...');
      await connection.query(`
        CREATE TABLE categories (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Categories table created');
    } else {
      console.log('✅ Categories table already exists');
    }
    
    // Check if menu_items table has category_id column
    console.log('🔍 Checking menu_items table structure...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'menu_items'
    `, [dbConfig.database]);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('Current menu_items columns:', existingColumns);
    
    // Add missing columns to menu_items table
    const requiredColumns = ['category_id', 'is_active', 'sort_order'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`📝 Adding missing columns: ${missingColumns.join(', ')}`);
      
      for (const column of missingColumns) {
        let columnDefinition;
        switch (column) {
          case 'category_id':
            columnDefinition = 'ADD COLUMN category_id VARCHAR(36) AFTER id';
            break;
          case 'is_active':
            columnDefinition = 'ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER price';
            break;
          case 'sort_order':
            columnDefinition = 'ADD COLUMN sort_order INT DEFAULT 0 AFTER is_active';
            break;
          default:
            console.log(`⚠️  Unknown column: ${column}`);
            continue;
        }
        
        try {
          await connection.query(`ALTER TABLE menu_items ${columnDefinition}`);
          console.log(`✅ Added column: ${column}`);
        } catch (error) {
          console.error(`❌ Failed to add column ${column}:`, error.message);
        }
      }
    } else {
      console.log('✅ All required columns already exist');
    }
    
    // Insert default categories if they don't exist
    console.log('💰 Checking for default categories...');
    const [categoryCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
    
    if (categoryCount[0].count === 0) {
      console.log('📝 Inserting default categories...');
      const defaultCategories = [
        { id: 'cat-1', name: 'Beverages', description: 'Hot and cold drinks', sort_order: 1 },
        { id: 'cat-2', name: 'Food', description: 'Meals and snacks', sort_order: 2 },
        { id: 'cat-3', name: 'Desserts', description: 'Sweet treats and pastries', sort_order: 3 }
      ];
      
      for (const category of defaultCategories) {
        await connection.query(
          'INSERT INTO categories (id, name, description, sort_order) VALUES (?, ?, ?, ?)',
          [category.id, category.name, category.description, category.sort_order]
        );
      }
      console.log('✅ Default categories inserted');
    } else {
      console.log('✅ Categories already exist');
    }
    
    // Update existing menu items to have category_id
    console.log('🔄 Updating existing menu items with categories...');
    const [menuItems] = await connection.query('SELECT id, name FROM menu_items WHERE category_id IS NULL');
    
    if (menuItems.length > 0) {
      console.log(`📊 Found ${menuItems.length} menu items without categories`);
      
      // Simple category mapping based on item names
      const categoryMap = {
        'espresso': 'cat-1',
        'cappuccino': 'cat-1',
        'latte': 'cat-1',
        'americano': 'cat-1',
        'coffee': 'cat-1',
        'tea': 'cat-1',
        'croissant': 'cat-2',
        'sandwich': 'cat-2',
        'salad': 'cat-2',
        'cake': 'cat-3',
        'dessert': 'cat-3',
        'pastry': 'cat-3'
      };
      
      for (const item of menuItems) {
        let categoryId = 'cat-2'; // Default to Food category
        
        // Try to match by name
        const itemName = item.name.toLowerCase();
        for (const [keyword, catId] of Object.entries(categoryMap)) {
          if (itemName.includes(keyword)) {
            categoryId = catId;
            break;
          }
        }
        
        await connection.query(
          'UPDATE menu_items SET category_id = ? WHERE id = ?',
          [categoryId, item.id]
        );
        console.log(`✅ Updated ${item.name} -> Category ID: ${categoryId}`);
      }
    } else {
      console.log('✅ All menu items already have categories');
    }
    
    // Add foreign key constraint if it doesn't exist
    console.log('🔗 Checking foreign key constraints...');
    const [constraints] = await connection.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'menu_items' AND REFERENCED_TABLE_NAME = 'categories'
    `, [dbConfig.database]);
    
    if (constraints.length === 0) {
      console.log('📝 Adding foreign key constraint...');
      try {
        await connection.query(`
          ALTER TABLE menu_items 
          ADD CONSTRAINT fk_menu_items_category 
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        `);
        console.log('✅ Foreign key constraint added');
      } catch (error) {
        console.log('⚠️  Could not add foreign key constraint (may already exist or have data issues):', error.message);
      }
    } else {
      console.log('✅ Foreign key constraint already exists');
    }
    
    // Create indexes
    console.log('📊 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order)',
      'CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON menu_items(sort_order)'
    ];
    
    for (const indexQuery of indexes) {
      try {
        await connection.query(indexQuery);
        console.log('✅ Index created');
      } catch (error) {
        console.log('⚠️  Index may already exist:', error.message);
      }
    }
    
    // Verify the final structure
    console.log('🔍 Verifying final structure...');
    const [finalMenuItems] = await connection.query(`
      SELECT 
        c.name as category_name,
        m.name as item_name,
        m.price,
        m.category_id
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY c.sort_order, m.sort_order
    `);
    
    console.log('\n📋 Final menu structure:');
    finalMenuItems.forEach(item => {
      console.log(`   - ${item.category_name || 'Uncategorized'}: ${item.item_name} ($${item.price})`);
    });
    
    console.log('\n🎉 Categories migration completed successfully!');
    console.log('🚀 You can now use the new category-based menu system');
    
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

migrateCategories(); 