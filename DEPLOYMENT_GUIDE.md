# 🚀 Deployment Guide - คู่มือ Deploy

## ✅ **สถานะ: พร้อม Deploy 100%**

เว็บไซต์ Fuzio Catering Portfolio พร้อม deploy แล้ว!

---

## 🌐 **แพลตฟอร์มแนะนำ**

### ⭐ **Vercel (แนะนำที่สุด)**

#### 🔸 **ทำไมเลือก Vercel?**
- 🚀 Deploy อัตโนมัติจาก GitHub
- ⚡ CDN ระดับโลก - เร็วทั่วโลก
- 🔄 Zero configuration สำหรับ Next.js
- 💰 Free tier ใช้ได้จริง
- 📊 Analytics และ monitoring ในตัว

#### 📋 **ขั้นตอน Deploy ใน Vercel**

**Step 1: เตรียม Repository**
```bash
# ถ้ายังไม่ได้สร้าง Git
git init
git add .
git commit -m "Ready for deployment"

# Push ขึ้น GitHub
git remote add origin https://github.com/yourusername/catering-portfolio.git
git push -u origin main
```

**Step 2: Deploy ใน Vercel**
1. ไปที่ [vercel.com](https://vercel.com)
2. Sign up/Login ด้วย GitHub
3. กด "New Project"
4. เลือก repository: `catering-portfolio`
5. กด "Deploy"

**Step 3: ตั้งค่า Environment Variables**
```bash
# ใน Vercel Dashboard > Project Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://jpkzzovrrjrtchfdxdce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwa3p6b3ZycmpydGNoZmR4ZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzExODUsImV4cCI6MjA2OTcwNzE4NX0.AZ-o5950oVgxUVHhX82RmHH8-FwNNg8hjtGl6vKen_w
```

**Step 4: เสร็จ!**
- URL: `https://your-project.vercel.app`
- Deploy ใหม่อัตโนมัติทุกครั้งที่ push code

---

### 🔹 **Netlify (ทางเลือกที่ 2)**

#### 📋 **ขั้นตอน Deploy ใน Netlify**

**Step 1: Deploy**
1. ไปที่ [netlify.com](https://netlify.com)
2. "New site from Git"
3. เลือก GitHub repository
4. ตั้งค่า:
   - Build command: `npm run build`
   - Publish directory: `.next`

**Step 2: Environment Variables**
```bash
# Site Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

---

## 🛠️ **ไฟล์ที่เตรียมไว้แล้ว**

### ✅ **Configuration Files**
- `vercel.json` - Vercel optimization
- `netlify.toml` - Netlify configuration
- `.env.example` - Environment template
- `next.config.js` - Next.js configuration

### ✅ **Build Verification**
```bash
# ✅ Build ผ่านแล้ว
npm run build  # Success!
npm run lint   # No errors!
npm run test   # All tests pass!
```

---

## 🎯 **หลัง Deploy แล้ว**

### 🔍 **ตรวจสอบการทำงาน**
1. **เปิดเว็บไซต์** - โหลดได้หรือไม่
2. **ทดสอบหน้า Portfolio** - ภาพแสดงครบหรือไม่
3. **ทดสอบ Category Filter** - กรองได้หรือไม่
4. **ทดสอบ Modal** - คลิกภาพขยายได้หรือไม่
5. **ทดสอบ Mobile** - responsive หรือไม่

### 📊 **URLs สำคัญ**
```bash
# Production URLs
https://your-project.vercel.app/          # หน้าแรก
https://your-project.vercel.app/portfolio # ผลงาน
https://your-project.vercel.app/contact   # ติดต่อ
https://your-project.vercel.app/admin     # แอดมิน
```

---

## 🔄 **การอัปเดตหลัง Deploy**

### 📸 **เพิ่มภาพใหม่**

#### วิธีที่ 1: ผ่าน Git (แนะนำ)
```bash
# 1. เพิ่มภาพในโฟลเดอร์
public/image/01-weddings/new-wedding.jpg

# 2. อัปโหลดเข้า database
node admin-helper.js

# 3. Push ขึ้น Git
git add .
git commit -m "Add new wedding photos"
git push

# 4. Vercel deploy อัตโนมัติ!
```

#### วิธีที่ 2: ผ่าน Server (สำหรับ advanced users)
```bash
# SSH เข้า production server
ssh user@your-server.com

# รัน admin script
cd /path/to/project
node admin-helper.js
```

### 🎨 **แก้ไขเว็บไซต์**
```bash
# แก้ไขโค้ด
# commit & push
git add .
git commit -m "Update website design"
git push

# Deploy อัตโนมัติใน 1-2 นาที
```

---

## 🏆 **Performance Optimization**

### ⚡ **ที่ตั้งค่าไว้แล้ว**
- ✅ Image optimization (Next.js)
- ✅ CDN caching (Vercel/Netlify)
- ✅ Gzip compression
- ✅ Static generation
- ✅ Responsive images

### 📊 **Expected Performance**
- 🟢 **Page Load:** < 2 seconds
- 🟢 **Lighthouse Score:** 90+
- 🟢 **Mobile Score:** 85+
- 🟢 **SEO Score:** 90+

---

## 🚨 **Troubleshooting**

### ❌ **ปัญหาที่อาจเจอ**

**1. Build Failed**
```bash
# สาเหตุ: Node.js version
# แก้ไข: ใช้ Node.js 18+ ใน deployment platform
```

**2. Environment Variables Missing**
```bash
# สาเหตุ: ไม่ได้ตั้ง env vars
# แก้ไข: เพิ่มใน platform settings
```

**3. ภาพไม่แสดง**
```bash
# สาเหตุ: Path ผิด
# แก้ไข: ตรวจสอบ public/image/ structure
```

**4. Database Connection Error**
```bash
# สาเหตุ: Supabase keys ผิด
# แก้ไข: ตรวจสอบ environment variables
```

### ✅ **วิธีแก้ปัญหา**
1. ตรวจสอบ deployment logs
2. ตรวจสอบ environment variables
3. ตรวจสอบ build output
4. ติดต่อ support platform

---

## 🎊 **สรุป: Ready to Launch!**

### ✅ **เสร็จแล้ว**
- [x] ✅ Code ผ่าน TypeScript/ESLint
- [x] ✅ Build ผ่าน 100%
- [x] ✅ Tests ผ่านหมด
- [x] ✅ Environment setup
- [x] ✅ Deployment configs
- [x] ✅ Performance optimization
- [x] ✅ Documentation complete

### 🚀 **พร้อม Deploy**
```bash
# สั่งเลย!
git push origin main

# รอ 2-3 นาที เว็บไซต์ live!
# 🌐 https://your-project.vercel.app
```

---

**🎉 Fuzio Catering Portfolio - พร้อม Production!**

*อัพเดตล่าสุด: 5 สิงหาคม 2568*  
*สถานะ: 🟢 Production Ready*