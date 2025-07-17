const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔄 Switch to Local MySQL Setup\n');

const envPath = path.join(__dirname, '.env');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Creating one...');
}

// Local MySQL configuration
const localConfig = `# Database Configuration - Local MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=palm_cafe
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development
`;

console.log('📋 This will update your .env file to use local MySQL:');
console.log('   Host: localhost');
console.log('   User: root');
console.log('   Password: (empty)');
console.log('   Database: palm_cafe');
console.log('   Port: 3306\n');

console.log('⚠️  Before proceeding, make sure:');
console.log('   1. MySQL is installed and running locally');
console.log('   2. MySQL is accessible on localhost:3306');
console.log('   3. Root user has no password (or update .env manually)\n');

rl.question('Do you want to switch to local MySQL? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    try {
      // Backup existing .env if it exists
      if (fs.existsSync(envPath)) {
        const backupPath = path.join(__dirname, '.env.backup');
        fs.copyFileSync(envPath, backupPath);
        console.log('✅ Existing .env backed up to .env.backup');
      }
      
      // Write new local configuration
      fs.writeFileSync(envPath, localConfig);
      console.log('✅ .env updated for local MySQL');
      
      console.log('\n📝 Next steps:');
      console.log('1. Install and start MySQL locally (see local-setup.md)');
      console.log('2. Test connection: node test-connection.js');
      console.log('3. Create database: npm run create-db');
      console.log('4. Start server: npm run dev');
      
      console.log('\n🔧 If you need to set a password:');
      console.log('   Edit .env file and add your password to DB_PASSWORD');
      
    } catch (error) {
      console.error('❌ Error updating .env file:', error.message);
    }
  } else {
    console.log('👋 No changes made. You can manually edit .env file.');
  }
  
  rl.close();
}); 