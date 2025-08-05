@echo off
echo 🔄 Auto-committing changes...

git add .
git status

set /p commit_msg="📝 Enter commit message (or press Enter for auto): "

if "%commit_msg%"=="" (
    set commit_msg=Auto-commit: Updated files on %date% %time%
)

git commit -m "%commit_msg%"

echo 📤 Pushing to GitHub...
git push origin master

echo ✅ Auto-commit and push completed!
pause