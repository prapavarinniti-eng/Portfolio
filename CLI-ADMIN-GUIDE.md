# 🔧 CLI Admin Commands Guide

## 📋 คำสั่งพื้นฐาน

### การใช้งาน CLI Admin
```bash
# เข้าสู่ระบบ admin แบบ interactive
npm run admin

# หรือใช้คำสั่งเร็ว
npm run admin:stats     # ดูสถิติ
npm run admin:help      # ดูคำสั่งทั้งหมด
```

## 🎯 คำสั่งหลักทั้งหมด

### 1. สถิติและข้อมูล
```bash
# ดูสถิติรูปภาพทั้งหมด
npm run admin:stats

# แสดงผล:
# 📊 สถิติรูปภาพ:
# - รูปทั้งหมด: 1,234
# - งานแต่งงาน: 20
# - งานบริษัท: 15
# - บุฟเฟต์: 25
```

### 2. การอัพโหลด
```bash
# อัพโหลดรูปใหม่
npm run admin:upload

# เลือกไฟล์และหมวดหมู่
# รองรับ: .jpg, .jpeg, .png, .webp
```

### 3. การจัดการรูปภาพ
```bash
# เข้าสู่ระบบจัดการแบบเต็ม
npm run admin

# ฟีเจอร์ใน admin mode:
# - ดูรายการรูปแบบ pagination
# - เลือกรูปด้วยหมายเลข (1,3,5)  
# - เลือกช่วง (1-10)
# - เลือกทั้งหมด (all)
# - ลบรูปที่เลือก
# - แก้ไขข้อมูลรูป
```

### 4. การ Optimize ฐานข้อมูล
```bash
# ลดจำนวนรูปให้เหมาะสม
npm run admin:optimize

# จำกัดรูปต่อหมวดให้:
# - งานแต่งงาน: 20 รูป
# - งานบริษัท: 15 รูป  
# - บุฟเฟต์: 25 รูป
# - อื่นๆ: 10-15 รูป
```

### 5. การลบข้อมูล
```bash
# ลบรูปเก่าทั้งหมด (ระวัง!)
npm run admin:clear

# ลบรูปที่เลือกแบบบังคับ
npm run admin:delete
```

## 🔥 CLI Admin Interactive Mode

### การเข้าใช้งาน:
```bash
npm run admin
```

### เมนูหลัก:
```
🎯 ยินดีต้อนรับ Fuzio Admin CLI
1. 📊 ดูสถิติรูปภาพ
2. 📋 จัดการรูปภาพ  
3. 📤 อัพโหลดรูปใหม่
4. 🔧 เครื่องมือขั้นสูง
5. ❌ ออกจากระบบ
```

### การเลือกรูปแบบใหม่:
```bash
# เลือกรูปเดี่ยว
เลือกรูป: 5

# เลือกหลายรูป
เลือกรูป: 1,3,5,7

# เลือกช่วง
เลือกรูป: 1-10

# เลือกทั้งหมด
เลือกรูป: all

# เลือกทั้งหมดในหน้า
เลือกรูป: page
```

## 🚨 Emergency Procedures

### เมื่อเว็บแอดมิน down:
1. **ใช้ CLI admin เป็นทางเลือก**
   ```bash
   npm run admin:stats  # ตรวจสอบสถานะ
   npm run admin        # เข้าระบบจัดการ
   ```

2. **อัพโหลดฉุกเฉิน**
   ```bash
   npm run admin:upload
   # เลือกไฟล์และหมวดหมู่
   ```

3. **ลบรูปปัญหา**
   ```bash
   npm run admin
   # > เลือก "จัดการรูปภาพ"
   # > เลือกรูปที่มีปัญหา
   # > ลบ
   ```

### เมื่อฐานข้อมูลล้น:
```bash
# ลดจำนวนรูปอัตโนมัติ
npm run admin:optimize

# หรือลบรูปเก่าแบบระวัง
npm run admin:clear
```

## 🔒 การแก้ปัญหา RLS (Row Level Security)

### ปัญหา: "มันลบไม่ได้"
**สาเหตุ**: Supabase RLS policies ป้องกันการลบ

**วิธีแก้ชั่วคราว**:
1. **ใช้เว็บแอดมิน** (แนะนำ)
   - ไป `/admin` 
   - ระบบจะ authenticate ถูกต้อง
   - ลบได้ปกติ

2. **แก้ RLS policy ชั่วคราว**:
   ```sql
   -- ใน Supabase SQL Editor
   ALTER TABLE portfolio_images DISABLE ROW LEVEL SECURITY;
   -- ใช้ CLI ลบ
   -- แล้วเปิด RLS กลับ
   ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
   ```

3. **ใช้ Service Role Key**:
   ```bash
   # ตั้ง environment variable
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   npm run admin
   ```

## ⚡ Performance Tips

### CLI ใช้เมื่อไหร่:
- ✅ เว็บแอดมิน down หรือช้า
- ✅ ต้องการจัดการรูปจำนวนมาก  
- ✅ ทำงานจากเครื่อง server
- ✅ Automation scripts

### เว็บแอดมินใช้เมื่อไหร่:
- ✅ ใช้งานประจำวัน (แนะนำ)
- ✅ อัพโหลดรูปใหม่
- ✅ ดูตัวอย่างรูป
- ✅ UI ใช้งานง่าย

## 📝 Cheat Sheet

### คำสั่งที่ใช้บ่อย:
```bash
npm run admin:stats           # สถิติรูป
npm run admin                # จัดการแบบเต็ม  
npm run admin:help           # ดูคำสั่งทั้งหมด
npm run admin:optimize       # ลดรูปเก่า
```

### การเลือกรูปแบบต่างๆ:
```bash
5         # รูปที่ 5
1,3,5     # รูป 1, 3, 5
1-10      # รูป 1 ถึง 10
all       # ทั้งหมดในฐานข้อมูล
page      # ทั้งหมดในหน้านี้
```

### Keyboard Shortcuts:
```bash
Ctrl+C    # ออกจากระบบ
Enter     # ยืนยันการเลือก
q         # กลับเมนูหลัก (บางหน้า)
```

## 🎉 Best Practices

### การใช้งานประจำ:
1. **ใช้เว็บแอดมิน** สำหรับงานทั่วไป
2. **ใช้ CLI** เป็น backup เมื่อจำเป็น
3. **ใช้ UptimeRobot** ป้องกัน server sleep
4. **สำรองข้อมูล** เป็นระยะ

### การรักษาความปลอดภัย:
- ✅ ไม่แชร์ credentials CLI
- ✅ ใช้ environment variables
- ✅ เปิด RLS policies เสมอ
- ✅ ตรวจสอบก่อนลบ

**CLI Admin = Emergency Tool + Power User Features! 🚀**