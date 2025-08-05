# 🚀 UptimeRobot Setup Guide สำหรับ Fuzio Catering

## 📋 ขั้นตอนการตั้งค่า UptimeRobot

### 1. สมัครสมาชิก UptimeRobot
1. ไปที่ **https://uptimerobot.com**
2. คลิก **"Sign Up Free"**
3. ใส่อีเมล์และรหัสผ่าน
4. ยืนยันอีเมล์

### 2. เพิ่ม Monitor สำหรับเว็บไซต์
1. คลิก **"+ Add New Monitor"**
2. เลือก **"HTTP(s)"**
3. กรอกข้อมูล:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `Fuzio Catering Portfolio`
   - **URL**: `https://your-app.onrender.com` (เปลี่ยนเป็น URL จริง)
   - **Monitoring Interval**: `5 minutes` (แนะนำ)
4. คลิก **"Create Monitor"**

### 3. เพิ่ม Monitor สำหรับ API Keep-Alive
1. เพิ่ม Monitor ใหม่อีกตัว
2. กรอกข้อมูล:
   - **Friendly Name**: `Fuzio API Keep-Alive`
   - **URL**: `https://your-app.onrender.com/api/keepalive`
   - **Monitoring Interval**: `5 minutes`
3. คลิก **"Create Monitor"**

### 4. ตั้งค่า Alert Contacts
1. ไปที่ **"Alert Contacts"**
2. คลิก **"Add Alert Contact"**
3. เลือก **"E-mail"**
4. ใส่อีเมล์ที่ต้องการรับแจ้งเตือน
5. Verify อีเมล์

### 5. กำหนด Alert Rules
1. กลับไปที่ **"Monitors"**
2. คลิกที่ Monitor ที่สร้าง
3. คลิก **"Edit"**
4. ใน **"Alert Contacts"** เลือกอีเมล์ที่เพิ่มไว้
5. ตั้งค่า:
   - **When to alert**: `When goes DOWN`
   - **Notify when back UP**: ✅ เลือก
6. **Save Changes**

## 🎯 URLs ที่ต้องใช้

### URLs สำหรับ Production
- **Main Site**: `https://your-app.onrender.com`
- **Admin Panel**: `https://your-app.onrender.com/admin`
- **Keep-Alive API**: `https://your-app.onrender.com/api/keepalive`
- **Portfolio Gallery**: `https://your-app.onrender.com/portfolio`

### URLs สำหรับ Testing (Local)
- **Main Site**: `http://localhost:3000`
- **Keep-Alive API**: `http://localhost:3000/api/keepalive`

## ⚙️ แนะนำการตั้งค่า

### Monitor Settings ที่แนะนำ:
- **Interval**: 5 minutes (ป้องกัน Render sleep ดีที่สุด)
- **Timeout**: 30 seconds
- **Alert when**: Down for 2 minutes

### Alert Settings:
- ✅ Email notifications
- ✅ Notify when back UP
- ✅ Send logs with alerts

## 📊 สิ่งที่ UptimeRobot จะทำให้

### ✅ ประโยชน์:
1. **ป้องกัน Server Sleep** - Ping ทุก 5 นาที
2. **Monitor Uptime** - ตรวจสอบว่าเว็บทำงานหรือไม่
3. **แจ้งเตือนทันที** - Email เมื่อเว็บ down
4. **สถิติ Uptime** - ดู uptime percentage
5. **Status Page** - หน้าสถานะสำหรับแชร์

### 📈 Dashboard Features:
- Uptime percentage (มุ่งเป้า 99%+)
- Response time graphs
- Downtime logs
- Alert history

## 🔧 การทดสอบ

### ทดสอบว่า Monitor ทำงาน:
1. Deploy เว็บไปที่ Render
2. รอ 5-10 นาที
3. ตรวจสอบใน UptimeRobot Dashboard
4. ควรเห็น **"UP"** และ response time

### ทดสอบ Alert System:
1. หยุด server ชั่วคราว (หรือใส่ URL ผิด)
2. รอ 2-5 นาที
3. ควรได้รับ email แจ้งเตือน
4. เมื่อ server กลับมา ควรได้รับ email "back UP"

## 📝 Checklist การตั้งค่า

- [ ] สมัคร UptimeRobot account
- [ ] เพิ่ม Monitor สำหรับ main site
- [ ] เพิ่ม Monitor สำหรับ /api/keepalive
- [ ] ตั้งค่า email alerts
- [ ] ทดสอบ monitoring
- [ ] ทดสอบ alert system
- [ ] บันทึก login credentials

## 💡 Pro Tips

### เพิ่มประสิทธิภาพ:
1. **ใช้ 2 Monitors** - main site + API endpoint
2. **ตั้ง interval สั้น** - 5 minutes ป้องกัน sleep ดีที่สุด
3. **Monitor หลาย pages** - /admin, /portfolio เพิ่มความมั่นใจ
4. **ตั้ง timeout สั้น** - detect ปัญหาเร็วขึ้น

### Render + UptimeRobot = Perfect Combo:
- UptimeRobot ping ทุก 5 นาที
- Render จะไม่ sleep เพราะมี traffic
- ระบบทำงาน 24/7 แบบฟรี!

## 🎉 เสร็จแล้ว!

เมื่อตั้งค่าเสร็จ:
1. เว็บจะไม่ sleep อีกต่อไป
2. มี monitoring แบบ real-time
3. แจ้งเตือนเมื่อมีปัญหา
4. ระบบทำงานแบบ professional!