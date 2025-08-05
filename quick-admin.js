const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';

const supabase = createClient(supabaseUrl, supabaseKey);

// รับ command จาก command line
const command = process.argv[2];

async function quickStats() {
  try {
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('category');
    
    if (error) throw error;
    
    const categoryCount = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`📊 รวม: ${data.length} รูป`);
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function quickUpload() {
  try {
    console.log('🚀 เริ่มอัพโหลด...');
    const { uploadImages } = require('./bulk-image-upload');
    await uploadImages();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function quickOptimize() {
  try {
    console.log('⚡ เริ่มเพิ่มประสิทธิภาพ...');
    const { optimizeDatabase } = require('./optimize-database');
    await optimizeDatabase();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function quickClear() {
  try {
    console.log('🗑️ ลบรูปทั้งหมด...');
    const { forceDeleteAll } = require('./force-clear-all');
    await forceDeleteAll();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function showHelp() {
  console.log('🎯 Fuzio Admin Quick Commands:');
  console.log('');
  console.log('node quick-admin stats     - ดูสถิติรูปภาพ');
  console.log('node quick-admin upload    - อัพโหลดรูปจากโฟลเดอร์');
  console.log('node quick-admin optimize  - เพิ่มประสิทธิภาพฐานข้อมูล');
  console.log('node quick-admin clear     - ลบรูปทั้งหมด');
  console.log('node quick-admin help      - แสดงความช่วยเหลือ');
  console.log('');
  console.log('หรือรัน: node admin-commands.js สำหรับ interactive mode');
}

// รันคำสั่งตาม parameter
switch (command) {
  case 'stats':
    quickStats();
    break;
  case 'upload':
    quickUpload();
    break;
  case 'optimize':
    quickOptimize();
    break;
  case 'clear':
    quickClear();
    break;
  case 'help':
  default:
    showHelp();
}