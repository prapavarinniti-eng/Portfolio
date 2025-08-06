# 🎯 คู่มือคำสั่งแอดมิน Fuzio Catering

## 🚀 วิธีใช้งาน

### 1. Interactive Menu (แบบโต้ตอบ)
```bash
npm run admin
# หรือ
node admin-commands.js
# หรือ (Windows)
admin.bat
```

### 2. Quick Commands (คำสั่งด่วน)
```bash
# ดูสถิติรูปภาพ
npm run admin:stats

# อัพโหลดรูปจากโฟลเดอร์
npm run admin:upload

# เพิ่มประสิทธิภาพฐานข้อมูล
npm run admin:optimize

# ลบรูปทั้งหมด
npm run admin:clear

# ดูความช่วยเหลือ
npm run admin:help
```

## 📋 คำสั่งที่มี

### 📊 **1. ดูสถิติรูปภาพ**
- แสดงจำนวนรูปทั้งหมด
- แสดงจำนวนรูปแยกตามหมวดหมู่
- ข้อมูลแบบเรียลไทม์

**คำสั่ง:**
```bash
npm run admin:stats
```

### 📤 **2. อัพโหลดรูปจากโฟลเดอร์**
- อัพโหลดรูปจาก `public/image/`
- จัดหมวดหมู่อัตโนมัติตามโฟลเดอร์
- สร้างข้อมูลภาพอัตโนมัติ

**คำสั่ง:**
```bash
npm run admin:upload
```

### ⚡ **3. เพิ่มประสิทธิภาพฐานข้อมูล**
- จำกัดจำนวนรูปต่อหมวดหมู่
- ลบรูปเก่าที่เกิน
- เก็บรูปใหม่ล่าสุด

**จำนวนที่เก็บต่อหมวดหมู่:**
- รูปภาพของโต๊ะอาหาร: 25 รูป
- รูปภาพอาหาร: 25 รูป
- รูปภาพบรรยากาศงาน: 20 รูป
- รูปภาพเมนูหรืออาหารพิเศษ: 15 รูป

**คำสั่ง:**
```bash
npm run admin:optimize
```

### 🔍 **4. ค้นหารูปภาพ**
- ค้นหาจากชื่อหรือคำอธิบาย
- แสดงผลลัพธ์แบบละเอียด
- จำกัดผล 20 รายการ

### 🗑️ **5. ลบรูปตามหมวดหมู่**
- เลือกหมวดหมู่ที่ต้องการลบ
- แสดงจำนวนรูปก่อนลบ
- ยืนยันการลบ

### 💥 **6. ลบรูปทั้งหมด**
- ลบรูปทั้งหมดในฐานข้อมูล
- ต้องยืนยัน 2 ครั้ง
- **⚠️ ใช้ด้วยความระมัดระวัง!**

**คำสั่ง:**
```bash
npm run admin:clear
```

## 🛡️ ข้อควรระวัง

### ⚠️ **คำสั่งอันตราย**
- `admin:clear` - ลบรูปทั้งหมด (ไม่สามารถกู้คืน)
- `admin:optimize` - ลบรูปเก่าที่เกิน (ไม่สามารถกู้คืน)

### ✅ **คำสั่งปลอดภัย**
- `admin:stats` - เพียงดูข้อมูล
- `admin:upload` - เพิ่มรูปใหม่
- ค้นหารูป - เพียงดูข้อมูล

## 🎯 ตัวอย่างการใช้งาน

### สถานการณ์ที่ 1: ตรวจสอบสถานะ
```bash
npm run admin:stats
```

### สถานการณ์ที่ 2: อัพโหลดรูปใหม่
```bash
# วางรูปในโฟลเดอร์หมวดหมู่ใหม่:
# public/image/01-buffet-table/
# public/image/02-food-plating/
# public/image/03-event-atmosphere/
# public/image/04-special-dishes/
npm run admin:upload
```

### สถานการณ์ที่ 3: เว็บไซต์ช้า (รูปเยอะ)
```bash
npm run admin:optimize
```

### สถานการณ์ที่ 4: เริ่มใหม่หมด
```bash
npm run admin:clear
npm run admin:upload
```

## 📁 โครงสร้างโฟลเดอร์รูปภาพ

```
public/image/
├── 01-buffet-table/       → รูปภาพของโต๊ะอาหาร (Buffet, Table Setting)
├── 02-food-plating/       → รูปภาพอาหาร (Food Plating, Food Station)  
├── 03-event-atmosphere/   → รูปภาพบรรยากาศงาน (Event Decoration, Lighting)
└── 04-special-dishes/     → รูปภาพเมนูหรืออาหารพิเศษ (Special Dishes)

# Legacy folders (ยังคงรองรับ)
├── 01-weddings/           → จัดเป็นหมวด event-atmosphere
├── 02-corporate-meetings/ → จัดเป็นหมวด buffet-table  
├── 03-fine-dining/        → จัดเป็นหมวด food-plating
├── 04-buffet-service/     → จัดเป็นหมวด buffet-table
├── 05-cocktail-reception/ → จัดเป็นหมวด food-plating
├── 06-coffee-break/       → จัดเป็นหมวด food-plating
├── 07-snack-food-box/     → จัดเป็นหมวด special-dishes
├── 08-government-events/  → จัดเป็นหมวด buffet-table
└── 09-private-parties/    → จัดเป็นหมวด event-atmosphere
```

## 🔧 การแก้ไขปัญหา

### ปัญหา: คำสั่งไม่ทำงาน
```bash
# ตรวจสอบ Node.js
node --version

# ติดตั้ง dependencies
npm install
```

### ปัญหา: ไม่เชื่อมต่อฐานข้อมูล
- ตรวจสอบ Supabase URL และ Key
- ตรวจสอบการเชื่อมต่อ internet

### ปัญหา: รูปไม่อัพโหลด
- ตรวจสอบรูปใน `public/image/`
- ตรวจสอบ file permissions
- ดู error message

## 📞 การขอความช่วยเหลือ

```bash
npm run admin:help
```

หรือรัน Interactive Menu:
```bash
npm run admin
```