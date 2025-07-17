const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔍 Database Connection Test\n');

// Show current configuration
console.log('📋 Current Configuration:');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`User: ${process.env.DB_USER || 'root'}`);
console.log(`Database: ${process.env.DB_NAME || 'palm_cafe'}`);
console.log(`Port: ${process.env.DB_PORT || 3306}`);
console.log(`Password: ${process.env.DB_PASSWORD ? '***set***' : '***not set***'}\n`);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 3306,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔌 Attempting to connect to MySQL server...');
    
    // Test basic connection without database
    connection = await mysql.createConnection({
      ...dbConfig,
      database: undefined
    });
    
    console.log('✅ Successfully connected to MySQL server!');
    
    // Test if we can create/access the database
    console.log('📦 Testing database access...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'palm_cafe'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'palm_cafe'}' is accessible`);
    
    // Test connecting to the specific database
    await connection.end();
    
    connection = await mysql.createConnection({
      ...dbConfig,
      database: process.env.DB_NAME || 'palm_cafe'
    });
    
    console.log('✅ Successfully connected to the database!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query test successful');
    
    console.log('\n🎉 All connection tests passed!');
    console.log('✅ Your database is ready to use');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔐 Access Denied - Possible solutions:');
      console.log('1. Check if username and password are correct');
      console.log('2. Ensure the MySQL user exists');
      console.log('3. Verify the user has proper permissions');
      console.log('4. Try connecting with MySQL command line to test credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔌 Connection Refused - Possible solutions:');
      console.log('1. Check if MySQL server is running');
      console.log('2. Verify the host and port are correct');
      console.log('3. Check firewall settings');
      console.log('4. For remote servers, ensure remote access is enabled');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n🌐 Host Not Found - Possible solutions:');
      console.log('1. Check if the host address is correct');
      console.log('2. Verify DNS resolution');
      console.log('3. For remote servers, check network connectivity');
    }
    
    console.log('\n📝 To fix this:');
    console.log('1. Update your .env file with correct credentials');
    console.log('2. Ensure MySQL server is running');
    console.log('3. Test connection manually with: mysql -h [host] -u [user] -p');
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection(); 