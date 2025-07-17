# Local MySQL Setup Guide

## Option 1: Use XAMPP (Recommended for Windows)

### 1. Download and Install XAMPP
- Download XAMPP from: https://www.apachefriends.org/download.html
- Install with default settings
- Start XAMPP Control Panel

### 2. Start MySQL Service
- Open XAMPP Control Panel
- Click "Start" next to MySQL
- MySQL will run on localhost:3306

### 3. Set Root Password (Optional)
- Open phpMyAdmin: http://localhost/phpmyadmin
- Go to User Accounts → root → Edit Privileges
- Set a password (remember this for .env file)

### 4. Update .env File
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=palm_cafe
DB_PORT=3306
```

## Option 2: Use Docker (Cross-platform)

### 1. Install Docker
- Download Docker Desktop from: https://www.docker.com/products/docker-desktop
- Install and start Docker

### 2. Run MySQL Container
```bash
docker run --name palm-cafe-mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=palm_cafe \
  -p 3306:3306 \
  -d mysql:8.0
```

### 3. Update .env File
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=palm_cafe
DB_PORT=3306
```

## Option 3: Install MySQL Directly

### Windows
1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
2. Run installer and follow setup wizard
3. Set root password during installation
4. Start MySQL service

### macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

## Testing the Setup

After setting up MySQL, test the connection:

```bash
# Test with MySQL command line
mysql -u root -p

# Or test with our script
node test-connection.js
```

## Quick Setup Commands

1. **Update .env file** with local MySQL credentials
2. **Test connection**: `node test-connection.js`
3. **Create database**: `npm run create-db`
4. **Start server**: `npm run dev`

## Troubleshooting

### Connection Refused
- Check if MySQL service is running
- Verify port 3306 is not blocked
- Try connecting with MySQL command line first

### Access Denied
- Check username and password
- Ensure user has proper permissions
- Try connecting without password if not set

### Port Already in Use
- Check if another MySQL instance is running
- Change port in .env file
- Kill existing MySQL processes 