@echo off
echo ==================================
echo NFLAB-WEB-MG Project Backup Tool
echo ==================================
echo.

:: Get current date and time
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set YEAR=%datetime:~0,4%
set MONTH=%datetime:~4,2%
set DAY=%datetime:~6,2%
set HOUR=%datetime:~8,2%
set MINUTE=%datetime:~10,2%
set currentDate=%YEAR%-%MONTH%-%DAY%
set currentTime=%HOUR%%MINUTE%

:: Backup file names
set backupNameFull=NFLAB-WEB-MG-Complete-Backup-%currentDate%-%currentTime%.zip
set backupNameSource=NFLAB-WEB-MG-Source-Backup-%currentDate%-%currentTime%.zip

echo Current directory: %CD%
echo.

:: Check essential files
echo Checking project files...

if not exist "package.json" (
    echo ERROR: package.json not found!
    goto :error
)
if not exist "index.html" (
    echo ERROR: index.html not found!
    goto :error
)
if not exist "src" (
    echo ERROR: src folder not found!
    goto :error
)
if not exist "public" (
    echo ERROR: public folder not found!
    goto :error
)

echo Project files check passed!
echo.

:: Check if node_modules exists
set hasNodeModules=false
if exist "node_modules" set hasNodeModules=true

:: Show backup options
echo Please select backup type:
echo 1. Complete backup (with node_modules) - ~244MB
echo 2. Source code backup (without node_modules) - ~3MB
echo 3. Create both backups
echo.

set /p choice="Enter your choice (1/2/3): "

echo.

:: Create file list for source backup
set sourceFiles=src public package.json package-lock.json index.html vite.config.ts tsconfig.json README.md

:: Add optional files if they exist
if exist "INSTALL.md" set sourceFiles=%sourceFiles% INSTALL.md
if exist "SYSTEM_BACKUP_2025-01-27.md" set sourceFiles=%sourceFiles% SYSTEM_BACKUP_2025-01-27.md
if exist "FILES_MANIFEST.md" set sourceFiles=%sourceFiles% FILES_MANIFEST.md
if exist "BACKUP_GUIDE.md" set sourceFiles=%sourceFiles% BACKUP_GUIDE.md
if exist "tsconfig.node.json" set sourceFiles=%sourceFiles% tsconfig.node.json
if exist ".gitignore" set sourceFiles=%sourceFiles% .gitignore
if exist "SYSTEM_STATUS.md" set sourceFiles=%sourceFiles% SYSTEM_STATUS.md
if exist "dist" (
    set sourceFiles=%sourceFiles% dist
    echo Found dist folder, will include in backup
)

echo.

:: Execute backup based on choice
if "%choice%"=="1" goto :fullBackup
if "%choice%"=="2" goto :sourceBackup
if "%choice%"=="3" goto :bothBackups
goto :invalidChoice

:fullBackup
echo Creating complete backup (with node_modules)...

if "%hasNodeModules%"=="false" (
    echo WARNING: node_modules folder not found!
    set /p installChoice="Do you want to run npm install first? (y/n): "
    if /i "!installChoice!"=="y" (
        echo Installing dependencies...
        call npm install
        echo Dependencies installed successfully!
    )
)

:: Use PowerShell to create zip with all files including node_modules
powershell -Command "Compress-Archive -Path '%sourceFiles%', 'node_modules' -DestinationPath '%backupNameFull%' -Force"

if exist "%backupNameFull%" (
    echo Complete backup created successfully: %backupNameFull%
    for %%A in ("%backupNameFull%") do echo Backup file size: %%~zA bytes
) else (
    echo Failed to create complete backup!
    goto :error
)
goto :success

:sourceBackup
echo Creating source code backup (without node_modules)...

:: Use PowerShell to create zip with source files only
powershell -Command "Compress-Archive -Path '%sourceFiles%' -DestinationPath '%backupNameSource%' -Force"

if exist "%backupNameSource%" (
    echo Source backup created successfully: %backupNameSource%
    for %%A in ("%backupNameSource%") do echo Backup file size: %%~zA bytes
) else (
    echo Failed to create source backup!
    goto :error
)
goto :success

:bothBackups
echo Creating both backups...
echo.

echo 1/2 Creating source code backup...
powershell -Command "Compress-Archive -Path '%sourceFiles%' -DestinationPath '%backupNameSource%' -Force"

if exist "%backupNameSource%" (
    echo Source backup created successfully: %backupNameSource%
    for %%A in ("%backupNameSource%") do echo Source backup size: %%~zA bytes
) else (
    echo Failed to create source backup!
)

echo.
echo 2/2 Creating complete backup...

if "%hasNodeModules%"=="false" (
    echo WARNING: node_modules folder not found!
    set /p installChoice="Do you want to run npm install first? (y/n): "
    if /i "!installChoice!"=="y" (
        echo Installing dependencies...
        call npm install
        echo Dependencies installed successfully!
    )
)

powershell -Command "Compress-Archive -Path '%sourceFiles%', 'node_modules' -DestinationPath '%backupNameFull%' -Force"

if exist "%backupNameFull%" (
    echo Complete backup created successfully: %backupNameFull%
    for %%A in ("%backupNameFull%") do echo Complete backup size: %%~zA bytes
) else (
    echo Failed to create complete backup!
)
goto :success

:invalidChoice
echo Invalid choice! Please run the script again and select 1, 2, or 3.
goto :error

:success
echo.
echo ==================================
echo Backup completed successfully!
echo ==================================
echo.

echo Created backup files:
if exist "%backupNameFull%" echo - %backupNameFull%
if exist "%backupNameSource%" echo - %backupNameSource%

echo.
echo Usage recommendations:
echo - Complete backup is suitable for quick deployment and recovery
echo - Source backup is suitable for version control and transfer
echo - Recommend saving backups to multiple locations
echo.

echo Backup task completed! Thank you for using NFLAB-WEB-MG Backup Tool
goto :end

:error
echo.
echo ERROR: Backup failed! Please check if you are in the project root directory.
echo Required files: package.json, index.html, src/, public/
echo.

:end
pause 