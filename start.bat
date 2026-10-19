@echo off
title Sangeetify Music App
echo ====================================================
echo             Starting Sangeetify Music App
echo ====================================================
echo [1/2] Starting Python Backend on port 5005...
start "Sangeetify Backend (Port 5005)" cmd /k "cd /d "%~dp0\server" && python app.py"

echo [2/2] Waiting for backend to initialize...
timeout /t 2 /nobreak >nul

echo Starting Vite Frontend...
start "Sangeetify Frontend" cmd /k "cd /d "%~dp0" && npm run dev"

echo Opening browser at http://localhost:5173 ...
timeout /t 3 /nobreak >nul
start http://localhost:5173
