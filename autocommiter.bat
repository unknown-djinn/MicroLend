@echo off
title MicroLend Git Commit & Push

echo =====================================
echo        MicroLend Git Update
echo =====================================
echo.

REM Make sure Git repository exists
if not exist ".git" (
    echo ERROR: This is not a Git repository.
    echo Please run this file from the MicroLend project folder.
    pause
    exit /b 1
)

echo Current changes:
echo -------------------------------------
git status --short
echo -------------------------------------
echo.

REM Stage all changes
echo Staging changes...
git add .

REM Check if there is anything to commit
git diff --cached --quiet
if %errorlevel%==0 (
    echo.
    echo Nothing to commit.
    pause
    exit /b 0
)

echo.
set /p "commit_message=Enter commit message: "

REM Check for empty commit message
if "%commit_message%"=="" (
    echo.
    echo ERROR: Commit message cannot be empty.
    pause
    exit /b 1
)

echo.
echo Creating commit...
git commit -m "%commit_message%"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Commit failed.
    pause
    exit /b 1
)

echo.
echo Pushing to GitHub...
git push

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Push failed.
    pause
    exit /b 1
)

echo.
echo =====================================
echo       Successfully pushed!
echo =====================================
echo.
git status

pause