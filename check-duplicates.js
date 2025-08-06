const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
  console.log('🔍 ============ ตรวจสอบรูปซ้ำ ============\n');
  
  // ดึงข้อมูลทั้งหมด
  const { data: allImages } = await supabase
    .from('portfolio_images')
    .select('id, image_url, title, created_at')
    .order('image_url');
  
  console.log(`📊 รูปทั้งหมด: ${allImages.length} รูป\n`);
  
  // จัดกลุ่มตาม image_url
  const groupedByUrl = {};
  
  for (const image of allImages) {
    if (!groupedByUrl[image.image_url]) {
      groupedByUrl[image.image_url] = [];
    }
    groupedByUrl[image.image_url].push(image);
  }
  
  // หารูปที่มีมากกว่า 1 record
  const duplicates = Object.entries(groupedByUrl)
    .filter(([url, records]) => records.length > 1);
  
  if (duplicates.length === 0) {
    console.log('✅ ไม่พบรูปซ้ำ!');
    return;
  }
  
  console.log(`🎯 พบรูปซ้ำ: ${duplicates.length} ไฟล์\n`);
  
  let totalDuplicateRecords = 0;
  
  for (const [url, records] of duplicates) {
    console.log(`📁 ${url} (${records.length} records):`);
    
    records.forEach((record, index) => {
      const date = new Date(record.created_at).toLocaleString('th-TH');
      const status = index === 0 ? '✅ เก็บไว้' : '🗑️  ลบออก';
      console.log(`   ${status} - ID: ${record.id} - ${date}`);
      
      if (index > 0) totalDuplicateRecords++;
    });
    
    console.log('');
  }
  
  console.log(`📊 สรุป:`);
  console.log(`   รูปไม่ซ้ำ: ${Object.keys(groupedByUrl).length} ไฟล์`);
  console.log(`   รูปซ้ำ: ${totalDuplicateRecords} records`);
  console.log(`   รวมทั้งหมด: ${allImages.length} records`);
  
  console.log(`\n💡 รัน "npm run easy:remove-duplicates" เพื่อลบรูปซ้ำ`);
}

checkDuplicates().catch(console.error);