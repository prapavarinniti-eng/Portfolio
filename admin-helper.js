#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Supabase configuration
const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';
const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Category mapping
const categories = {
  '1': { folder: '01-weddings', category: 'wedding', name: 'งานแต่งงาน' },
  '2': { folder: '02-corporate-meetings', category: 'corporate', name: 'ประชุมองค์กร' },
  '3': { folder: '03-fine-dining', category: 'fine-dining', name: 'ไฟน์ไดนิ่ง' },
  '4': { folder: '04-buffet-service', category: 'buffet', name: 'บุฟเฟ่ต์' },
  '5': { folder: '05-cocktail-reception', category: 'cocktail', name: 'ค็อกเทล' },
  '6': { folder: '06-coffee-break', category: 'coffee-break', name: 'คอฟฟี่เบรค' },
  '7': { folder: '07-snack-food-box', category: 'snack-box', name: 'สแน็คบ็อกซ์' },
  '8': { folder: '08-government-events', category: 'corporate', name: 'งานภาครัฐ' },
  '9': { folder: '09-private-parties', category: 'wedding', name: 'งานส่วนตัว' }
};

// Content templates for each category
const contentTemplates = {
  wedding: [
    'งานแต่งงานริมทะเลสุดหรู',
    'งานแต่งงานสไตล์ไทยประยุกต์',
    'เลี้ยงแต่งงานในสวนสุดหรู',
    'งานแต่งงานแบบดั้งเดิม',
    'งานแต่งงานสไตล์โมเดิร์น'
  ],
  corporate: [
    'Coffee Break ประชุมผู้บริหาร',
    'งานเลี้ยงสังสรรค์บริษัท',
    'สัมมนาองค์กรระดับผู้บริหาร',
    'งานประชุมใหญ่ประจำปี',
    'งานเลี้ยงรับน้องใหม่'
  ],
  'fine-dining': [
    'Set Course Menu 7 คอร์ส',
    'อาหารฝรั่งเศสระดับเชฟ',
    'Tasting Menu พิเศษ',
    'Private Chef Experience',
    'Molecular Gastronomy'
  ],
  buffet: [
    'บุฟเฟ่ต์อาหารไทย 40 เมนู',
    'International Buffet Line',
    'Premium Seafood Buffet',
    'BBQ Buffet Garden Party',
    'Healthy Salad Bar'
  ],
  cocktail: [
    'Welcome Drink & Canapé Premium',
    'งานค็อกเทลพาร์ตี้ Evening',
    'Corporate Cocktail Reception',
    'Wine & Cheese Tasting',
    'Signature Cocktail Bar'
  ],
  'coffee-break': [
    'Executive Coffee Break',
    'High Tea Afternoon Set',
    'Morning Coffee & Pastries',
    'Meeting Refreshment',
    'Premium Tea Service'
  ],
  'snack-box': [
    'Premium Lunch Box Set',
    'Healthy Snack Box Collection',
    'Meeting Break Box',
    'Conference Snack Pack',
    'Gourmet Food Box'
  ]
};

// Main menu
async function showMainMenu() {
  console.clear();
  console.log('🎉 =======================================');
  console.log('   FUZIO CATERING - แอดมินง่ายๆ');
  console.log('🎉 =======================================\n');
  
  console.log('📋 เลือกสิ่งที่ต้องการทำ:');
  console.log('1. ➕ เพิ่มภาพใหม่');
  console.log('2. ✏️  แก้ไขข้อความภาพ');
  console.log('3. 🗑️  ลบภาพ');
  console.log('4. 👀 ดูภาพทั้งหมด');
  console.log('5. 📂 ดูภาพตามหมวดหมู่');
  console.log('6. 🗑️  เลือกลบภาพในหมวดหมู่');
  console.log('7. 📤 ย้ายภาพระหว่างหมวดหมู่');
  console.log('8. 📥 อัปโหลดไฟล์จากภายนอก');
  console.log('9. 🧹 ทำความสะอาดฐานข้อมูล');
  console.log('10. 🚪 ออกจากโปรแกรม\n');
  
  const choice = await ask('👉 เลือกหมายเลข (1-10): ');
  
  switch(choice) {
    case '1': await addNewImage(); break;
    case '2': await editImage(); break;
    case '3': await deleteImage(); break;
    case '4': await viewAllImages(); break;
    case '5': await viewByCategory(); break;
    case '6': await selectiveDeleteByCategory(); break;
    case '7': await moveImageBetweenCategories(); break;
    case '8': await uploadExternalFile(); break;
    case '9': await cleanDatabase(); break;
    case '10': 
      console.log('👋 ลาก่อน!');
      rl.close();
      return;
    default:
      console.log('❌ เลือกตัวเลข 1-10 เท่านั้น');
      await ask('กดเอนเทอร์เพื่อลองใหม่...');
      await showMainMenu();
  }
}

// Add new image
async function addNewImage() {
  console.clear();
  console.log('➕ =======================================');
  console.log('         เพิ่มภาพใหม่');
  console.log('➕ =======================================\n');
  
  // Show categories
  console.log('📂 เลือกหมวดหมู่:');
  Object.keys(categories).forEach(key => {
    console.log(`${key}. ${categories[key].name}`);
  });
  console.log();
  
  const categoryChoice = await ask('👉 เลือกหมวดหมู่ (1-9): ');
  
  if (!categories[categoryChoice]) {
    console.log('❌ เลือกหมายเลข 1-9 เท่านั้น');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await addNewImage();
  }
  
  const selectedCategory = categories[categoryChoice];
  
  // Show existing files in folder
  const folderPath = path.join(__dirname, 'public', 'image', selectedCategory.folder);
  const existingFiles = fs.existsSync(folderPath) 
    ? fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg'))
    : [];
  
  console.log(`\n📁 ไฟล์ที่มีอยู่ใน ${selectedCategory.name}:`);
  if (existingFiles.length === 0) {
    console.log('   (ยังไม่มีไฟล์)');
  } else {
    existingFiles.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file}`);
    });
  }
  
  console.log('\n📝 เลือกภาพที่ต้องการเพิ่ม:');
  console.log('💡 วิธีเลือก:');
  console.log('   - เลือกภาพเดียว: พิมพ์หมายเลข เช่น 5');
  console.log('   - เลือกหลายภาพ: พิมพ์หมายเลขคั่นด้วยจุลภาค เช่น 1,3,5');
  console.log('   - เลือกช่วง: พิมพ์หมายเลขคั่นด้วยขีด เช่น 1-5');
  console.log('   - เลือกทั้งหมด: พิมพ์ all');
  
  const selection = await ask('👉 เลือกภาพ: ');
  
  if (!selection.trim()) {
    console.log('❌ กรุณาเลือกภาพ');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await addNewImage();
  }
  
  // Parse selection
  let selectedIndices = [];
  
  try {
    if (selection.toLowerCase() === 'all') {
      // Select all images
      selectedIndices = existingFiles.map((_, i) => i);
    } else if (selection.includes(',')) {
      // Multiple selection: 1,3,5
      selectedIndices = selection.split(',').map(s => parseInt(s.trim()) - 1);
    } else if (selection.includes('-')) {
      // Range selection: 1-5
      const [start, end] = selection.split('-').map(s => parseInt(s.trim()));
      for (let i = start - 1; i < end; i++) {
        selectedIndices.push(i);
      }
    } else {
      // Single selection: 5
      selectedIndices = [parseInt(selection) - 1];
    }
    
    // Validate indices
    selectedIndices = selectedIndices.filter(i => i >= 0 && i < existingFiles.length);
    
    if (selectedIndices.length === 0) {
      console.log('❌ ไม่มีหมายเลขที่ถูกต้อง');
      await ask('กดเอนเทอร์เพื่อลองใหม่...');
      return await addNewImage();
    }
    
  } catch (error) {
    console.log('❌ รูปแบบการเลือกไม่ถูกต้อง');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await addNewImage();
  }
  
  // Get selected files
  const selectedFiles = selectedIndices.map(i => existingFiles[i]);
  
  console.log(`\n📸 คุณเลือก ${selectedFiles.length} ภาพ:`);
  selectedFiles.forEach((file, i) => {
    console.log(`${i + 1}. ${file}`);
  });
  
  const confirm = await ask('\n👉 ยืนยันการเพิ่มภาพเหล่านี้? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('❌ ยกเลิกการเพิ่มภาพ');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await addNewImage();
  }
  
  // Process each selected file
  const templates = contentTemplates[selectedCategory.category] || ['ภาพสวยๆ'];
  let successCount = 0;
  let failCount = 0;
  
  console.log(`\n🔄 กำลังเพิ่ม ${selectedFiles.length} ภาพ...`);
  
  for (let i = 0; i < selectedFiles.length; i++) {
    const fileName = selectedFiles[i];
    const imageNumber = i + 1;
    
    // Check if file exists
    const fullPath = path.join(folderPath, fileName);
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ ไม่พบไฟล์: ${fileName}`);
      failCount++;
      continue;
    }
    
    // Generate unique title for each image
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const title = `${randomTemplate} - ภาพที่ ${imageNumber}`;
    const description = `${title} จัดโดยทีมงานมืออาชีพของ Fuzio Catering พร้อมบริการครบครันในสถานที่ของคุณ`;
    
    // Add to database
    try {
      const imageUrl = `/image/${selectedCategory.folder}/${fileName}`;
      
      const { data, error } = await supabase
        .from('portfolio_images')
        .insert({
          title: title,
          description: description,
          category: selectedCategory.category,
          image_url: imageUrl,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.log(`❌ ไม่สามารถเพิ่ม ${fileName}: ${error.message}`);
        failCount++;
      } else {
        console.log(`✅ เพิ่มแล้ว: ${fileName} -> ${title}`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ ข้อผิดพลาด ${fileName}: ${error.message}`);
      failCount++;
    }
    
    // Small delay to avoid overwhelming the database
    if (selectedFiles.length > 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Summary
  console.log(`\n🎉 สรุปผลการเพิ่มภาพ:`);
  console.log(`✅ เพิ่มสำเร็จ: ${successCount} ภาพ`);
  if (failCount > 0) {
    console.log(`❌ เพิ่มไม่สำเร็จ: ${failCount} ภาพ`);
  }
  console.log(`📁 หมวดหมู่: ${selectedCategory.name}`);
  
  await ask('\nกดเอนเทอร์เพื่อกลับเมนูหลัก...');
  await showMainMenu();
}

// Edit image
async function editImage() {
  console.clear();
  console.log('✏️ =======================================');
  console.log('         แก้ไขข้อความภาพ');
  console.log('✏️ =======================================\n');
  
  console.log('📂 เลือกวิธีการแก้ไข:');
  console.log('1. ดูภาพทั้งหมด');
  console.log('2. เลือกตามหมวดหมู่');
  console.log('3. 🔙 กลับเมนูหลัก\n');
  
  const editMode = await ask('👉 เลือกวิธีการ (1-3): ');
  
  switch(editMode) {
    case '1':
      await editAllImages();
      break;
    case '2':
      await editByCategory();
      break;
    case '3':
      return await showMainMenu();
    default:
      console.log('❌ เลือกตัวเลข 1-3 เท่านั้น');
      await ask('กดเอนเทอร์เพื่อลองใหม่...');
      return await editImage();
  }
}

// Edit all images (original functionality)
async function editAllImages() {
  console.clear();
  console.log('✏️ =======================================');
  console.log('       แก้ไขข้อความภาพ (ทั้งหมด)');
  console.log('✏️ =======================================\n');
  
  // Get all images
  const { data: images, error } = await supabase
    .from('portfolio_images')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.log('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:', error.message);
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  if (images.length === 0) {
    console.log('❌ ไม่มีภาพในระบบ');
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  console.log('📋 รายการภาพทั้งหมด:');
  images.forEach((img, i) => {
    const categoryInfo = Object.values(categories).find(c => c.category === img.category);
    const categoryName = categoryInfo ? categoryInfo.name : img.category;
    console.log(`${i + 1}. [${categoryName}] ${img.title}`);
  });
  
  const choice = await ask(`\n👉 เลือกภาพที่ต้องการแก้ไข (1-${images.length}) หรือ 0 เพื่อกลับ: `);
  
  if (choice === '0') {
    return await editImage();
  }
  
  const index = parseInt(choice) - 1;
  
  if (index < 0 || index >= images.length) {
    console.log('❌ เลือกหมายเลขที่ถูกต้อง');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await editAllImages();
  }
  
  await performImageEdit(images[index]);
  await ask('\nกดเอนเทอร์เพื่อกลับเมนูหลัก...');
  await showMainMenu();
}

// Edit by category
async function editByCategory() {
  console.clear();
  console.log('✏️ =======================================');
  console.log('     แก้ไขข้อความภาพ (ตามหมวดหมู่)');
  console.log('✏️ =======================================\n');
  
  // Show categories
  console.log('📂 เลือกหมวดหมู่:');
  Object.keys(categories).forEach(key => {
    console.log(`${key}. ${categories[key].name}`);
  });
  console.log('10. 🔙 กลับเมนูแก้ไข\n');
  
  const categoryChoice = await ask('👉 เลือกหมวดหมู่ (1-10): ');
  
  if (categoryChoice === '10') {
    return await editImage();
  }
  
  if (!categories[categoryChoice]) {
    console.log('❌ เลือกหมายเลข 1-10 เท่านั้น');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await editByCategory();
  }
  
  const selectedCategory = categories[categoryChoice];
  
  // Get images for this category
  const { data: images, error } = await supabase
    .from('portfolio_images')
    .select('*')
    .eq('category', selectedCategory.category)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.log('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:', error.message);
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await editByCategory();
  }
  
  if (images.length === 0) {
    console.log(`❌ ไม่มีภาพในหมวด ${selectedCategory.name}`);
    await ask('กดเอนเทอร์เพื่อกลับเลือกหมวดใหม่...');
    return await editByCategory();
  }
  
  console.log(`\n📂 หมวด: ${selectedCategory.name} (${images.length} ภาพ)`);
  console.log('='.repeat(50));
  
  images.forEach((img, i) => {
    console.log(`${i + 1}. 🖼️  ${img.title}`);
    console.log(`   📝 ${img.description.substring(0, 60)}...`);
    console.log();
  });
  
  const choice = await ask(`\n👉 เลือกภาพที่ต้องการแก้ไข (1-${images.length}) หรือ 0 เพื่อกลับ: `);
  
  if (choice === '0') {
    return await editByCategory();
  }
  
  const index = parseInt(choice) - 1;
  
  if (index < 0 || index >= images.length) {
    console.log('❌ เลือกหมายเลขที่ถูกต้อง');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await editByCategory();
  }
  
  await performImageEdit(images[index]);
  
  console.log('\n📋 ต้องการทำอะไรต่อ?');
  console.log('1. แก้ไขภาพอื่นในหมวดเดียวกัน');
  console.log('2. เลือกหมวดหมู่อื่น');
  console.log('3. กลับเมนูหลัก');
  
  const nextChoice = await ask('\n👉 เลือก (1-3): ');
  
  switch(nextChoice) {
    case '1':
      return await editByCategory();
    case '2':      
      return await editByCategory();
    case '3':
    default:
      return await showMainMenu();
  }
}

// Perform image edit (shared function)
async function performImageEdit(selectedImage) {
  const categoryInfo = Object.values(categories).find(c => c.category === selectedImage.category);
  const categoryName = categoryInfo ? categoryInfo.name : selectedImage.category;
  
  console.log(`\n📝 ข้อมูลปัจจุบัน:`);
  console.log(`🖼️  ชื่อ: ${selectedImage.title}`);
  console.log(`📝 คำอธิบาย: ${selectedImage.description}`);
  console.log(`📂 หมวดหมู่: ${categoryName}`);
  
  console.log('\n✏️ กรอกข้อมูลใหม่ (เว้นว่างเพื่อใช้ข้อมูลเดิม):');
  const newTitle = await ask('👉 ชื่อใหม่: ') || selectedImage.title;
  const newDescription = await ask('👉 คำอธิบายใหม่: ') || selectedImage.description;
  
  // Check if anything changed
  if (newTitle === selectedImage.title && newDescription === selectedImage.description) {
    console.log('\n💡 ไม่มีการเปลี่ยนแปลงข้อมูล');
    return;
  }
  
  console.log('\n📝 ตรวจสอบข้อมูลใหม่:');
  console.log(`🖼️  ชื่อใหม่: ${newTitle}`);
  console.log(`📝 คำอธิบายใหม่: ${newDescription}`);
  
  const confirm = await ask('\n👉 ยืนยันการแก้ไข? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('❌ ยกเลิกการแก้ไข');
    return;
  }
  
  // Update database
  try {
    const { error } = await supabase
      .from('portfolio_images')
      .update({
        title: newTitle,
        description: newDescription
      })
      .eq('id', selectedImage.id);
    
    if (error) {
      console.log('❌ เกิดข้อผิดพลาด:', error.message);
    } else {
      console.log('\n✅ แก้ไขสำเร็จ!');
      console.log(`🖼️  ชื่อใหม่: ${newTitle}`);
      console.log(`📝 คำอธิบายใหม่: ${newDescription}`);
    }
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

// Delete image
async function deleteImage() {
  console.clear();
  console.log('🗑️ =======================================');
  console.log('            ลบภาพ');
  console.log('🗑️ =======================================\n');
  
  // Get all images
  const { data: images, error } = await supabase
    .from('portfolio_images')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.log('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:', error.message);
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  if (images.length === 0) {
    console.log('❌ ไม่มีภาพในระบบ');
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  console.log('📋 รายการภาพทั้งหมด:');
  images.forEach((img, i) => {
    console.log(`${i + 1}. [${img.category}] ${img.title}`);
  });
  
  const choice = await ask(`\n👉 เลือกภาพที่ต้องการลบ (1-${images.length}): `);
  const index = parseInt(choice) - 1;
  
  if (index < 0 || index >= images.length) {
    console.log('❌ เลือกหมายเลขที่ถูกต้อง');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await deleteImage();
  }
  
  const selectedImage = images[index];
  
  console.log(`\n⚠️  คุณต้องการลบภาพนี้จริงหรือ?`);
  console.log(`🖼️  ${selectedImage.title}`);
  console.log(`📝 ${selectedImage.description}`);
  
  const confirm = await ask('👉 พิมพ์ "ใช่" เพื่อยืนยัน: ');
  
  if (confirm.toLowerCase() !== 'ใช่') {
    console.log('❌ ยกเลิกการลบ');
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  // Delete from database
  try {
    const { error } = await supabase
      .from('portfolio_images')
      .delete()
      .eq('id', selectedImage.id);
    
    if (error) {
      console.log('❌ เกิดข้อผิดพลาด:', error.message);
    } else {
      console.log('\n✅ ลบภาพสำเร็จ!');
      console.log('💡 หมายเหตุ: ไฟล์ภาพจริงยังอยู่ในโฟลเดอร์');
    }
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
  }
  
  await ask('\nกดเอนเทอร์เพื่อกลับเมนูหลัก...');
  await showMainMenu();
}

// View all images
async function viewAllImages() {
  console.clear();
  console.log('👀 =======================================');
  console.log('         ดูภาพทั้งหมด');
  console.log('👀 =======================================\n');
  
  // Get all images grouped by category
  const { data: images, error } = await supabase
    .from('portfolio_images')
    .select('*')
    .order('category', { ascending: true })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.log('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:', error.message);
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  if (images.length === 0) {
    console.log('❌ ไม่มีภาพในระบบ');
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  // Group by category
  const grouped = {};
  images.forEach(img => {
    if (!grouped[img.category]) {
      grouped[img.category] = [];
    }
    grouped[img.category].push(img);
  });
  
  console.log(`📊 สรุป: มีภาพทั้งหมด ${images.length} ภาพ\n`);
  
  Object.keys(grouped).forEach(category => {
    const categoryInfo = Object.values(categories).find(c => c.category === category);
    const categoryName = categoryInfo ? categoryInfo.name : category;
    
    console.log(`📂 ${categoryName} (${grouped[category].length} ภาพ):`);
    grouped[category].forEach((img, i) => {
      console.log(`   ${i + 1}. ${img.title}`);
    });
    console.log();
  });
  
  await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
  await showMainMenu();
}

// Clean database
async function cleanDatabase() {
  console.clear();
  console.log('🧹 =======================================');
  console.log('       ทำความสะอาดฐานข้อมูล');
  console.log('🧹 =======================================\n');
  
  console.log('⚠️  การทำความสะอาดจะลบข้อมูลทั้งหมดในฐานข้อมูล');
  console.log('💡 ไฟล์ภาพจริงจะไม่ถูกลบ');
  console.log('💡 หลังจากทำความสะอาดต้องอัปโหลดใหม่ด้วย bulk-image-upload.js\n');
  
  const confirm = await ask('👉 พิมพ์ "ลบทั้งหมด" เพื่อยืนยัน: ');
  
  if (confirm !== 'ลบทั้งหมด') {
    console.log('❌ ยกเลิกการทำความสะอาด');
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  try {
    // Get count first
    const { count } = await supabase
      .from('portfolio_images')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n🔄 กำลังลบ ${count} รายการ...`);
    
    // Delete all
    const { error } = await supabase
      .from('portfolio_images')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (error) {
      console.log('❌ เกิดข้อผิดพลาด:', error.message);
    } else {
      console.log(`✅ ลบข้อมูลทั้งหมดสำเร็จ! (${count} รายการ)`);
      console.log('\n💡 ขั้นตอนถัดไป:');
      console.log('   1. ออกจากโปรแกรมนี้');
      console.log('   2. รันคำสั่ง: node bulk-image-upload.js');
      console.log('   3. รันเว็บไซต์: npm run dev');
    }
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
  }
  
  await ask('\nกดเอนเทอร์เพื่อกลับเมนูหลัก...');
  await showMainMenu();
}

// View images by category
async function viewByCategory() {
  console.clear();
  console.log('📂 =======================================');
  console.log('       ดูภาพตามหมวดหมู่');
  console.log('📂 =======================================\n');
  
  // Show categories
  console.log('📋 เลือกหมวดหมู่ที่ต้องการดู:');
  Object.keys(categories).forEach(key => {
    console.log(`${key}. ${categories[key].name}`);
  });
  console.log('10. 🔙 กลับเมนูหลัก\n');
  
  const categoryChoice = await ask('👉 เลือกหมวดหมู่ (1-10): ');
  
  if (categoryChoice === '10') {
    return await showMainMenu();
  }
  
  if (!categories[categoryChoice]) {
    console.log('❌ เลือกหมายเลข 1-10 เท่านั้น');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await viewByCategory();
  }
  
  const selectedCategory = categories[categoryChoice];
  
  // Get images for this category
  const { data: images, error } = await supabase
    .from('portfolio_images')
    .select('*')
    .eq('category', selectedCategory.category)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.log('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล:', error.message);
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await viewByCategory();
  }
  
  console.log(`\n📂 หมวดหมู่: ${selectedCategory.name}`);
  console.log('=' * 50);
  
  if (images.length === 0) {
    console.log('❌ ไม่มีภาพในหมวดหมู่นี้');
  } else {
    console.log(`📊 จำนวนภาพทั้งหมด: ${images.length} ภาพ\n`);
    
    images.forEach((img, i) => {
      console.log(`${i + 1}. 🖼️  ${img.title}`);
      console.log(`   📝 ${img.description}`);
      console.log(`   🔗 ${img.image_url}`);
      console.log(`   📅 ${new Date(img.created_at).toLocaleString('th-TH')}`);
      console.log();
    });
  }
  
  console.log('\n📋 คุณต้องการทำอะไรกับหมวดนี้?');
  console.log('1. ✏️  แก้ไขชื่อ/คำอธิบายภาพ');
  console.log('2. 🗑️  ลบภาพออกจากเว็บไซต์');
  console.log('3. ➕ เพิ่มภาพใหม่เข้าหมวดนี้');
  console.log('4. 📂 ดูหมวดอื่นแทน');
  console.log('5. 🔙 กลับหน้าหลัก');
  
  const action = await ask('\n👉 เลือกการกระทำ (1-5): ');
  
  switch(action) {
    case '1':
      if (images.length === 0) {
        console.log('❌ ไม่มีภาพให้แก้ไข');
        await ask('กดเอนเทอร์เพื่อดำเนินการต่อ...');
        return await viewByCategory();
      }
      await editImageInCategory(images);
      break;
    case '2':
      if (images.length === 0) {
        console.log('❌ ไม่มีภาพให้ลบ');
        await ask('กดเอนเทอร์เพื่อดำเนินการต่อ...');
        return await viewByCategory();
      }
      await deleteImageInCategory(images);
      break;
    case '3':
      await addImageToCategory(selectedCategory);
      break;
    case '4':
      return await viewByCategory();
    case '5':
      return await showMainMenu();
    default:
      console.log('❌ เลือกตัวเลข 1-5 เท่านั้น');
      await ask('กดเอนเทอร์เพื่อลองใหม่...');
      return await viewByCategory();
  }
}

// Edit image in specific category
async function editImageInCategory(images) {
  console.clear();
  console.log('✏️ =======================================');
  console.log('      แก้ไขชื่อและคำอธิบายภาพ');
  console.log('✏️ =======================================\n');
  
  console.log('📋 เลือกภาพที่ต้องการแก้ไขชื่อหรือคำอธิบาย:\n');
  
  images.forEach((img, i) => {
    console.log(`${i + 1}. 🖼️ ${img.title}`);
    console.log(`   📝 ${img.description.substring(0, 50)}...`);
    console.log();
  });
  
  const choice = await ask(`👉 เลือกภาพที่จะแก้ไข (1-${images.length}) หรือ 0 เพื่อกลับ: `);
  
  if (choice === '0') {
    return await viewByCategory();
  }
  
  const index = parseInt(choice) - 1;
  
  if (index < 0 || index >= images.length) {
    console.log('❌ กรุณาเลือกหมายเลข 1-' + images.length + ' เท่านั้น');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await editImageInCategory(images);
  }
  
  const selectedImage = images[index];
  
  console.log('\n' + '='.repeat(50));
  console.log('📝 ข้อมูลปัจจุบันของภาพ');
  console.log('='.repeat(50));
  console.log(`🖼️  ชื่อ: ${selectedImage.title}`);
  console.log(`📝 คำอธิบาย: ${selectedImage.description}`);
  console.log(`🔗 URL: ${selectedImage.image_url}`);
  
  console.log('\n✏️ พิมพ์ข้อมูลใหม่ (หากไม่ต้องการเปลี่ยนให้กดเอนเทอร์เว้นไว้):');
  
  const newTitle = await ask('👉 ชื่อใหม่: ') || selectedImage.title;
  const newDescription = await ask('👉 คำอธิบายใหม่: ') || selectedImage.description;
  
  // Check if anything changed
  if (newTitle === selectedImage.title && newDescription === selectedImage.description) {
    console.log('\n💡 ไม่มีการเปลี่ยนแปลงข้อมูล');
    await ask('กดเอนเทอร์เพื่อกลับดูหมวดหมู่...');
    return await viewByCategory();
  }
  
  console.log('\n📝 ตรวจสอบข้อมูลใหม่:');
  console.log(`🖼️  ชื่อใหม่: ${newTitle}`);
  console.log(`📝 คำอธิบายใหม่: ${newDescription}`);
  
  const confirm = await ask('\n👉 ยืนยันการแก้ไข? พิมพ์ "แก้ไข" หรือกดเอนเทอร์เพื่อยกเลิก: ');
  
  if (confirm !== 'แก้ไข') {
    console.log('✅ ยกเลิกการแก้ไขแล้ว');
    await ask('กดเอนเทอร์เพื่อกลับดูหมวดหมู่...');
    return await viewByCategory();
  }
  
  try {
    const { error } = await supabase
      .from('portfolio_images')
      .update({
        title: newTitle,
        description: newDescription
      })
      .eq('id', selectedImage.id);
    
    if (error) {
      console.log('\n❌ เกิดข้อผิดพลาด:', error.message);
    } else {
      console.log('\n🎉 แก้ไขสำเร็จแล้ว!');
      console.log(`✅ ชื่อใหม่: ${newTitle}`);
      console.log(`✅ คำอธิบายใหม่: ${newDescription}`);
      console.log('💡 เปลี่ยนแปลงจะแสดงในเว็บไซต์ทันที');
    }
  } catch (error) {
    console.log('\n❌ เกิดข้อผิดพลาด:', error.message);
  }
  
  await ask('\nกดเอนเทอร์เพื่อกลับดูหมวดหมู่...');
  await viewByCategory();
}

// Delete image in specific category
async function deleteImageInCategory(images) {
  console.clear();
  console.log('🗑️ =======================================');
  console.log('         ลบภาพออกจากเว็บไซต์');
  console.log('🗑️ =======================================\n');
  
  console.log('📋 เลือกภาพที่ต้องการลบออกจากเว็บไซต์:');
  console.log('(ไฟล์ภาพจริงจะไม่ถูกลบ เฉพาะข้อมูลในเว็บไซต์เท่านั้น)\n');
  
  images.forEach((img, i) => {
    console.log(`${i + 1}. 🖼️ ${img.title}`);
    console.log(`   📝 ${img.description.substring(0, 50)}...`);
    console.log();
  });
  
  const choice = await ask(`👉 เลือกภาพที่จะลบ (1-${images.length}) หรือ 0 เพื่อกลับ: `);
  
  if (choice === '0') {
    return await viewByCategory();
  }
  
  const index = parseInt(choice) - 1;
  
  if (index < 0 || index >= images.length) {
    console.log('❌ กรุณาเลือกหมายเลข 1-' + images.length + ' เท่านั้น');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await deleteImageInCategory(images);
  }
  
  const selectedImage = images[index];
  
  console.log('\n' + '='.repeat(50));
  console.log('⚠️  ยืนยันการลบภาพ');
  console.log('='.repeat(50));
  console.log(`🖼️  ชื่อภาพ: ${selectedImage.title}`);
  console.log(`📝 คำอธิบาย: ${selectedImage.description}`);
  console.log(`🔗 URL: ${selectedImage.image_url}`);
  console.log('\n💡 การลบจะทำให้:');
  console.log('   ✅ ภาพหายจากเว็บไซต์');
  console.log('   ✅ ข้อมูลถูกลบจากฐานข้อมูล');
  console.log('   ❌ ไฟล์ภาพจริงยังอยู่ในโฟลเดอร์');
  
  console.log('\n🤔 คุณแน่ใจที่จะลบภาพนี้หรือไม่?');
  const confirm = await ask('👉 พิมพ์ "ลบเลย" เพื่อยืนยัน หรือกดเอนเทอร์เพื่อยกเลิก: ');
  
  if (confirm !== 'ลบเลย') {
    console.log('✅ ยกเลิกการลบแล้ว ภาพปลอดภัย!');
    await ask('กดเอนเทอร์เพื่อกลับดูรายการภาพ...');
    return await viewByCategory();
  }
  
  try {
    const { error } = await supabase
      .from('portfolio_images')
      .delete()
      .eq('id', selectedImage.id);
    
    if (error) {
      console.log('\n❌ เกิดข้อผิดพลาด:', error.message);
    } else {
      console.log('\n🎉 ลบภาพสำเร็จแล้ว!');
      console.log('✅ ภาพหายจากเว็บไซต์แล้ว');
      console.log('💾 ไฟล์ภาพต้นฉบับยังอยู่ในโฟลเดอร์');
      console.log(`📁 ที่อยู่: public${selectedImage.image_url}`);
    }
  } catch (error) {
    console.log('\n❌ เกิดข้อผิดพลาด:', error.message);
  }
  
  await ask('\nกดเอนเทอร์เพื่อกลับดูหมวดหมู่...');
  await viewByCategory();
}

// Add image to specific category
async function addImageToCategory(selectedCategory) {
  console.log(`\n➕ เพิ่มภาพใหม่ในหมวด: ${selectedCategory.name}`);
  
  // Show existing files in folder
  const folderPath = path.join(__dirname, 'public', 'image', selectedCategory.folder);
  const existingFiles = fs.existsSync(folderPath) 
    ? fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg'))
    : [];
  
  console.log(`\n📁 ไฟล์ที่มีอยู่ในโฟลเดอร์:`);
  if (existingFiles.length === 0) {
    console.log('   (ยังไม่มีไฟล์)');
  } else {
    existingFiles.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file}`);
    });
  }
  
  console.log('\n📝 กรอกข้อมูลภาพใหม่:');
  const fileName = await ask('👉 ชื่อไฟล์ (เช่น my-photo.jpg): ');
  
  if (!fileName.endsWith('.jpg')) {
    console.log('❌ ชื่อไฟล์ต้องลงท้ายด้วย .jpg');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await viewByCategory();
  }
  
  // Check if file exists
  const fullPath = path.join(folderPath, fileName);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ ไม่พบไฟล์: ${fullPath}`);
    console.log('💡 กรุณาวางไฟล์ในโฟลเดอร์ก่อน');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await viewByCategory();
  }
  
  // Auto-generate title or let user input
  const templates = contentTemplates[selectedCategory.category] || ['ภาพสวยๆ'];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  console.log(`\n💡 แนะนำชื่อ: ${randomTemplate}`);
  const title = await ask('👉 ชื่อภาพ (เว้นว่างใช้แนะนำ): ') || randomTemplate;
  
  const description = await ask('👉 คำอธิบาย (เว้นว่างใช้อัตโนมัติ): ') 
    || `${title} จัดโดยทีมงานมืออาชีพของ Fuzio Catering พร้อมบริการครบครันในสถานที่ของคุณ`;
  
  // Add to database
  try {
    const imageUrl = `/image/${selectedCategory.folder}/${fileName}`;
    
    const { data, error } = await supabase
      .from('portfolio_images')
      .insert({
        title: title,
        description: description,
        category: selectedCategory.category,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.log('❌ เกิดข้อผิดพลาด:', error.message);
    } else {
      console.log('\n✅ เพิ่มภาพสำเร็จ!');
      console.log(`📁 หมวดหมู่: ${selectedCategory.name}`);
      console.log(`🖼️  ชื่อ: ${title}`);
      console.log(`📝 คำอธิบาย: ${description}`);
      console.log(`🔗 URL: ${imageUrl}`);
    }
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
  }
  
  await ask('\nกดเอนเทอร์เพื่อกลับดูหมวดหมู่...');
  await viewByCategory();
}

// Move image between categories
async function moveImageBetweenCategories() {
  console.clear();
  console.log('📤 =======================================');
  console.log('       ย้ายภาพระหว่างหมวดหมู่');
  console.log('📤 =======================================\n');
  
  try {
    // Get all images
    const { data: images, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !images || images.length === 0) {
      console.log('❌ ไม่พบภาพในฐานข้อมูล');
      await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
      return await showMainMenu();
    }
    
    console.log('📋 เลือกภาพที่ต้องการย้าย:\n');
    
    images.forEach((img, i) => {
      const categoryInfo = Object.values(categories).find(c => c.category === img.category);
      const categoryName = categoryInfo ? categoryInfo.name : img.category;
      console.log(`${i + 1}. ${img.title} (${categoryName})`);
    });
    
    const imageChoice = await ask('\n👉 เลือกภาพ (หมายเลข): ');
    const imageIndex = parseInt(imageChoice) - 1;
    
    if (imageIndex < 0 || imageIndex >= images.length) {
      console.log('❌ หมายเลขไม่ถูกต้อง');
      await ask('กดเอนเทอร์เพื่อลองใหม่...');
      return await moveImageBetweenCategories();
    }
    
    const selectedImage = images[imageIndex];
    const currentCategoryInfo = Object.values(categories).find(c => c.category === selectedImage.category);
    
    console.log(`\n📸 ภาพที่เลือก: ${selectedImage.title}`);
    console.log(`📂 หมวดปัจจุบัน: ${currentCategoryInfo?.name || selectedImage.category}`);
    
    console.log('\n📂 เลือกหมวดหมู่ใหม่:');
    Object.keys(categories).forEach(key => {
      const cat = categories[key];
      const catDir = path.join(__dirname, 'public', 'image', cat.folder);
      let imageCount = 0;
      
      if (fs.existsSync(catDir)) {
        const files = fs.readdirSync(catDir);
        imageCount = files.filter(file => 
          file.toLowerCase().endsWith('.jpg') || 
          file.toLowerCase().endsWith('.jpeg') ||
          file.toLowerCase().endsWith('.png')
        ).length;
      }
      
      const status = cat.category === selectedImage.category ? ' (ปัจจุบัน)' : '';
      console.log(`${key}. ${cat.name} (${imageCount} ภาพ)${status}`);
    });
    
    const categoryChoice = await ask('\n👉 เลือกหมวดใหม่: ');
    const newCategory = categories[categoryChoice];
    
    if (!newCategory) {
      console.log('❌ หมายเลขหมวดหมู่ไม่ถูกต้อง');
      await ask('กดเอนเทอร์เพื่อลองใหม่...');
      return await moveImageBetweenCategories();
    }
    
    if (newCategory.category === selectedImage.category) {
      console.log('💡 ภาพอยู่ในหมวดเดียวกันแล้ว');
      await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
      return await showMainMenu();
    }
    
    // Create new filename for the new category (check for conflicts)
    const currentPath = selectedImage.image_url.replace('/image/', '');
    const originalFileName = path.basename(currentPath);
    
    // Check target directory for existing files
    const targetDir = path.join(__dirname, 'public', 'image', newCategory.folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const existingTargetFiles = fs.readdirSync(targetDir);
    const targetImageFiles = existingTargetFiles.filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg') ||
      file.toLowerCase().endsWith('.png')
    );
    
    // Generate safe filename
    let newFileName;
    if (targetImageFiles.includes(originalFileName)) {
      // File exists, generate new numbered name
      const numberedFiles = existingTargetFiles
        .map(file => {
          const match = file.match(/^(\d+)\.jpg$/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      const nextNumber = numberedFiles.length > 0 
        ? Math.max(...numberedFiles) + 1 
        : targetImageFiles.length + 1;
      
      newFileName = `${String(nextNumber).padStart(2, '0')}.jpg`;
      console.log(`⚠️  ไฟล์ ${originalFileName} ซ้ำ จะใช้ชื่อใหม่: ${newFileName}`);
    } else {
      newFileName = originalFileName;
    }
    
    const newImageUrl = `/image/${newCategory.folder}/${newFileName}`;
    
    console.log(`\n📋 ข้อมูลการย้าย:`);
    console.log(`🖼️  ภาพ: ${selectedImage.title}`);
    console.log(`📂 จาก: ${currentCategoryInfo?.name}`);
    console.log(`📂 ไป: ${newCategory.name}`);
    console.log(`🔗 URL ใหม่: ${newImageUrl}`);
    
    const confirm = await ask('\n👉 ยืนยันการย้าย? พิมพ์ "ย้าย" เพื่อยืนยัน: ');
    
    if (confirm !== 'ย้าย') {
      console.log('✅ ยกเลิกการย้ายแล้ว');
      await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
      return await showMainMenu();
    }
    
    // Move the physical file
    const sourcePath = path.join(__dirname, 'public', currentPath);
    const targetPath = path.join(__dirname, 'public', 'image', newCategory.folder, newFileName);
    
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  ไฟล์ต้นฉบับไม่พบ: ${sourcePath}`);
      console.log('💡 จะอัปเดตเฉพาะฐานข้อมูล');
    } else {
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Move the file
      fs.copyFileSync(sourcePath, targetPath);
      fs.unlinkSync(sourcePath);
      console.log('✅ ย้ายไฟล์สำเร็จ');
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('portfolio_images')
      .update({
        category: newCategory.category,
        image_url: newImageUrl
      })
      .eq('id', selectedImage.id);
    
    if (updateError) {
      console.log('❌ เกิดข้อผิดพลาดในการอัปเดตฐานข้อมูล:', updateError.message);
    } else {
      console.log('🎉 ย้ายภาพสำเร็จแล้ว!');
      console.log(`✅ ${selectedImage.title} ย้ายไป ${newCategory.name}`);
    }
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
  }
  
  await ask('\nกดเอนเทอร์เพื่อกลับเมนูหลัก...');
  await showMainMenu();
}

// Upload external file
async function uploadExternalFile() {
  console.clear();
  console.log('📥 =======================================');
  console.log('       อัปโหลดไฟล์จากภายนอก');
  console.log('📥 =======================================\n');
  
  console.log('💡 วิธีใช้งาน:');
  console.log('1. วางไฟล์ที่ต้องการในโฟลเดอร์ชั่วคราว');
  console.log('2. ระบุชื่อไฟล์และหมวดหมู่');
  console.log('3. ระบบจะย้ายไฟล์และสร้างชื่อใหม่อัตโนมัติ\n');
  
  const tempDir = path.join(__dirname, 'temp-upload');
  
  // Create temp directory if not exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`📁 สร้างโฟลเดอร์ชั่วคราว: ${tempDir}`);
  }
  
  console.log(`📂 โฟลเดอร์สำหรับวางไฟล์: ${tempDir}`);
  console.log('🔍 กำลังตรวจสอบไฟล์ในโฟลเดอร์...\n');
  
  // List files in temp directory
  const tempFiles = fs.readdirSync(tempDir).filter(file => 
    file.toLowerCase().endsWith('.jpg') || 
    file.toLowerCase().endsWith('.jpeg') ||
    file.toLowerCase().endsWith('.png')
  );
  
  if (tempFiles.length === 0) {
    console.log('❌ ไม่พบไฟล์ภาพใน temp-upload');
    console.log('💡 กรุณาวางไฟล์ .jpg, .jpeg หรือ .png ในโฟลเดอร์');
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  console.log('📸 ไฟล์ที่พบ:');
  tempFiles.forEach((file, i) => {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`${i + 1}. ${file} (${sizeKB} KB)`);
  });
  
  const fileChoice = await ask('\n👉 เลือกไฟล์ (หมายเลข): ');
  const fileIndex = parseInt(fileChoice) - 1;
  
  if (fileIndex < 0 || fileIndex >= tempFiles.length) {
    console.log('❌ หมายเลขไฟล์ไม่ถูกต้อง');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await uploadExternalFile();
  }
  
  const selectedFile = tempFiles[fileIndex];
  const originalFilePath = path.join(tempDir, selectedFile);
  
  console.log('\n📂 เลือกหมวดหมู่สำหรับภาพ:');
  Object.keys(categories).forEach(key => {
    const cat = categories[key];
    const catDir = path.join(__dirname, 'public', 'image', cat.folder);
    let imageCount = 0;
    
    if (fs.existsSync(catDir)) {
      const files = fs.readdirSync(catDir);
      imageCount = files.filter(file => 
        file.toLowerCase().endsWith('.jpg') || 
        file.toLowerCase().endsWith('.jpeg') ||
        file.toLowerCase().endsWith('.png')
      ).length;
    }
    
    console.log(`${key}. ${cat.name} (${imageCount} ภาพ)`);
  });
  
  const categoryChoice = await ask('\n👉 เลือกหมวดหมู่: ');
  const selectedCategory = categories[categoryChoice];
  
  if (!selectedCategory) {
    console.log('❌ หมายเลขหมวดหมู่ไม่ถูกต้อง');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await uploadExternalFile();
  }
  
  // Auto-generate filename
  const categoryDir = path.join(__dirname, 'public', 'image', selectedCategory.folder);
  
  // Ensure category directory exists
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
  
  // Find next available number by counting all image files
  const existingFiles = fs.readdirSync(categoryDir);
  const imageFiles = existingFiles.filter(file => 
    file.toLowerCase().endsWith('.jpg') || 
    file.toLowerCase().endsWith('.jpeg') ||
    file.toLowerCase().endsWith('.png')
  );
  
  console.log(`📊 มีภาพในหมวดนี้อยู่แล้ว: ${imageFiles.length} ไฟล์`);
  if (imageFiles.length > 0) {
    console.log(`📄 ไฟล์ที่มีอยู่: ${imageFiles.slice(0, 3).join(', ')}${imageFiles.length > 3 ? '...' : ''}`);
  }
  
  // Get numbers from numbered files (XX.jpg format)
  const numberedFiles = existingFiles
    .map(file => {
      const match = file.match(/^(\d+)\.jpg$/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(num => num > 0);
  
  // Find next number: either max numbered file + 1, or total files + 1
  const nextNumber = numberedFiles.length > 0 
    ? Math.max(...numberedFiles) + 1 
    : imageFiles.length + 1;
  const newFileName = `${String(nextNumber).padStart(2, '0')}.jpg`;
  const newFilePath = path.join(categoryDir, newFileName);
  
  console.log(`\n📋 ข้อมูลไฟล์ใหม่:`);
  console.log(`📂 หมวดหมู่: ${selectedCategory.name}`);
  console.log(`📄 ชื่อไฟล์เดิม: ${selectedFile}`);
  console.log(`📄 ชื่อไฟล์ใหม่: ${newFileName}`);
  console.log(`📍 ตำแหน่งใหม่: public/image/${selectedCategory.folder}/${newFileName}`);
  
  // Generate title and description
  const imageNumber = await getNextImageNumber();
  const title = generateImageTitle(selectedCategory.category, imageNumber);
  const description = generateImageDescription(selectedCategory.category, title);
  
  console.log(`🖼️  ชื่อภาพ: ${title}`);
  console.log(`📝 คำอธิบาย: ${description}`);
  
  const customTitle = await ask('\n👉 ชื่อภาพ (กดเอนเทอร์ใช้อัตโนมัติ): ') || title;
  const customDescription = await ask('👉 คำอธิบาย (กดเอนเทอร์ใช้อัตโนมัติ): ') || description;
  
  const confirm = await ask('\n👉 ยืนยันการอัปโหลด? พิมพ์ "อัปโหลด" เพื่อยืนยัน: ');
  
  if (confirm !== 'อัปโหลด') {
    console.log('✅ ยกเลิกการอัปโหลดแล้ว');
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  try {
    // Copy file to destination
    fs.copyFileSync(originalFilePath, newFilePath);
    
    // Delete original file
    fs.unlinkSync(originalFilePath);
    
    // Add to database
    const imageUrl = `/image/${selectedCategory.folder}/${newFileName}`;
    
    const { data, error } = await supabase
      .from('portfolio_images')
      .insert([{
        title: customTitle,
        description: customDescription,
        image_url: imageUrl,
        category: selectedCategory.category
      }])
      .select();
    
    if (error) {
      console.log('❌ เกิดข้อผิดพลาดในการบันทึกฐานข้อมูล:', error.message);
      // Delete the copied file if database insert failed
      if (fs.existsSync(newFilePath)) {
        fs.unlinkSync(newFilePath);
      }
    } else {
      console.log('\n🎉 อัปโหลดสำเร็จแล้ว!');
      console.log(`✅ ไฟล์: ${newFileName}`);
      console.log(`✅ หมวดหมู่: ${selectedCategory.name}`);
      console.log(`✅ ชื่อ: ${customTitle}`);
      console.log(`✅ คำอธิบาย: ${customDescription}`);
    }
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
  }
  
  await ask('\nกดเอนเทอร์เพื่อกลับเมนูหลัก...');
  await showMainMenu();
}

// Helper function to get next image number
async function getNextImageNumber() {
  try {
    const { count } = await supabase
      .from('portfolio_images')
      .select('*', { count: 'exact', head: true });
    
    return (count || 0) + 1;
  } catch (error) {
    return 1;
  }
}

// Helper function to generate clean filename
function generateCleanFilename(originalName, category) {
  // Remove extension
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  
  // Convert to clean format
  const cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Add category prefix
  const categoryPrefix = Object.values(categories).find(c => c.category === category)?.folder.split('-')[0] || 'img';
  
  return `${categoryPrefix}-${cleanName}.jpg`;
}

// Selective delete by category
async function selectiveDeleteByCategory() {
  console.clear();
  console.log('🗑️ =======================================');
  console.log('      เลือกลบภาพในหมวดหมู่');
  console.log('🗑️ =======================================\n');
  
  // Show categories with image counts
  console.log('📂 เลือกหมวดหมู่:');
  
  // Get current stats for each category
  const { data: allImages, error: statsError } = await supabase
    .from('portfolio_images')
    .select('category');
  
  if (statsError) {
    console.log('❌ เกิดข้อผิดพลาด:', statsError.message);
    await ask('กดเอนเทอร์เพื่อกลับเมนูหลัก...');
    return await showMainMenu();
  }
  
  const categoryStats = allImages.reduce((acc, img) => {
    acc[img.category] = (acc[img.category] || 0) + 1;
    return acc;
  }, {});
  
  Object.keys(categories).forEach(key => {
    const cat = categories[key];
    const count = categoryStats[cat.category] || 0;
    console.log(`${key}. ${cat.name} (${count} รูป)`);
  });
  console.log('11. 🔙 กลับเมนูหลัก\n');
  
  const categoryChoice = await ask('👉 เลือกหมวดหมู่ (1-11): ');
  
  if (categoryChoice === '11') {
    return await showMainMenu();
  }
  
  if (!categories[categoryChoice]) {
    console.log('❌ เลือกหมายเลข 1-11 เท่านั้น');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await selectiveDeleteByCategory();
  }
  
  const selectedCategory = categories[categoryChoice];
  
  // Get images for this category
  const { data: images, error } = await supabase
    .from('portfolio_images')
    .select('*')
    .eq('category', selectedCategory.category)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await selectiveDeleteByCategory();
  }
  
  if (images.length === 0) {
    console.log(`❌ ไม่มีภาพในหมวด ${selectedCategory.name}`);
    await ask('กดเอนเทอร์เพื่อกลับเลือกหมวดใหม่...');
    return await selectiveDeleteByCategory();
  }
  
  console.log(`\n📂 หมวด: ${selectedCategory.name} (${images.length} รูป)`);
  console.log('='.repeat(50));
  
  // Show images with numbers
  images.forEach((img, i) => {
    const date = new Date(img.created_at).toLocaleDateString('th-TH');
    console.log(`${i + 1}. 🖼️  ${img.title}`);
    console.log(`   📝 ${img.description.substring(0, 60)}...`);
    console.log(`   📅 ${date}`);
    console.log();
  });
  
  console.log('💡 วิธีเลือกภาพที่จะลบ:');
  console.log('   - เลือกภาพเดียว: พิมพ์หมายเลข เช่น 5');
  console.log('   - เลือกหลายภาพ: พิมพ์หมายเลขคั่นด้วยเครื่องหมายจุลภาค เช่น 1,3,5,7');
  console.log('   - เลือกช่วง: พิมพ์หมายเลขคั่นด้วยขีด เช่น 1-5 (ภาพที่ 1 ถึง 5)');
  console.log('   - 0 = กลับเมนูหลัก\n');
  
  const selection = await ask('👉 เลือกภาพที่จะลบ: ');
  
  if (selection === '0') {
    return await selectiveDeleteByCategory();
  }
  
  // Parse selection
  let selectedIndices = [];
  
  try {
    if (selection.includes(',')) {
      // Multiple selection: 1,3,5
      selectedIndices = selection.split(',').map(s => parseInt(s.trim()) - 1);
    } else if (selection.includes('-')) {
      // Range selection: 1-5
      const [start, end] = selection.split('-').map(s => parseInt(s.trim()));
      for (let i = start - 1; i < end; i++) {
        selectedIndices.push(i);
      }
    } else {
      // Single selection: 5
      selectedIndices = [parseInt(selection) - 1];
    }
    
    // Validate indices
    selectedIndices = selectedIndices.filter(i => i >= 0 && i < images.length);
    
    if (selectedIndices.length === 0) {
      console.log('❌ ไม่มีหมายเลขที่ถูกต้อง');
      await ask('กดเอนเทอร์เพื่อลองใหม่...');
      return await selectiveDeleteByCategory();
    }
    
  } catch (error) {
    console.log('❌ รูปแบบการเลือกไม่ถูกต้อง');
    await ask('กดเอนเทอร์เพื่อลองใหม่...');
    return await selectiveDeleteByCategory();
  }
  
  // Show selected images for confirmation
  const selectedImages = selectedIndices.map(i => images[i]);
  
  console.log(`\n⚠️  คุณเลือกภาพที่จะลบ ${selectedImages.length} รูป:`);
  console.log('='.repeat(50));
  
  selectedImages.forEach((img, i) => {
    console.log(`${i + 1}. ${img.title}`);
  });
  
  console.log('\n💡 การลบจะทำให้:');
  console.log('   ✅ ภาพหายจากเว็บไซต์');
  console.log('   ✅ ข้อมูลถูกลบจากฐานข้อมูล');
  console.log('   ❌ ไฟล์ภาพจริงยังอยู่ในโฟลเดอร์');
  
  const confirm = await ask(`\n👉 ยืนยันการลบ ${selectedImages.length} รูป? พิมพ์ "ลบเลย" เพื่อยืนยัน: `);
  
  if (confirm !== 'ลบเลย') {
    console.log('✅ ยกเลิกการลบ ภาพปลอดภัย!');
    await ask('กดเอนเทอร์เพื่อกลับเลือกใหม่...');
    return await selectiveDeleteByCategory();
  }
  
  // Delete selected images
  console.log(`\n🔄 กำลังลบ ${selectedImages.length} รูป...`);
  
  let deletedCount = 0;
  let failedCount = 0;
  
  for (const img of selectedImages) {
    try {
      const { error: deleteError } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', img.id);
      
      if (deleteError) {
        console.log(`❌ ลบไม่สำเร็จ: ${img.title}`);
        failedCount++;
      } else {
        console.log(`✅ ลบแล้ว: ${img.title}`);
        deletedCount++;
      }
    } catch (error) {
      console.log(`❌ ข้อผิดพลาด: ${img.title}`);
      failedCount++;
    }
  }
  
  console.log(`\n🎉 สรุปผลการลบ:`);
  console.log(`✅ ลบสำเร็จ: ${deletedCount} รูป`);
  if (failedCount > 0) {
    console.log(`❌ ลบไม่สำเร็จ: ${failedCount} รูป`);
  }
  
  console.log('\n📊 สถิติหลังการลบ:');
  const remainingCount = images.length - deletedCount;
  console.log(`📂 ${selectedCategory.name}: เหลือ ${remainingCount} รูป`);
  
  const continueChoice = await ask('\n👉 ต้องการทำอะไรต่อ? [1=ลบต่อ, 2=เลือกหมวดอื่น, 3=เมนูหลัก]: ');
  
  switch(continueChoice) {
    case '1':
      return await selectiveDeleteByCategory();
    case '2':
      return await selectiveDeleteByCategory();
    case '3':
    default:
      return await showMainMenu();
  }
}

// Helper function to generate image title
function generateImageTitle(category, imageNumber) {
  const templates = contentTemplates[category] || ['ภาพสวยๆ'];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  return `${randomTemplate} - ภาพที่ ${imageNumber}`;
}

// Helper function to generate image description
function generateImageDescription(category, title) {
  return `${title} จัดโดยทีมงานมืออาชีพของ Fuzio Catering พร้อมบริการครบครันในสถานที่ของคุณ`;
}

// Start the program
console.log('🚀 เริ่มต้นโปรแกรม...');
showMainMenu().catch(console.error);