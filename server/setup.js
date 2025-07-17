const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Palm Cafe Database Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
} else {
  console.log('📝 Creating .env file...');
  
  // Default configuration
  const defaultConfig = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=palm_cafe
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development
`;

  fs.writeFileSync(envPath, defaultConfig);
  console.log('✅ .env file created with default settings');
}

console.log('\n📋 Database Setup Instructions:');
console.log('1. Make sure MySQL is installed and running');
console.log('2. Create the database by running: mysql -u root -p < setup-database.sql');
console.log('3. Update the .env file with your MySQL credentials if needed');
console.log('4. Start the server with: npm run dev\n');

console.log('🔧 Current .env configuration:');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(envContent);
}

console.log('\n📖 Next steps:');
console.log('1. Install MySQL if not already installed');
console.log('2. Run the database setup script');
console.log('3. Update .env with your MySQL password');
console.log('4. Start the application\n');

rl.question('Would you like to test the database connection now? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n🔍 Testing database connection...');
    
    // Load environment variables
    require('dotenv').config();
    
    // Test database connection
    const { testConnection } = require('./config/database');
    
    testConnection()
      .then((connected) => {
        if (connected) {
          console.log('✅ Database connection successful!');
          console.log('🎉 You can now start the application with: npm run dev');
        } else {
          console.log('❌ Database connection failed');
          console.log('Please check your MySQL installation and .env configuration');
        }
      })
      .catch((error) => {
        console.log('❌ Database connection error:', error.message);
        console.log('Please ensure MySQL is running and credentials are correct');
      })
      .finally(() => {
        rl.close();
      });
  } else {
    console.log('\n👋 Setup complete! Remember to configure your database before starting the app.');
    rl.close();
  }
}); 