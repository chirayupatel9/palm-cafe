@echo off
echo Starting Palm Cafe with network access...
echo.

echo Starting Backend Server...
cd server
start "Palm Cafe Backend" cmd /k "npm start"
cd ..

echo.
echo Starting Frontend...
cd client
start "Palm Cafe Frontend" cmd /k "npm run start:network"
cd ..

echo.
echo Palm Cafe is starting up...
echo Backend will be available at: http://0.0.0.0:5000/api
echo Frontend will be available at: http://0.0.0.0:3000
echo.
echo You can access the app from other devices on your network using your computer's IP address.
echo To find your IP address, run: ipconfig
echo.
echo Waiting for servers to start...
timeout /t 5 /nobreak > nul
echo.
echo Servers should now be running!
echo Check the opened command windows for any errors.
echo.
pause 