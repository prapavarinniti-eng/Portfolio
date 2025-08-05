const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';

const supabase = createClient(supabaseUrl, supabaseKey);

// จำกัดจำนวนภาพต่อหมวดหมู่ที่เหมาะสมสำหรับแสดงผล
const IMAGES_PER_CATEGORY = {
  'wedding': 20,
  'corporate': 15,
  'fine-dining': 15,
  'buffet': 20,
  'cocktail': 10,
  'coffee-break': 10,
  'snack-box': 10,
  'government': 10,
  'signature': 10
};

async function optimizeDatabase() {
  try {
    console.log('🚀 Starting database optimization...');
    
    // ดึงข้อมูลทั้งหมดเพื่อดูสถานะปัจจุบัน
    const { data: allImages, error: fetchError } = await supabase
      .from('portfolio_images')
      .select('id, title, category, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching images:', fetchError);
      return;
    }

    console.log(`📊 Total images in database: ${allImages.length}`);

    // จัดกลุ่มตามหมวดหมู่
    const imagesByCategory = {};
    allImages.forEach(img => {
      if (!imagesByCategory[img.category]) {
        imagesByCategory[img.category] = [];
      }
      imagesByCategory[img.category].push(img);
    });

    // แสดงสถิติก่อนเพิ่มประสิทธิภาพ
    console.log('\n📈 Current distribution:');
    Object.keys(imagesByCategory).forEach(category => {
      console.log(`  ${category}: ${imagesByCategory[category].length} images`);
    });

    let totalToDelete = 0;
    let imagesToDelete = [];

    // คำนวณภาพที่ต้องลบ
    Object.keys(imagesByCategory).forEach(category => {
      const images = imagesByCategory[category];
      const limit = IMAGES_PER_CATEGORY[category] || 10;
      
      if (images.length > limit) {
        const excess = images.length - limit;
        totalToDelete += excess;
        
        // เก็บภาพล่าสุด ลบภาพเก่า
        const toDelete = images.slice(limit);
        imagesToDelete = imagesToDelete.concat(toDelete.map(img => img.id));
        
        console.log(`  ${category}: จะลบ ${excess} ภาพ (เหลือ ${limit})`);
      }
    });

    if (totalToDelete === 0) {
      console.log('✅ Database is already optimized!');
      return;
    }

    console.log(`\n🗑️  Total images to delete: ${totalToDelete}`);
    console.log(`📊  Database will be reduced from ${allImages.length} to ${allImages.length - totalToDelete} images`);

    // ลบภาพส่วนเกิน
    console.log('\n🔄 Deleting excess images...');
    
    const batchSize = 50;
    let deletedCount = 0;

    for (let i = 0; i < imagesToDelete.length; i += batchSize) {
      const batch = imagesToDelete.slice(i, i + batchSize);
      
      const { error: deleteError } = await supabase
        .from('portfolio_images')
        .delete()
        .in('id', batch);

      if (deleteError) {
        console.error(`❌ Error deleting batch:`, deleteError);
      } else {
        deletedCount += batch.length;
        console.log(`✅ Deleted ${batch.length} images (total: ${deletedCount}/${totalToDelete})`);
      }
    }

    // รอสักครู่แล้วตรวจสอบผลลัพธ์
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: finalImages, error: finalError } = await supabase
      .from('portfolio_images')
      .select('id, category')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Error checking final results:', finalError);
      return;
    }

    // แสดงสถิติหลังเพิ่มประสิทธิภาพ
    const finalByCategory = {};
    finalImages.forEach(img => {
      if (!finalByCategory[img.category]) {
        finalByCategory[img.category] = 0;
      }
      finalByCategory[img.category]++;
    });

    console.log('\n🎉 Optimization completed!');
    console.log(`📊 Total images reduced from ${allImages.length} to ${finalImages.length}`);
    console.log(`🗑️  Successfully deleted ${allImages.length - finalImages.length} images`);
    console.log('\n📈 Final distribution:');
    Object.keys(finalByCategory).forEach(category => {
      console.log(`  ${category}: ${finalByCategory[category]} images`);
    });

    console.log('\n✨ Your website should now load much faster!');

  } catch (error) {
    console.error('💥 Optimization failed:', error);
  }
}

// รันการเพิ่มประสิทธิภาพ
if (require.main === module) {
  optimizeDatabase();
}

module.exports = { optimizeDatabase };