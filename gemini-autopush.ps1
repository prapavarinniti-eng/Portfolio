# Gemini CLI with Auto-Push to GitHub
param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$GeminiArgs
)

Write-Host "🤖 Gemini CLI with Auto-Push" -ForegroundColor Green
Write-Host "📁 Working Directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "" 

# เก็บสถานะ git ก่อน run Gemini
$beforeStatus = git status --porcelain

Write-Host "🚀 Running Gemini CLI..." -ForegroundColor Yellow
Write-Host "Command: gemini $($GeminiArgs -join ' ')" -ForegroundColor Gray

# รัน Gemini CLI
try {
    & gemini @GeminiArgs
    $geminiExitCode = $LASTEXITCODE
} catch {
    Write-Host "❌ Error running Gemini CLI: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# เช็คสถานะ git หลัง run Gemini
$afterStatus = git status --porcelain

# เปรียบเทียบการเปลี่ยนแปลง
if ($beforeStatus -ne $afterStatus -or $afterStatus) {
    Write-Host "📝 Changes detected after Gemini CLI execution" -ForegroundColor Yellow
    
    # แสดงการเปลี่ยนแปลง
    Write-Host "Changes:" -ForegroundColor Cyan
    git status --short
    
    Write-Host ""
    Write-Host "🔄 Auto-committing and pushing to GitHub..." -ForegroundColor Magenta
    
    try {
        # Add all changes
        git add .
        
        # Create commit message with timestamp
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $commitMessage = "Gemini CLI update: $timestamp"
        
        Write-Host "💬 Commit message: $commitMessage" -ForegroundColor Gray
        
        # Commit
        git commit -m $commitMessage
        
        # Push to GitHub
        git push origin master
        
        Write-Host ""
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "🚀 Render will auto-deploy in 1-2 minutes" -ForegroundColor Magenta
        Write-Host "🌐 Your changes will be live at: https://portfolio-yap6.onrender.com" -ForegroundColor Blue
        
    } catch {
        Write-Host "❌ Error during git operations: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ No changes detected - nothing to commit" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Gemini CLI with Auto-Push completed!" -ForegroundColor Green

# Exit with same code as Gemini CLI
exit $geminiExitCode