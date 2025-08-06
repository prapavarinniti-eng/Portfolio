const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 ============ ลบรูปซ้ำ ============');
console.log('');

async function removeDuplicates() {
  console.log('🔍 กำลังหารูปซ้ำ...');
  
  // ดึงข้อมูลทั้งหมด
  const { data: allImages, error } = await supabase
    .from('portfolio_images')
    .select('id, image_url, created_at')
    .order('created_at', { ascending: true });
    
  if (error) {
    console.log('❌ ข้อผิดพลาด:', error.message);
    return;
  }
  
  console.log(`📊 พบรูปทั้งหมด: ${allImages.length} รูป`);
  
  // หารูปซ้ำ
  const seenUrls = new Set();
  const duplicates = [];
  
  for (const image of allImages) {
    if (seenUrls.has(image.image_url)) {
      duplicates.push(image);
    } else {
      seenUrls.add(image.image_url);
    }
  }
  
  if (duplicates.length === 0) {
    console.log('✅ ไม่พบรูปซ้ำ!');
    return;
  }
  
  console.log(`🎯 พบรูปซ้ำ: ${duplicates.length} รูป`);
  console.log('');
  
  // แสดงรายการรูปซ้ำ
  for (const dup of duplicates.slice(0, 10)) { // แสดง 10 รูปแรก
    console.log(`  🗑️  ${dup.image_url}`);
  }
  
  if (duplicates.length > 10) {
    console.log(`  ... และอีก ${duplicates.length - 10} รูป`);
  }
  
  console.log('');
  console.log('⚠️  จะลบรูปซ้ำออกจากฐานข้อมูล (เก็บรูปแรกไว้)');
  console.log('💡 รูปในโฟลเดอร์ยังอยู่ครบ ไม่ต้องกังวล');
  console.log('');
  
  // ลบรูปซ้ำ
  console.log('🗑️  กำลังลบรูปซ้ำ...');
  
  for (const dup of duplicates) {
    const { error: deleteError } = await supabase
      .from('portfolio_images')
      .delete()
      .eq('id', dup.id);
      
    if (deleteError) {
      console.log(`❌ ลบไม่ได้: ${dup.image_url}`);
    }
  }
  
  console.log(`✅ ลบรูปซ้ำเสร็จแล้ว: ${duplicates.length} รูป`);
  
  // แสดงสถิติใหม่
  const { data: finalCount } = await supabase
    .from('portfolio_images')
    .select('id', { count: 'exact' });
    
  console.log(`📊 เหลือรูปในฐานข้อมูล: ${finalCount.length} รูป`);
}

removeDuplicates().catch(console.error);