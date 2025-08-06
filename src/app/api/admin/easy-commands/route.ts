import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
const folderToCategoryMap: Record<string, string> = {
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

async function runEasyUpload() {
  const output: string[] = ['🔍 กำลังสแกนโฟลเดอร์...'];
  
  const imageDir = path.join(process.cwd(), 'public', 'image');
  const folders = Object.keys(folderToCategoryMap);
  
  let totalFound = 0;
  let totalUploaded = 0;
  
  for (const folder of folders) {
    const folderPath = path.join(imageDir, folder);
    
    if (!fs.existsSync(folderPath)) {
      output.push(`⏭️ ข้าม ${folder} - โฟลเดอร์ไม่มี`);
      continue;
    }
    
    const files = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.jpg'))
      .sort();
    
    if (files.length === 0) {
      output.push(`⏭️ ข้าม ${folder} - ไม่มีรูป`);
      continue;
    }
    
    const category = folderToCategoryMap[folder];
    output.push(`📁 ${folder}: พบ ${files.length} รูป → ${category}`);
    
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
        output.push(`  ⏭️ ${filename} - มีแล้ว`);
        continue;
      }
      
      // สร้างเนื้อหา
      const contentTemplate = categoryContent[category as keyof typeof categoryContent][i % categoryContent[category as keyof typeof categoryContent].length];
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
        output.push(`  ❌ ${filename} - ผิดพลาด: ${error.message}`);
      } else {
        output.push(`  ✅ ${filename} - อัพโหลดแล้ว`);
        totalUploaded++;
      }
    }
  }
  
  output.push('');
  output.push('🎉 เสร็จสิ้น!');
  output.push(`📊 พบรูปทั้งหมด: ${totalFound} รูป`);
  output.push(`✅ อัพโหลดใหม่: ${totalUploaded} รูป`);
  output.push(`⏭️ ข้ามที่มีแล้ว: ${totalFound - totalUploaded} รูป`);
  
  return output;
}

async function runEasyReset() {
  const output: string[] = ['🧹 ล้างข้อมูลเก่า...'];
  
  // ลบข้อมูลทั้งหมด
  const { error } = await supabase
    .from('portfolio_images')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // ลบทั้งหมด
    
  if (error) {
    output.push(`❌ ข้อผิดพลาด: ${error.message}`);
  } else {
    output.push('✅ ล้างข้อมูลเสร็จแล้ว!');
    output.push('📁 ตอนนี้สามารถอัพโหลดรูปใหม่ได้');
  }
  
  return output;
}

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();
    
    let output: string[] = [];
    
    switch (command) {
      case 'easy:upload':
        output = await runEasyUpload();
        break;
      
      case 'easy:reset':
        output = await runEasyReset();
        break;
      
      case 'easy:check-duplicates':
        output = ['🔍 ฟีเจอร์นี้กำลังพัฒนา...', 'ใช้คำสั่ง easy:upload แทน (จะข้ามรูปซ้ำอัตโนมัติ)'];
        break;
      
      case 'easy:remove-duplicates':
        output = ['🗑️ ฟีเจอร์นี้กำลังพัฒนา...', 'ใช้คำสั่ง easy:reset แล้ว easy:upload ใหม่แทน'];
        break;
      
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid command' 
        });
    }

    return NextResponse.json({
      success: true,
      output: output
    });

  } catch (error: any) {
    console.error('Command execution error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Command execution failed'
    });
  }
}