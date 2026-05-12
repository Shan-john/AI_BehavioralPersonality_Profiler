@echo off
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

echo Creating documentation structure...

if not exist "docs" mkdir "docs"

echo # Architecture > "docs\architecture.md"
echo # API Contracts > "docs\api-contracts.md"
echo # Database Schema > "docs\database-schema.md"
echo # Flow Diagrams > "docs\flow-diagrams.md"

echo Documentation structure created successfully.
pause
