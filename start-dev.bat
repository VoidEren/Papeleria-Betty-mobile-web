@echo off
title Papeleria Betty - Servidor de Desarrollo
echo ========================================================
echo   Papeleria Betty - Iniciando entorno de desarrollo
echo   Backend Laravel: http://127.0.0.1:8000
echo   Frontend Vite:   http://localhost:5173
echo ========================================================
echo.
call npm.cmd run dev:all
pause
