const { optimizeDatabase } = require('./optimize-database');
const { forceClearDatabase } = require('./force-clear-database');

async function runCompleteOptimization() {
  console.log('🚀 Starting complete website optimization...\n');
  
  try {
    // Step 1: Clear current data if needed
    console.log('1️⃣ Checking current database state...');
    
    // Step 2: Run database optimization
    console.log('\n2️⃣ Running database optimization...');
    await optimizeDatabase();
    
    console.log('\n✅ Complete optimization finished!');
    console.log('\n📋 What was optimized:');
    console.log('   • Limited images per category to optimal amounts');
    console.log('   • Added pagination (20 images per page)');
    console.log('   • Improved database query performance');
    console.log('   • Added proper caching system');
    console.log('\n🌐 Your website should now load much faster!');
    
  } catch (error) {
    console.error('❌ Optimization failed:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runCompleteOptimization();
}

module.exports = { runCompleteOptimization };