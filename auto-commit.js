#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function autoCommit() {
  console.log('🔄 Auto Git Commit & Push Tool\n');
  
  try {
    // Check if there are changes
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (!status.trim()) {
      console.log('✅ No changes to commit');
      rl.close();
      return;
    }
    
    console.log('📝 Changes detected:');
    console.log(status);
    
    // Show git status
    execSync('git status', { stdio: 'inherit' });
    
    console.log('\n📋 Commit options:');
    console.log('1. Quick commit (auto message)');
    console.log('2. Custom commit message');
    console.log('3. Cancel');
    
    const choice = await ask('\n👉 Choose option (1-3): ');
    
    let commitMessage;
    
    switch(choice) {
      case '1':
        const now = new Date();
        const timestamp = now.toLocaleString('th-TH');
        commitMessage = `Auto-update: Changes on ${timestamp}`;
        break;
        
      case '2':
        commitMessage = await ask('📝 Enter commit message: ');
        if (!commitMessage.trim()) {
          console.log('❌ Empty commit message. Cancelled.');
          rl.close();
          return;
        }
        break;
        
      case '3':
      default:
        console.log('❌ Cancelled');
        rl.close();
        return;
    }
    
    console.log(`\n🔄 Committing with message: "${commitMessage}"`);
    
    // Add all changes
    execSync('git add .', { stdio: 'inherit' });
    
    // Commit
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    // Ask if want to push
    const pushChoice = await ask('\n📤 Push to GitHub? (yes/no): ');
    
    if (pushChoice.toLowerCase() === 'yes' || pushChoice.toLowerCase() === 'y') {
      console.log('📤 Pushing to GitHub...');
      execSync('git push origin master', { stdio: 'inherit' });
      console.log('✅ Successfully pushed to GitHub!');
      console.log('🚀 Auto-deploy will start on Render in 1-2 minutes');
    } else {
      console.log('✅ Committed locally only');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  rl.close();
}

autoCommit();