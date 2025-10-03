@echo off
echo Cleaning .next directory...
rmdir /s /q .next 2>nul
mkdir .next
echo Done! .next directory cleaned.
pause
