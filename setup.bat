@echo off
REM Ensure that Git hooks directory exists
if not exist ".git\hooks" mkdir ".git\hooks"

REM Create the pre-commit hook file with content
(
echo #!/bin/sh
echo # Ensure consistent line endings and avoid committing files with inconsistent line endings
echo.
echo # Configure Git to handle line endings
echo git config core.autocrlf input
echo git config core.safecrlf warn
echo.
echo # Normalize line endings and add files to the staging area
echo git add --renormalize .
echo.
echo # Optionally, run additional checks or commands here
) > ".git\hooks\pre-commit"

REM Set core.autocrlf and core.safecrlf settings for Git
git config --global core.autocrlf input
git config --global core.safecrlf warn

REM Inform the user
echo Setup complete. Please run 'yarn install' or 'npm install' in the ProductInsightApp directory.
pause
