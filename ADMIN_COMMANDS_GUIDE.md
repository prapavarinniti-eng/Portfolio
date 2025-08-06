# 🎯 คู่มือการจัดการภาพ Fuzio Catering

> **สถานะปัจจุบัน:** 96 รูปภาพในระบบ, หมวดหมู่ใหม่ 4 หมวด พร้อมระบบ mapping แปลงฐานข้อมูล

## 🌟 การเปลี่ยนแปลงสำคัญ

### 🆕 **ระบบหมวดหมู่ใหม่ (UI)**
1. **รูปภาพของโต๊ะอาหาร** (buffet-table) - Buffet, Table Setting
2. **รูปภาพอาหาร** (food-plating) - Food Plating, Food Station  
3. **รูปภาพบรรยากาศงาน** (event-atmosphere) - Event Decoration, Lighting
4. **รูปภาพเมนูหรืออาหารพิเศษ** (special-dishes) - Special Dishes

### 🔄 **ระบบ Category Mapping**
- UI แสดงหมวดหมู่ใหม่ (4 หมวด) แต่ฐานข้อมูลยังใช้หมวดเก่า (7 หมวด)
- ระบบแปลงหมวดหมู่อัตโนมัติ: UI ↔ Database
- ไม่ต้องเปลี่ยนโครงสร้างฐานข้อมูลหรือย้ายไฟล์

## 🚀 วิธีเพิ่ม/แก้ไขรูปภาพ

### วิธีที่ 1: อัพโหลดรูปใหม่ (แนะนำ)
```bash
# 1. วางไฟล์รูปในโฟลเดอร์ที่เหมาะสม
# public/image/01-weddings/ → บรรยากาศงาน
# public/image/02-corporate-meetings/ → โต๊ะอาหาร
# public/image/03-fine-dining/ → อาหาร
# (ดู Folder Mapping ด้านล่าง)

# 2. รันคำสั่งอัพโหลด
node bulk-image-upload.js
```

### วิธีที่ 2: ใช้ CLI Commands (สำหรับ advanced users)
```bash
# ดูสถิติปัจจุบัน
npm run admin:stats

# ลบข้อมูลเก่าและอัพโหลดใหม่
npm run admin:clear
node bulk-image-upload.js

# ดูความช่วยเหลือ
npm run admin:help
```

## 📋 คำสั่งหลักที่ใช้งาน

### 📤 **1. อัพโหลดรูปใหม่ (คำสั่งหลัก)**
```bash
node bulk-image-upload.js
```
**สิ่งที่ทำ:**
- อ่านรูปจากทุกโฟลเดอร์ใน `public/image/`
- จัดหมวดหมู่อัตโนมัติตามโฟลเดอร์
- สร้างชื่อและคำอธิบายสำหรับแต่ละรูป
- บันทึกลงฐานข้อมูล Supabase
- **ปลอดภัย:** ไม่ลบรูปเก่า เพิ่มเฉพาะรูปใหม่

### 📊 **2. ดูสถิติรูปภาพ**
```bash
npm run admin:stats
```
**แสดงข้อมูล:**
- จำนวนรูปทั้งหมด (ปัจจุบัน: 96 รูป)
- จำนวนรูปแยกตามหมวดฐานข้อมูล
- สถานะการเชื่อมต่อฐานข้อมูล

### 🗑️ **3. ลบรูปทั้งหมด (ใช้ระวัง)**
```bash
npm run admin:clear
```
**คำเตือน:** ลบรูปทั้งหมดในฐานข้อมูล (ไม่สามารถกู้คืน)
**ใช้เมื่อ:** ต้องการรีเซ็ตและเริ่มใหม่

### 📞 **4. ดูความช่วยเหลือ**
```bash
npm run admin:help
```

## 🗂️ โครงสร้างระบบหมวดหมู่

### 🔄 **Category Mapping System**

**UI Categories (หน้าเว็บ) → Database Categories (ฐานข้อมูล):**
- `buffet-table` → `corporate`, `buffet`
- `food-plating` → `fine-dining`, `cocktail`, `coffee-break`  
- `event-atmosphere` → `wedding`
- `special-dishes` → `snack-box`

**ประโยชน์:**
- ✅ UI แสดงหมวดใหม่ 4 หมวดที่เข้าใจง่าย
- ✅ Database ใช้หมวดเก่า 7 หมวด (ไม่ต้องเปลี่ยน)
- ✅ ไม่ต้องย้ายไฟล์หรือแก้ไขฐานข้อมูล
- ✅ รองรับทั้งหมวดเก่าและใหม่

### 📊 **สถิติปัจจุบัน (96 รูป):**
- **wedding** (21 รูป) → แสดงเป็น "บรรยากาศงาน"
- **corporate** (10 รูป) → แสดงเป็น "โต๊ะอาหาร"  
- **fine-dining** (10 รูป) → แสดงเป็น "อาหาร"
- **buffet** (15 รูป) → แสดงเป็น "โต๊ะอาหาร"
- **cocktail** (10 รูป) → แสดงเป็น "อาหาร"
- **coffee-break** (10 รูป) → แสดงเป็น "อาหาร"
- **snack-box** (10 รูป) → แสดงเป็น "เมนูพิเศษ"

## 🛡️ ข้อควรระวัง

### ⚠️ **คำสั่งอันตราย**
- `npm run admin:clear` - ลบรูปทั้งหมด (ไม่สามารถกู้คืน)

### ✅ **คำสั่งปลอดภัย**  
- `node bulk-image-upload.js` - เพิ่มรูปใหม่เท่านั้น
- `npm run admin:stats` - เพียงดูข้อมูล
- `npm run admin:help` - ดูความช่วยเหลือ

### 🔒 **ระบบป้องกัน**
- รูปซ้ำจะไม่ถูกเพิ่มซ้ำ (ตรวจสอบจาก image_url)
- ฐานข้อมูลมี Row Level Security (RLS)
- ไฟล์รูปจัดเก็บใน `public/image/` (ปลอดภัย)

## 🎯 ตัวอย่างการใช้งานจริง

### สถานการณ์ 1: ตรวจสอบสถานะปัจจุบัน
```bash
npm run admin:stats
# ผลลัพธ์: Total images: 96
```

### สถานการณ์ 2: เพิ่มรูปงานแต่งงานใหม่
```bash
# 1. Copy รูปใส่โฟลเดอร์
cp new-wedding-photos/* public/image/01-weddings/

# 2. อัพโหลดเข้าฐานข้อมูล
node bulk-image-upload.js

# 3. ตรวจสอบผลลัพธ์
npm run admin:stats
```

### สถานการณ์ 3: เพิ่มรูปอาหารใหม่
```bash
# 1. วางรูปในโฟลเดอร์อาหาร
cp new-food-photos/* public/image/03-fine-dining/

# 2. อัพโหลด
node bulk-image-upload.js
```

### สถานการณ์ 4: รีเซ็ตระบบใหม่หมด
```bash
# 1. ลบข้อมูลเก่า (ระวัง!)
npm run admin:clear

# 2. อัพโหลดรูปทั้งหมดใหม่
node bulk-image-upload.js

# 3. ตรวจสอบ
npm run admin:stats
```

## 📁 โครงสร้างโฟลเดอร์ปัจจุบัน

### 🗂️ **Current Folder Structure (96 รูป)**
```
public/image/
├── 01-weddings/           (21 รูป) → DB: wedding → UI: บรรยากาศงาน
├── 02-corporate-meetings/ (10 รูป) → DB: corporate → UI: โต๊ะอาหาร
├── 03-fine-dining/        (10 รูป) → DB: fine-dining → UI: อาหาร
├── 04-buffet-service/     (15 รูป) → DB: buffet → UI: โต๊ะอาหาร
├── 05-cocktail-reception/ (10 รูป) → DB: cocktail → UI: อาหาร
├── 06-coffee-break/       (10 รูป) → DB: coffee-break → UI: อาหาร
├── 07-snack-food-box/     (10 รูป) → DB: snack-box → UI: เมนูพิเศษ
├── 08-government-events/  (10 รูป) → DB: corporate → UI: โต๊ะอาหาร
└── 09-private-parties/    ( 6 รูป) → DB: wedding → UI: บรรยากาศงาน
```

### 📝 **Folder → Category Mapping**
| โฟลเดอร์ | Database Category | UI Category | รูป |
|---------|------------------|------------|----|
| `01-weddings` | `wedding` | บรรยากาศงาน | 21 |
| `02-corporate-meetings` | `corporate` | โต๊ะอาหาร | 10 |
| `03-fine-dining` | `fine-dining` | อาหาร | 10 |
| `04-buffet-service` | `buffet` | โต๊ะอาหาร | 15 |
| `05-cocktail-reception` | `cocktail` | อาหาร | 10 |
| `06-coffee-break` | `coffee-break` | อาหาร | 10 |
| `07-snack-food-box` | `snack-box` | เมนูพิเศษ | 10 |
| `08-government-events` | `corporate` | โต๊ะอาหาร | 10 |
| `09-private-parties` | `wedding` | บรรยากาศงาน | 6 |

**หมายเหตุ:** ใช้โฟลเดอร์เก่าได้ปกติ ระบบจะแปลงหมวดหมู่อัตโนมัติ

## 🔧 การแก้ไขปัญหา

### ❌ ปัญหา: คำสั่งไม่ทำงาน
```bash
# ตรวจสอบ Node.js (ต้อง >= 16)
node --version

# ติดตั้ง dependencies
npm install

# ตรวจสอบว่าไฟล์มีอยู่
ls -la bulk-image-upload.js
```

### ❌ ปัญหา: Database connection error
```bash
# ตรวจสอบ environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# หรือตรวจสอบใน bulk-image-upload.js
# supabaseUrl และ supabaseKey ต้องมีค่า
```

### ❌ ปัญหา: รูปไม่อัพโหลด
```bash
# ตรวจสอบว่ามีรูปในโฟลเดอร์
ls -la public/image/01-weddings/

# ตรวจสอบ file extension (ต้องเป็น .jpg)
find public/image/ -name "*.jpg" | wc -l

# รันด้วย debug mode
node bulk-image-upload.js 2>&1 | tee upload.log
```

### ❌ ปัญหา: รูปซ้ำ
- ระบบป้องกันรูปซ้ำอัตโนมัติ (ตรวจจาก image_url)
- ถ้าต้องการอัพโหลดซ้ำ: ใช้ `npm run admin:clear` ก่อน

## 🆘 การขอความช่วยเหลือ

### วิธีที่ 1: ดูคำสั่งที่มี
```bash
npm run admin:help
```

### วิธีที่ 2: ตรวจสอบสถานะ
```bash
npm run admin:stats
```

### วิธีที่ 3: ดู Log Error
```bash
# รันคำสั่งและเก็บ log
node bulk-image-upload.js > upload.log 2>&1
cat upload.log
```

---

**📅 อัพเดตล่าสุด:** 6 สิงหาคม 2568  
**✅ สถานะ:** 96 รูป, Category Mapping System, พร้อมใช้งาน