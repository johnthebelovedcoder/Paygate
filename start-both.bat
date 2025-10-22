@echo off
echo Starting Paygate frontend and backend servers...

REM Start the backend server in a separate window
start "Paygate Backend" cmd /k "cd paygate-backend-python && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

REM Give the backend a moment to start
timeout /t 3 /nobreak >nul

REM Start the frontend server in another window
start "Paygate Frontend" cmd /k "npm run start"

echo Both servers should now be starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000 (or the next available port)
echo.
echo Note: Close this window, or the servers may not start properly.