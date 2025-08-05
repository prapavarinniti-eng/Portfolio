const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDelete() {
  try {
    console.log('🔍 ตรวจสอบการลบ...\n');
    
    // ดึงรูป 1 รูปมาทดสอบ
    const { data: testImages, error: fetchError } = await supabase
      .from('portfolio_images')
      .select('*')
      .limit(3);
    
    if (fetchError) {
      console.log('❌ ไม่สามารถดึงข้อมูลได้:', fetchError);
      return;
    }
    
    if (!testImages || testImages.length === 0) {
      console.log('✅ ไม่มีรูปในฐานข้อมูล');
      return;
    }
    
    console.log(`📊 พบรูปทดสอบ ${testImages.length} รูป:`);
    testImages.forEach((img, i) => {
      console.log(`${i + 1}. ID: ${img.id.substring(0, 8)}... | ${img.title}`);
    });
    
    // ทดสอบลบแต่ละวิธี
    console.log('\n🧪 ทดสอบการลบ...');
    
    const testImg = testImages[0];
    console.log(`🎯 ทดสอบลบ: ${testImg.title}`);
    
    // วิธีที่ 1: ลบด้วย eq
    console.log('\n1️⃣ ลบด้วย .eq()');
    const { data: deleteData1, error: deleteError1 } = await supabase
      .from('portfolio_images')
      .delete()
      .eq('id', testImg.id)
      .select();
    
    console.log('   Data returned:', deleteData1);
    console.log('   Error:', deleteError1);
    
    // ตรวจสอบว่าลบแล้วหรือยัง
    const { data: checkData1, error: checkError1 } = await supabase
      .from('portfolio_images')
      .select('id')
      .eq('id', testImg.id);
    
    console.log('   ตรวจสอบหลังลบ:', checkData1?.length || 0, 'รายการ');
    
    if (checkData1 && checkData1.length > 0) {
      console.log('❌ ลบไม่สำเร็จด้วยวิธีนี้');
      
      // วิธีที่ 2: ลบด้วย match
      console.log('\n2️⃣ ลบด้วย .match()');
      const { data: deleteData2, error: deleteError2 } = await supabase
        .from('portfolio_images')
        .delete()
        .match({ id: testImg.id });
      
      console.log('   Error:', deleteError2);
      
      // วิธีที่ 3: ลบด้วย SQL function (ถ้ามี)
      console.log('\n3️⃣ ลองใช้ RPC delete');
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('delete_image_by_id', { image_id: testImg.id });
      
      console.log('   RPC Error:', rpcError);
      
    } else {
      console.log('✅ ลบสำเร็จด้วยวิธีแรก!');
    }
    
    // นับจำนวนล่าสุด
    const { data: finalCount } = await supabase
      .from('portfolio_images')
      .select('id');
    
    console.log(`\n📊 จำนวนรูปปัจจุบัน: ${finalCount?.length || 0}`);
    
  } catch (error) {
    console.log('💥 Error:', error);
  }
}

debugDelete();