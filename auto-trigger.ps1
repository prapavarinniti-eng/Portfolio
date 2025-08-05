# PowerShell File Watcher with Auto Git Push
Write-Host "🔍 Starting PowerShell File Watcher..." -ForegroundColor Green

$watchPath = Get-Location
$filter = "*.*"
$includeSubdirectories = $true

# Create FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $watchPath
$watcher.Filter = $filter
$watcher.IncludeSubdirectories = $includeSubdirectories
$watcher.EnableRaisingEvents = $true

# Define the action
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $name = $Event.SourceEventArgs.Name
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # Ignore certain files/folders
    if ($path -match "(node_modules|\.git|\.next|dist|build)" -or 
        $name -match "\.(log|tmp)$" -or
        $name -eq "auto-trigger.ps1") {
        return
    }
    
    Write-Host "📝 File $changeType: $name" -ForegroundColor Yellow
    
    # Wait a bit to avoid multiple rapid commits
    Start-Sleep -Seconds 3
    
    try {
        Write-Host "🔄 Auto-committing..." -ForegroundColor Cyan
        
        git add .
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Auto-commit: $timestamp"
        git push origin master
        
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "🚀 Render will deploy in 1-2 minutes" -ForegroundColor Magenta
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Register event handlers
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action

Write-Host "⚡ File watcher is active!" -ForegroundColor Green
Write-Host "📁 Watching: $watchPath" -ForegroundColor White
Write-Host "🛑 Press Ctrl+C to stop" -ForegroundColor Yellow

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "🛑 File watcher stopped" -ForegroundColor Red
}