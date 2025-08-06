const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function easyReset() {
  console.log('🧹 ล้างข้อมูลเก่า...');
  
  // ลบข้อมูลทั้งหมด
  const { error } = await supabase
    .from('portfolio_images')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // ลบทั้งหมด
    
  if (error) {
    console.log('❌ ข้อผิดพลาด:', error.message);
    return;
  }
  
  console.log('✅ ล้างข้อมูลเสร็จแล้ว!');
  console.log('📁 ตอนนี้สามารถอัพโหลดรูปใหม่ได้');
}

easyReset();