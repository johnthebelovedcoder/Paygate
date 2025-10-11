@echo off
echo ========================================
echo PayGate UI - Automated Cleanup Script
echo ========================================
echo.

echo 1. Formatting code with Prettier...
npm run format
if %errorlevel% neq 0 (
    echo Error during formatting
    exit /b %errorlevel%
)

echo.
echo 2. Fixing ESLint issues...
npm run lint:fix
if %errorlevel% neq 0 (
    echo Error during ESLint fix
    exit /b %errorlevel%
)

echo.
echo 3. Removing unused exports ^(optional^)...
npm run clean:all 2>nul
if %errorlevel% equ 0 (
    echo Successfully removed unused exports
) else (
    echo Note: ts-unused-exports not available or no unused exports found
)

echo.
echo Cleanup complete! Your code should now have fewer TypeScript errors.
echo.
echo Next steps:
echo 1. Open the project in VS Code
echo 2. Let ESLint and Prettier run on save
echo 3. Use Ctrl+Shift+P and type "Organize Imports" for remaining issues
echo.
pause