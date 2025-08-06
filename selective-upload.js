const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import content from bulk-image-upload.js
const { categoryContent } = require('./bulk-image-upload');

// Supabase configuration
const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';
const supabase = createClient(supabaseUrl, supabaseKey);

// สร้าง readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

// Map folder names to database categories
function getCategoryFromFolder(folderName) {
  const folderMap = {
    '01-weddings': 'wedding',
    '02-corporate-meetings': 'corporate', 
    '03-fine-dining': 'fine-dining',
    '04-buffet-service': 'buffet',
    '05-cocktail-reception': 'cocktail',
    '06-coffee-break': 'coffee-break',
    '07-snack-food-box': 'snack-box',
    '08-government-events': 'corporate', // Use corporate instead of government
    '09-private-parties': 'wedding' // Use wedding instead of signature
  };
  return folderMap[folderName] || 'snack-box';
}

// Generate unique content for each image
function generateImageContent(category, index, filename) {
  const categoryData = categoryContent[category];
  const template = categoryData[index % categoryData.length];
  
  // Extract image number from filename for unique identification
  const matches = filename.match(/_(\d+)\.jpg$/);
  const imageNum = matches ? matches[1] : (index + 1);
  
  return {
    title: `${template.title} - ภาพที่ ${imageNum}`,
    description: template.description,
    tags: template.tags,
    category: category
  };
}

function getCategoryLabel(category) {
  const labels = {
    'wedding': 'งานแต่งงาน',
    'corporate': 'งานองค์กร',
    'fine-dining': 'ไฟน์ไดนิ่ง',
    'buffet': 'บุฟเฟ่ต์',
    'cocktail': 'ค็อกเทล',
    'coffee-break': 'คอฟฟี่เบรค',
    'snack-box': 'สแน็คบ็อกซ์'
  };
  return labels[category] || category;
}

function parseSelection(selection, maxNum) {
  const indices = [];
  const parts = selection.split(',').map(s => s.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n.trim()));
      if (start >= 1 && end <= maxNum && start <= end) {
        for (let i = start; i <= end; i++) {
          indices.push(i);
        }
      }
    } else {
      const num = parseInt(part);
      if (num >= 1 && num <= maxNum) {
        indices.push(num);
      }
    }
  }
  
  return [...new Set(indices)]; // ลบซ้ำ
}

async function selectiveUpload() {
  try {
    console.log('🎯 ============ SELECTIVE IMAGE UPLOAD ============\n');

    // Check all category folders for images
    const imageDir = path.join(__dirname, 'public', 'image');
    const categoryFolders = [
      '01-weddings', '02-corporate-meetings', '03-fine-dining', 
      '04-buffet-service', '05-cocktail-reception', '06-coffee-break', 
      '07-snack-food-box', '08-government-events', '09-private-parties'
    ];

    let allFiles = [];
    
    // Collect files from all category folders
    for (const folder of categoryFolders) {
      const folderPath = path.join(imageDir, folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath)
          .filter(file => file.endsWith('.jpg'))
          .map(file => ({
            filename: file,
            folder: folder,
            fullPath: path.join(folderPath, file),
            category: getCategoryFromFolder(folder)
          }));
        allFiles = allFiles.concat(files);
      }
    }

    if (allFiles.length === 0) {
      console.log('❌ ไม่พบรูปในโฟลเดอร์ public/image/');
      rl.close();
      return;
    }

    console.log(`📋 พบรูปทั้งหมด ${allFiles.length} รูป จาก ${categoryFolders.length} โฟลเดอร์:\n`);
    
    // แสดงรายการรูปทั้งหมด
    allFiles.forEach((fileInfo, index) => {
      const categoryLabel = getCategoryLabel(fileInfo.category);
      console.log(`${index + 1}. ${fileInfo.filename}`);
      console.log(`   โฟลเดอร์: ${fileInfo.folder} | หมวด: ${categoryLabel}`);
      console.log('');
    });

    const selection = await question('ใส่หมายเลขรูปที่ต้องการอัพโหลด (เช่น 1,3,5 หรือ 1-10 หรือ all): ');
    
    if (!selection || selection.trim() === '') {
      console.log('❌ ไม่ได้เลือกรูป');
      rl.close();
      return;
    }
    
    let selectedFiles = [];
    
    if (selection.toLowerCase() === 'all') {
      selectedFiles = allFiles;
    } else {
      const indices = parseSelection(selection, allFiles.length);
      if (indices.length === 0) {
        console.log('❌ รูปแบบการเลือกไม่ถูกต้อง');
        rl.close();
        return;
      }
      selectedFiles = indices.map(i => allFiles[i - 1]);
    }

    console.log(`\n📋 รายการที่จะอัพโหลด (${selectedFiles.length} รูป):`);
    selectedFiles.forEach((fileInfo, index) => {
      const categoryLabel = getCategoryLabel(fileInfo.category);
      console.log(`${index + 1}. ${fileInfo.filename} (${categoryLabel})`);
    });

    const confirm = await question(`\n⚠️  ต้องการอัพโหลด ${selectedFiles.length} รูปใช่หรือไม่? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ ยกเลิกการอัพโหลด');
      rl.close();
      return;
    }

    console.log('\n🚀 เริ่มอัพโหลด...\n');

    // เช็ครูปที่มีอยู่แล้วในฐานข้อมูล
    const { data: existingImages } = await supabase
      .from('portfolio_images')
      .select('image_url');
    
    const existingUrls = new Set(existingImages?.map(img => img.image_url) || []);

    let uploadedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const fileInfo = selectedFiles[i];
      const { filename, folder, fullPath, category } = fileInfo;
      const publicUrl = `/image/${folder}/${filename}`;
      
      // เช็คว่ารูปนี้มีอยู่แล้วไหม
      if (existingUrls.has(publicUrl)) {
        console.log(`⏭️  ข้าม ${filename} - มีอยู่แล้วในฐานข้อมูล`);
        skippedCount++;
        continue;
      }

      const content = generateImageContent(category, i, filename);
      
      console.log(`📤 กำลังอัพโหลด ${filename} จาก ${folder} เป็น ${getCategoryLabel(category)}...`);

      // Insert into database
      const { error: dbError } = await supabase
        .from('portfolio_images')
        .insert({
          title: content.title,
          description: content.description,
          category: content.category,
          image_url: publicUrl,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error(`❌ Database error สำหรับ ${filename}:`, dbError.message);
        continue;
      }

      console.log(`✅ อัพโหลด ${filename} สำเร็จ!`);
      uploadedCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n🎉 เสร็จสิ้นการอัพโหลด!');
    console.log(`✅ อัพโหลดสำเร็จ: ${uploadedCount} รูป`);
    console.log(`⏭️  ข้ามแล้ว: ${skippedCount} รูป`);
    console.log(`📊 รวมทั้งหมด: ${selectedFiles.length} รูป`);
    
  } catch (error) {
    console.error('❌ Error ในกระบวนการอัพโหลด:', error.message);
  } finally {
    rl.close();
  }
}

// Run the selective upload
if (require.main === module) {
  selectiveUpload();
}

module.exports = { selectiveUpload };