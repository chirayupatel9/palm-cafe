@echo off
echo ========================================
echo    Palm Cafe Management System Setup
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed

echo.
echo [2/4] Installing dependencies...
echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

echo Installing client dependencies...
cd ../client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Setting up database...
cd server
if not exist .env (
    echo Creating .env file...
    copy env.example .env
    echo.
    echo ⚠️  Please edit server/.env file with your database credentials
    echo    Then run this script again
    echo.
    pause
    exit /b 0
)

echo Running database setup...
node setup-database.js
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed
    echo Please check your database credentials in server/.env
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Starting the application...
echo Starting Palm Cafe Management System...
echo.
echo 🌐 Local access: http://localhost:3000
echo 🌐 Network access: http://your-ip-address:3000
echo.
echo Press Ctrl+C to stop the application
echo.

call start-network.bat 