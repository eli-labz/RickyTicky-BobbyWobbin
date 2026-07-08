@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%"

where bun >nul 2>nul
if errorlevel 1 (
  echo bun is not installed or not available on PATH.
  popd
  exit /b 1
)

call bun run start
set "EXIT_CODE=%ERRORLEVEL%"

popd
exit /b %EXIT_CODE%