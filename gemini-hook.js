#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Hook function ที่จะรันหลังจาก Gemini แก้ไขไฟล์
function postGeminiHook() {
  try {
    console.log('🤖 Gemini CLI completed - Running auto-commit...');
    
    // Check if there are any changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (!status.trim()) {
      console.log('✅ No changes detected');
      return;
    }
    
    console.log('📝 Changes detected:');
    console.log(status);
    
    // Create commit message
    const timestamp = new Date().toLocaleString('th-TH');
    const commitMessage = `Gemini CLI update: ${timestamp}`;
    
    console.log(`🔄 Committing: "${commitMessage}"`);
    
    // Auto commit and push
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    execSync('git push origin master', { stdio: 'inherit' });
    
    console.log('✅ Successfully pushed to GitHub!');
    console.log('🚀 Render will auto-deploy in 1-2 minutes');
    
  } catch (error) {
    console.error('❌ Auto-commit error:', error.message);
  }
}

// Export for use as module
module.exports = { postGeminiHook };

// Run directly if called as script
if (require.main === module) {
  postGeminiHook();
}