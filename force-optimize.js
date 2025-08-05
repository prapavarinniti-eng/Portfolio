const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';

const supabase = createClient(supabaseUrl, supabaseKey);

// จำกัดภาพต่อหมวดหมู่
const KEEP_IMAGES = {
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

async function forceOptimize() {
  try {
    console.log('🚀 Force optimizing database...');
    
    // ดึงข้อมูลทั้งหมดแบบละเอียด
    const { data: allImages, error: fetchError } = await supabase
      .from('portfolio_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error:', fetchError);
      return;
    }

    console.log(`📊 Total images: ${allImages.length}`);

    // แยกตามหมวดหมู่
    const categories = {};
    allImages.forEach(img => {
      if (!categories[img.category]) {
        categories[img.category] = [];
      }
      categories[img.category].push(img);
    });

    console.log('\n📈 Current distribution:');
    Object.keys(categories).forEach(cat => {
      console.log(`  ${cat}: ${categories[cat].length} images`);
    });

    // หาภาพที่ต้องลบ
    let toDelete = [];
    let totalKept = 0;

    console.log('\n🔄 Processing categories...');
    Object.keys(categories).forEach(category => {
      const images = categories[category];
      const keepCount = KEEP_IMAGES[category] || 10;
      
      if (images.length > keepCount) {
        const excess = images.slice(keepCount); // ลบภาพเก่า เก็บภาพใหม่
        toDelete = toDelete.concat(excess);
        totalKept += keepCount;
        console.log(`  ${category}: Keep ${keepCount}, Delete ${excess.length}`);
      } else {
        totalKept += images.length;
        console.log(`  ${category}: Keep all ${images.length} images`);
      }
    });

    console.log(`\n🗑️  Will delete ${toDelete.length} images`);
    console.log(`📊  Final count will be: ${totalKept} images`);

    if (toDelete.length === 0) {
      console.log('✅ Already optimized!');
      return;
    }

    // ลบภาพที่เกิน
    console.log('\n🔥 Deleting excess images...');
    let deleted = 0;
    
    for (const image of toDelete) {
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', image.id);

      if (error) {
        console.log(`❌ Failed to delete ${image.title}: ${error.message}`);
      } else {
        deleted++;
        if (deleted % 50 === 0) {
          console.log(`✅ Deleted ${deleted}/${toDelete.length} images...`);
        }
      }
    }

    console.log(`\n🎉 Deleted ${deleted} images successfully!`);

    // ตรวจสอบผลลัพธ์
    const { count } = await supabase
      .from('portfolio_images')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Final image count: ${count}`);
    console.log('✨ Website optimization completed!');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

forceOptimize();