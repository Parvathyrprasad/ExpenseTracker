@echo off
echo Running ExpenseTracker tests before commit...

call npm test

if errorlevel 1 (
    echo Pre-commit check failed. Commit cancelled.
    exit /b 1
)

echo All tests passed. Commit allowed.
exit /b 0