@echo off
echo 🤖 Running Gemini CLI with Auto-Push...
echo.

REM เก็บสถานะก่อน run Gemini
git status --porcelain > before.tmp

REM รัน Gemini CLI command
%*

REM เช็คสถานะหลัง run Gemini
git status --porcelain > after.tmp

REM เปรียบเทียบว่ามีการเปลี่ยนแปลงไหม
fc /b before.tmp after.tmp >nul 2>&1

if errorlevel 1 (
    echo.
    echo 📝 Changes detected after Gemini CLI
    echo 🔄 Auto-committing and pushing...
    
    git add .
    
    REM สร้าง commit message พร้อม timestamp
    for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (
        for /f "tokens=1-2 delims=: " %%e in ('time /t') do (
            set datetime=%%c-%%b-%%a %%e:%%f
        )
    )
    
    git commit -m "Gemini CLI update: %datetime%"
    git push origin master
    
    echo ✅ Successfully pushed to GitHub!
    echo 🚀 Render will auto-deploy in 1-2 minutes
) else (
    echo ✅ No changes detected
)

REM ลบไฟล์ temp
del before.tmp after.tmp

echo.
echo 🎉 Gemini CLI with Auto-Push completed!