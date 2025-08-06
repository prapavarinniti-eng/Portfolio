const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = 'https://jpkzzovrrjrtchfdxdce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w';

const supabase = createClient(supabaseUrl, supabaseKey);

// สร้าง readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class AdminCommands {
  
  async showStats() {
    console.log('📊 กำลังโหลดสถิติ...\n');
    
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('category');
      
      if (error) throw error;
      
      const categoryCount = data.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 สถิติรูปภาพปัจจุบัน:');
      console.log(`   รวมทั้งหมด: ${data.length} รูป\n`);
      
      Object.entries(categoryCount).forEach(([category, count]) => {
        const label = this.getCategoryLabel(category);
        console.log(`   ${label}: ${count} รูป`);
      });
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  async deleteByCategory() {
    console.log('🗑️  ลบรูปตามหมวดหมู่\n');
    
    // แสดงหมวดหมู่ที่มี
    await this.showStats();
    
    const category = await this.question('\nใส่ชื่อหมวดหมู่ที่ต้องการลบ (เช่น wedding, corporate): ');
    
    if (!category) {
      console.log('❌ กรุณาใส่ชื่อหมวดหมู่');
      return;
    }
    
    try {
      // นับรูปในหมวดหมู่นี้
      const { data: images, error: countError } = await supabase
        .from('portfolio_images')
        .select('id, title')
        .eq('category', category);
      
      if (countError) throw countError;
      
      if (images.length === 0) {
        console.log(`❌ ไม่พบรูปในหมวดหมู่ "${category}"`);
        return;
      }
      
      const confirm = await this.question(`⚠️  ต้องการลบ ${images.length} รูปในหมวดหมู่ "${category}" ใช่หรือไม่? (yes/no): `);
      
      if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
        console.log('❌ ยกเลิกการลบ');
        return;
      }
      
      // ลบรูปทั้งหมดในหมวดหมู่
      const { error: deleteError } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('category', category);
      
      if (deleteError) throw deleteError;
      
      console.log(`✅ ลบ ${images.length} รูปในหมวดหมู่ "${category}" สำเร็จ`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  async clearAllImages() {
    console.log('🗑️  ลบรูปทั้งหมด\n');
    
    const confirm1 = await this.question('⚠️  ต้องการลบรูปทั้งหมดในฐานข้อมูลใช่หรือไม่? (yes/no): ');
    
    if (confirm1.toLowerCase() !== 'yes' && confirm1.toLowerCase() !== 'y') {
      console.log('❌ ยกเลิกการลบ');
      return;
    }
    
    const confirm2 = await this.question('⚠️  แน่ใจหรือไม่? การกระทำนี้ไม่สามารถกู้คืนได้! (type DELETE): ');
    
    if (confirm2 !== 'DELETE') {
      console.log('❌ ยกเลิกการลบ');
      return;
    }
    
    try {
      console.log('🔄 กำลังลบรูปทั้งหมด...');
      
      let deletedCount = 0;
      let hasMore = true;
      
      while (hasMore) {
        const { data: batch } = await supabase
          .from('portfolio_images')
          .select('id')
          .limit(100);
        
        if (!batch || batch.length === 0) {
          hasMore = false;
          break;
        }
        
        const { error: deleteError } = await supabase
          .from('portfolio_images')
          .delete()
          .in('id', batch.map(r => r.id));
        
        if (deleteError) {
          console.log('❌ Error:', deleteError.message);
          break;
        }
        
        deletedCount += batch.length;
        console.log(`✅ ลบแล้ว ${deletedCount} รูป...`);
      }
      
      console.log(`🎉 ลบรูปทั้งหมดสำเร็จ! (รวม ${deletedCount} รูป)`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  async uploadFromFolder() {
    console.log('📤 อัพโหลดรูปจากโฟลเดอร์\n');
    
    const { uploadImages } = require('./bulk-image-upload');
    
    const confirm = await this.question('ต้องการอัพโหลดรูปจากโฟลเดอร์ public/image ใช่หรือไม่? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ ยกเลิกการอัพโหลด');
      return;
    }
    
    try {
      console.log('🚀 เริ่มอัพโหลด...\n');
      await uploadImages();
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  async optimizeDatabase() {
    console.log('⚡ เพิ่มประสิทธิภาพฐานข้อมูล\n');
    
    const { optimizeDatabase } = require('./optimize-database');
    
    const confirm = await this.question('ต้องการเพิ่มประสิทธิภาพฐานข้อมูล (จำกัดจำนวนรูปต่อหมวดหมู่) ใช่หรือไม่? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ ยกเลิก');
      return;
    }
    
    try {
      console.log('🚀 เริ่มเพิ่มประสิทธิภาพ...\n');
      await optimizeDatabase();
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  async searchImages() {
    console.log('🔍 ค้นหารูปภาพ\n');
    
    const searchTerm = await this.question('ใส่คำค้นหา (ชื่อหรือคำอธิบาย): ');
    
    if (!searchTerm) {
      console.log('❌ กรุณาใส่คำค้นหา');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('id, title, description, category, created_at')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      if (data.length === 0) {
        console.log(`❌ ไม่พบรูปที่ตรงกับ "${searchTerm}"`);
        return;
      }
      
      console.log(`🔍 พบ ${data.length} รูปที่ตรงกับ "${searchTerm}":\n`);
      
      data.forEach((img, index) => {
        const date = new Date(img.created_at).toLocaleDateString('th-TH');
        console.log(`${index + 1}. ${img.title}`);
        console.log(`   หมวดหมู่: ${this.getCategoryLabel(img.category)}`);
        console.log(`   วันที่: ${date}`);
        if (img.description) {
          console.log(`   คำอธิบาย: ${img.description.substring(0, 100)}...`);
        }
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  getCategoryLabel(category) {
    const labels = {
      'buffet-table': 'รูปภาพของโต๊ะอาหาร',
      'food-plating': 'รูปภาพอาหาร',
      'event-atmosphere': 'รูปภาพบรรยากาศงาน',
      'special-dishes': 'รูปภาพเมนูหรืออาหารพิเศษ'
    };
    return labels[category] || category;
  }
  
  question(query) {
    return new Promise(resolve => {
      rl.question(query, resolve);
    });
  }
  
  async showMenu() {
    console.clear();
    console.log('🎯 ============ FUZIO CATERING ADMIN ============');
    console.log('');
    console.log('เลือกคำสั่งที่ต้องการ:');
    console.log('');
    console.log('1. 📊 ดูสถิติรูปภาพ');
    console.log('2. 📤 อัพโหลดรูปจากโฟลเดอร์');
    console.log('3. ⚡ เพิ่มประสิทธิภาพฐานข้อมูล');
    console.log('4. 🔍 ค้นหารูปภาพ');
    console.log('5. 🗑️  ลบรูปตามหมวดหมู่');
    console.log('6. 💥 ลบรูปทั้งหมด');
    console.log('0. 🚪 ออก');
    console.log('');
    
    const choice = await this.question('ใส่หมายเลขคำสั่ง: ');
    
    switch (choice) {
      case '1':
        await this.showStats();
        break;
      case '2':
        await this.uploadFromFolder();
        break;
      case '3':
        await this.optimizeDatabase();
        break;
      case '4':
        await this.searchImages();
        break;
      case '5':
        await this.deleteByCategory();
        break;
      case '6':
        await this.clearAllImages();
        break;
      case '0':
        console.log('👋 ขอบคุณที่ใช้ Fuzio Admin!');
        rl.close();
        return;
      default:
        console.log('❌ กรุณาเลือกหมายเลข 0-6');
    }
    
    console.log('\n');
    await this.question('กด Enter เพื่อกลับเมนู...');
    await this.showMenu();
  }
}

// รันโปรแกรม
const admin = new AdminCommands();
admin.showMenu().catch(console.error);