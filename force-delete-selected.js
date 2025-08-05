const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function forceDeleteImages() {
  try {
    console.log('🗑️ ระบบลบภาพแบบบังคับ\n');
    
    // Get all images
    const { data: images, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    if (images.length === 0) {
      console.log('✅ ไม่มีรูปในฐานข้อมูล');
      rl.close();
      return;
    }
    
    console.log(`📊 พบรูปทั้งหมด: ${images.length} รูป\n`);
    
    // Group by category
    const categories = {};
    images.forEach(img => {
      if (!categories[img.category]) {
        categories[img.category] = [];
      }
      categories[img.category].push(img);
    });
    
    console.log('📂 จำนวนรูปตามหมวดหมู่:');
    Object.keys(categories).forEach(cat => {
      console.log(`   ${cat}: ${categories[cat].length} รูป`);
    });
    
    console.log('\n🎯 เลือกวิธีลบ:');
    console.log('1. ลบตามหมวดหมู่');
    console.log('2. ลบตามจำนวน (เก็บไว้เท่าไหร่)');
    console.log('3. ลบทั้งหมด');
    console.log('4. ออก');
    
    const choice = await ask('\nเลือก (1-4): ');
    
    switch(choice) {
      case '1':
        await deleteByCategory(categories);
        break;
      case '2':
        await deleteByLimit(images, categories);
        break;
      case '3':
        await deleteAll(images);
        break;
      default:
        console.log('👋 ยกเลิก');
        rl.close();
        return;
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function deleteByCategory(categories) {
  console.log('\n📂 เลือกหมวดหมู่ที่จะลบ:');
  
  const catList = Object.keys(categories);
  catList.forEach((cat, i) => {
    console.log(`${i + 1}. ${cat} (${categories[cat].length} รูป)`);
  });
  
  const choice = await ask('\nเลือกหมวดหมู่ (หมายเลข): ');
  const selectedCat = catList[parseInt(choice) - 1];
  
  if (!selectedCat) {
    console.log('❌ เลือกไม่ถูกต้อง');
    rl.close();
    return;
  }
  
  const imagesToDelete = categories[selectedCat];
  console.log(`\n⚠️ จะลบ ${imagesToDelete.length} รูปในหมวด "${selectedCat}"`);
  
  const confirm = await ask('ยืนยัน? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ ยกเลิก');
    rl.close();
    return;
  }
  
  await performDelete(imagesToDelete);
}

async function deleteByLimit(images, categories) {
  console.log('\n📊 ตั้งจำนวนรูปที่เก็บไว้แต่ละหมวด:');
  console.log('(รูปเก่าจะถูกลบ เก็บรูปใหม่)');
  
  const limits = {
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
  
  console.log('\nจำนวนที่แนะนำ:');
  Object.entries(limits).forEach(([cat, limit]) => {
    const current = categories[cat]?.length || 0;
    console.log(`   ${cat}: เก็บ ${limit} รูป (ปัจจุบัน ${current})`);
  });
  
  const confirm = await ask('\nใช้จำนวนแนะนำ? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ ยกเลิก');
    rl.close();
    return;
  }
  
  // คำนวณรูปที่จะลบ
  let toDelete = [];
  Object.keys(categories).forEach(cat => {
    const limit = limits[cat] || 10;
    const images = categories[cat];
    
    if (images.length > limit) {
      const excess = images.slice(limit); // ลบรูปเก่า
      toDelete = toDelete.concat(excess);
      console.log(`📂 ${cat}: ลบ ${excess.length} รูป (เหลือ ${limit})`);
    }
  });
  
  if (toDelete.length === 0) {
    console.log('✅ ไม่มีรูปที่ต้องลบ');
    rl.close();
    return;
  }
  
  console.log(`\n🗑️ รวมจะลบ: ${toDelete.length} รูป`);
  const finalConfirm = await ask('ยืนยันการลบ? (yes/no): ');
  
  if (finalConfirm.toLowerCase() !== 'yes') {
    console.log('❌ ยกเลิก');
    rl.close();
    return;
  }
  
  await performDelete(toDelete);
}

async function deleteAll(images) {
  console.log(`\n⚠️ จะลบรูปทั้งหมด ${images.length} รูป`);
  console.log('การกระทำนี้ไม่สามารถกู้คืนได้!');
  
  const confirm1 = await ask('ยืนยันครั้งที่ 1? (yes/no): ');
  if (confirm1.toLowerCase() !== 'yes') {
    console.log('❌ ยกเลิก');
    rl.close();
    return;
  }
  
  const confirm2 = await ask('ยืนยันครั้งที่ 2? พิมพ์ "DELETE ALL": ');
  if (confirm2 !== 'DELETE ALL') {
    console.log('❌ ยกเลิก');
    rl.close();
    return;
  }
  
  await performDelete(images);
}

async function performDelete(imagesToDelete) {
  console.log(`\n🔄 เริ่มลบ ${imagesToDelete.length} รูป...`);
  
  let deleted = 0;
  let failed = 0;
  
  // ลบทีละรูป
  for (let i = 0; i < imagesToDelete.length; i++) {
    const img = imagesToDelete[i];
    
    try {
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', img.id);
      
      if (error) {
        console.log(`❌ ลบไม่สำเร็จ: ${img.title} - ${error.message}`);
        failed++;
      } else {
        deleted++;
        if (deleted % 10 === 0) {
          console.log(`✅ ลบแล้ว ${deleted}/${imagesToDelete.length}...`);
        }
      }
      
    } catch (error) {
      console.log(`💥 Error: ${img.title} - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n🎉 เสร็จสิ้น!`);
  console.log(`✅ ลบสำเร็จ: ${deleted} รูป`);
  console.log(`❌ ลบไม่สำเร็จ: ${failed} รูป`);
  
  // ตรวจสอบผลลัพธ์
  const { count } = await supabase
    .from('portfolio_images')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 รูปที่เหลือ: ${count} รูป`);
  
  rl.close();
}

// รันโปรแกรม
forceDeleteImages().catch(console.error);