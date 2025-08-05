const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickOptimize() {
  try {
    console.log('🚀 เริ่มลบรูปเกิน...');
    
    // เก็บจำนวนที่เหมาะสม
    const keepLimits = {
      'wedding': 20,
      'corporate': 15,
      'fine-dining': 15,
      'buffet': 20,
      'cocktail': 10,
      'coffee-break': 10,
      'snack-box': 10,
      'government': 10,
      'signature': 10,
      'food-stall': 10
    };
    
    // ดึงรูปทั้งหมด
    const { data: allImages, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log(`📊 รูปทั้งหมด: ${allImages.length}`);
    
    // จัดกลุ่มตามหมวดหมู่
    const byCategory = {};
    allImages.forEach(img => {
      if (!byCategory[img.category]) {
        byCategory[img.category] = [];
      }
      byCategory[img.category].push(img);
    });
    
    // หารูปที่จะลบ
    let toDelete = [];
    Object.keys(byCategory).forEach(category => {
      const images = byCategory[category];
      const limit = keepLimits[category] || 10;
      
      console.log(`📂 ${category}: ${images.length} รูป -> เก็บ ${limit}`);
      
      if (images.length > limit) {
        const excess = images.slice(limit); // ลบรูปเก่า
        toDelete = toDelete.concat(excess);
        console.log(`   ลบ ${excess.length} รูป`);
      }
    });
    
    if (toDelete.length === 0) {
      console.log('✅ ไม่มีรูปเกิน');
      return;
    }
    
    console.log(`\n🗑️ จะลบ ${toDelete.length} รูป`);
    
    // ลบรูป
    let deleted = 0;
    for (const img of toDelete) {
      try {
        const { error: deleteError } = await supabase
          .from('portfolio_images')
          .delete()
          .eq('id', img.id);
        
        if (!deleteError) {
          deleted++;
          if (deleted % 50 === 0) {
            console.log(`✅ ลบแล้ว ${deleted}/${toDelete.length}...`);
          }
        }
      } catch (err) {
        // ไม่ต้องแสดง error เพื่อความเร็ว
      }
    }
    
    console.log(`\n🎉 ลบเสร็จ: ${deleted}/${toDelete.length} รูป`);
    
    // ตรวจสอบผลลัพธ์
    const { count } = await supabase
      .from('portfolio_images')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 เหลือรูปทั้งหมด: ${count} รูป`);
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

quickOptimize();