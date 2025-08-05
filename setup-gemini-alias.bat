@echo off
echo 🔧 Setting up Gemini CLI alias with auto-push...

REM สร้าง batch file ใน System PATH
set "aliasPath=%USERPROFILE%\gemini-auto.bat"

echo @echo off > "%aliasPath%"
echo cd /d "%CD%" >> "%aliasPath%"
echo powershell -ExecutionPolicy Bypass -File "%CD%\gemini-autopush.ps1" %%* >> "%aliasPath%"

echo.
echo ✅ Alias created at: %aliasPath%
echo.
echo 🎯 วิธีใช้งาน:
echo    แทนที่จะใช้: gemini [command]
echo    ให้ใช้: gemini-auto [command]
echo.
echo 💡 ตัวอย่าง:
echo    gemini-auto "แก้ไขไฟล์ admin-helper.js ให้มีฟีเจอร์ใหม่"
echo.
echo 🚀 ผลลัพธ์: Gemini จะแก้ไข + auto-push ไป GitHub + Render auto-deploy
echo.
pause