#!/usr/bin/env node

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 File Watcher Started - Auto Git Push');
console.log('📁 Watching for changes in current directory...\n');

// ไฟล์ที่จะ ignore
const ignored = [
  'node_modules/**',
  '.git/**',
  '.next/**',
  'dist/**',
  'build/**',
  '*.log',
  '.env*',
  'watch-and-push.js'
];

let commitTimer = null;
const COMMIT_DELAY = 5000; // รอ 5 วินาที หลังจากหยุดแก้ไข

// Watch files
const watcher = chokidar.watch('.', {
  ignored: ignored,
  ignoreInitial: true,
  persistent: true
});

function autoCommitAndPush() {
  try {
    console.log('🔄 Auto-committing changes...');
    
    // Check if there are changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (!status.trim()) {
      console.log('✅ No changes to commit');
      return;
    }
    
    const timestamp = new Date().toLocaleString('th-TH');
    const commitMessage = `Auto-commit: ${timestamp}`;
    
    // Add, commit, and push
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    execSync('git push origin master', { stdio: 'inherit' });
    
    console.log('✅ Successfully pushed to GitHub!');
    console.log('🚀 Render will auto-deploy in 1-2 minutes\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Event handlers
watcher.on('change', (filePath) => {
  console.log(`📝 File changed: ${filePath}`);
  
  // Clear existing timer
  if (commitTimer) {
    clearTimeout(commitTimer);
  }
  
  // Set new timer - จะ commit หลังจากหยุดแก้ไข 5 วินาที
  commitTimer = setTimeout(() => {
    autoCommitAndPush();
  }, COMMIT_DELAY);
});

watcher.on('add', (filePath) => {
  console.log(`➕ File added: ${filePath}`);
  
  if (commitTimer) {
    clearTimeout(commitTimer);
  }
  
  commitTimer = setTimeout(() => {
    autoCommitAndPush();
  }, COMMIT_DELAY);
});

watcher.on('unlink', (filePath) => {
  console.log(`🗑️  File deleted: ${filePath}`);
  
  if (commitTimer) {
    clearTimeout(commitTimer);
  }
  
  commitTimer = setTimeout(() => {
    autoCommitAndPush();
  }, COMMIT_DELAY);
});

watcher.on('error', (error) => {
  console.error('❌ Watcher error:', error);
});

console.log('⚡ Ready! Edit any file and it will auto-commit and push to GitHub');
console.log('⏰ Changes will be committed 5 seconds after you stop editing');
console.log('🛑 Press Ctrl+C to stop watching\n');

// Handle exit
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping file watcher...');
  watcher.close();
  process.exit(0);
});