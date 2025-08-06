const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🌟 ============ วิธีใช้งานง่ายๆ สำหรับเด็ก ============');
console.log('');
console.log('📋 ขั้นตอนง่ายๆ:');
console.log('1. ใส่รูปในโฟลเดอร์ที่ต้องการ');
console.log('2. รันคำสั่งนี้');
console.log('3. เสร็จ! รูปจะขึ้นเว็บทันที');
console.log('');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';
const supabase = createClient(supabaseUrl, supabaseKey);

// เนื้อหาสำหรับแต่ละหมวด
const categoryContent = {
  'wedding': [
    { title: 'งานแต่งงานสุดหรู', description: 'จัดเลี้ยงแต่งงานสไตล์โรแมนติก พร้อมเมนูพิเศษและการตกแต่งระดับพรีเมี่ยม', tags: ['แต่งงาน', 'โรแมนติก', 'หรูหรา'] },
    { title: 'เลี้ยงแต่งงานในสวน', description: 'บรรยากาศงานแต่งงานกลางแจ้งในสวนสวย พร้อมเมนูพิเศษ', tags: ['งานแต่งงาน', 'กลางแจ้ง', 'สวนสวย'] }
  ],
  'corporate': [
    { title: 'งานสัมมนาองค์กร', description: 'บริการจัดเลี้ยงสำหรับงานสัมมนาและประชุมใหญ่', tags: ['สัมมนา', 'องค์กร', 'ประชุม'] },
    { title: 'Coffee Break ประชุม', description: 'บริการ Coffee Break ระดับพรีเมี่ยมสำหรับการประชุม', tags: ['กาแฟเบรค', 'ประชุม', 'ผู้บริหาร'] }
  ],
  'fine-dining': [
    { title: 'อาหารระดับเชฟ', description: 'เมนูอาหารระดับไฮเอนด์จากเชฟมืออาชีพ', tags: ['ไฟน์ไดนิ่ง', 'เชฟ', 'หรูหรา'] },
    { title: 'Tasting Menu พิเศษ', description: 'เมนูชิมลิ้มรสพิเศษจากเชฟ', tags: ['เทสติ้ง', 'พิเศษ', 'เชฟ'] }
  ],
  'buffet': [
    { title: 'บุฟเฟ่ต์หรูหรา', description: 'บุฟเฟ่ต์อาหารครบครัน ทั้งไทยและนานาชาติ', tags: ['บุฟเฟ่ต์', 'หลากหลาย', 'คุณภาพ'] },
    { title: 'Seafood Buffet', description: 'บุฟเฟ่ต์อาหารทะเลพรีเมี่ยม', tags: ['อาหารทะเล', 'บุฟเฟ่ต์', 'สดใหม่'] }
  ],
  'cocktail': [
    { title: 'งานค็อกเทลพาร์ตี้', description: 'งานเลี้ยงค็อกเทลพร้อมเครื่องดื่มมิกซ์พิเศษ', tags: ['ค็อกเทล', 'เครื่องดื่ม', 'พาร์ตี้'] },
    { title: 'Welcome Drink พรีเมี่ยม', description: 'เครื่องดื่มต้อนรับสำหรับงานเลี้ยง VIP', tags: ['เครื่องดื่ม', 'ต้อนรับ', 'VIP'] }
  ],
  'coffee-break': [
    { title: 'กาแฟเบรคหรูหรา', description: 'ชุดกาแฟเบรคระดับผู้บริหาร', tags: ['กาแฟเบรค', 'ผู้บริหาร', 'พรีเมี่ยม'] },
    { title: 'Morning Coffee Set', description: 'ชุดกาแฟและเปสตรี้เช้า', tags: ['กาแฟ', 'เช้า', 'เปสตรี้'] }
  ],
  'snack-box': [
    { title: 'กล่องขนมพรีเมี่ยม', description: 'กล่องอาหารว่างคุณภาพสูง', tags: ['กล่องขนม', 'พรีเมี่ยม', 'คุณภาพ'] },
    { title: 'Healthy Snack Box', description: 'กล่องขนมเพื่อสุขภาพ', tags: ['ขนมเพื่อสุขภาพ', 'กล่อง', 'สดใหม่'] }
  ]
};

// แมป folder กับ category
const folderToCategoryMap = {
  '01-weddings': 'wedding',
  '02-corporate-meetings': 'corporate',
  '03-fine-dining': 'fine-dining',
  '04-buffet-service': 'buffet',
  '05-cocktail-reception': 'cocktail',
  '06-coffee-break': 'coffee-break',
  '07-snack-food-box': 'snack-box',
  '08-government-events': 'corporate',
  '09-private-parties': 'wedding'
};

// แมป category กับชื่อภาษาไทย
const categoryNames = {
  'wedding': 'รูปภาพบรรยากาศงาน',
  'corporate': 'รูปภาพของโต๊ะอาหาร',
  'fine-dining': 'รูปภาพอาหาร',
  'buffet': 'รูปภาพของโต๊ะอาหาร',
  'cocktail': 'รูปภาพอาหาร',
  'coffee-break': 'รูปภาพอาหาร',
  'snack-box': 'รูปภาพเมนูหรืออาหารพิเศษ'
};

async function easyUpload() {
  console.log('🔍 กำลังสแกนโฟลเดอร์...');
  
  const imageDir = path.join(__dirname, 'public', 'image');
  const folders = Object.keys(folderToCategoryMap);
  
  let totalFound = 0;
  let totalUploaded = 0;
  
  for (const folder of folders) {
    const folderPath = path.join(imageDir, folder);
    
    if (!fs.existsSync(folderPath)) {
      console.log(`⏭️  ข้าม ${folder} - โฟลเดอร์ไม่มี`);
      continue;
    }
    
    const files = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.jpg'))
      .sort();
    
    if (files.length === 0) {
      console.log(`⏭️  ข้าม ${folder} - ไม่มีรูป`);
      continue;
    }
    
    const category = folderToCategoryMap[folder];
    const categoryName = categoryNames[category];
    
    console.log(`\n📁 ${folder}: พบ ${files.length} รูป → ${categoryName}`);
    
    totalFound += files.length;
    
    // เช็คว่ารูปไหนมีในฐานข้อมูลแล้ว
    const { data: existingImages } = await supabase
      .from('portfolio_images')
      .select('image_url')
      .like('image_url', `%${folder}%`);
    
    const existingUrls = new Set(existingImages?.map(img => img.image_url) || []);
    
    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const publicUrl = `/image/${folder}/${filename}`;
      
      // ข้ามถ้ามีแล้ว
      if (existingUrls.has(publicUrl)) {
        console.log(`  ⏭️  ${filename} - มีแล้ว`);
        continue;
      }
      
      // สร้างเนื้อหา
      const contentTemplate = categoryContent[category][i % categoryContent[category].length];
      const imageNum = filename.match(/_(\d+)\.jpg$/)?.[1] || (i + 1);
      
      const content = {
        title: `${contentTemplate.title} - ภาพที่ ${imageNum}`,
        description: contentTemplate.description,
        category: category,
        image_url: publicUrl,
        created_at: new Date().toISOString()
      };
      
      // อัพโหลดเข้าฐานข้อมูล
      const { error } = await supabase
        .from('portfolio_images')
        .insert(content);
      
      if (error) {
        console.log(`  ❌ ${filename} - ผิดพลาด: ${error.message}`);
      } else {
        console.log(`  ✅ ${filename} - อัพโหลดแล้ว`);
        totalUploaded++;
      }
    }
  }
  
  console.log('\n🎉 เสร็จสิ้น!');
  console.log(`📊 พบรูปทั้งหมด: ${totalFound} รูป`);
  console.log(`✅ อัพโหลดใหม่: ${totalUploaded} รูป`);
  console.log(`⏭️  ข้ามที่มีแล้ว: ${totalFound - totalUploaded} รูป`);
  console.log('\n🌐 เปิดเว็บได้เลย: http://localhost:3000/portfolio');
}

easyUpload().catch(console.error);