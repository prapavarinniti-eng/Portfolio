# 🚀 Render Deployment Guide สำหรับ Fuzio Catering

## 📋 ขั้นตอนการ Deploy ไป Render

### 1. เตรียม Repository
1. Push code ไป GitHub
2. ตรวจสอบว่ามีไฟล์ทั้งหมดครบ:
   - `package.json`
   - `next.config.js` (ถ้ามี)
   - `src/` folder
   - `.env.example` (ไม่ใส่ค่าจริง)

### 2. สมัครและเชื่อม GitHub
1. ไปที่ **https://render.com**
2. คลิก **"Get Started for Free"**
3. Login ด้วย GitHub account
4. Allow Render access to repositories

### 3. สร้าง Web Service
1. คลิก **"New +"** → **"Web Service"**
2. เลือก repository `catering-portfolio`
3. กรอกข้อมูล:
   - **Name**: `fuzio-catering-portfolio`
   - **Environment**: `Node`
   - **Region**: `Singapore` (ใกล้ไทยที่สุด)
   - **Branch**: `main` หรือ `master`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 4. ตั้งค่า Environment Variables
ใน Render Dashboard → Environment:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration  
SITE_URL=https://fuzio-catering-portfolio.onrender.com
NEXT_PUBLIC_SITE_URL=https://fuzio-catering-portfolio.onrender.com

# Environment
NODE_ENV=production

# Keep-Alive (Optional)
ENABLE_KEEPALIVE=true
```

### 5. Advanced Settings
```bash
# Build Settings
Build Command: npm ci && npm run build
Start Command: npm start

# Health Check
Health Check Path: /api/keepalive

# Auto-Deploy
Auto-Deploy: Yes (เมื่อ push ไป GitHub)
```

## 🔧 Render Configuration Files

### สร้าง `render.yaml` (Optional)
```yaml
services:
  - type: web
    name: fuzio-catering-portfolio
    env: node
    plan: free
    buildCommand: npm ci && npm run build
    startCommand: npm start
    healthCheckPath: /api/keepalive
    envVars:
      - key: NODE_ENV
        value: production
      - key: SITE_URL
        generateValue: true
```

### อัพเดท `package.json` engines
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

## 📂 File Structure ที่ Render ต้องการ

```
catering-portfolio/
├── package.json          ✅ มี build & start scripts
├── src/                  ✅ Next.js app
├── public/               ✅ Static files
├── .env.example          ✅ Environment template
├── RENDER-DEPLOYMENT.md  ✅ Deployment guide
├── UPTIMEROBOT-SETUP.md  ✅ Monitoring guide
└── README.md             ✅ Project documentation
```

## 🎯 URLs หลังจาก Deploy

### Production URLs:
- **Main Site**: `https://fuzio-catering-portfolio.onrender.com`
- **Admin Panel**: `https://fuzio-catering-portfolio.onrender.com/admin`
- **Portfolio**: `https://fuzio-catering-portfolio.onrender.com/portfolio`
- **Keep-Alive API**: `https://fuzio-catering-portfolio.onrender.com/api/keepalive`

## ⚡ Performance Settings

### Render Free Plan ข้อจำกัด:
- **Sleep after 15 mins** idle → ใช้ UptimeRobot แก้
- **750 hours/month** → เพียงพอสำหรับ 24/7
- **500MB RAM** → เพียงพอสำหรับ Next.js
- **0.1 CPU** → เพียงพอสำหรับ portfolio site

### การ Optimize:
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // สำหรับ Render
  },
  experimental: {
    outputFileTracingRoot: __dirname,
  }
}

module.exports = nextConfig
```

## 🔍 การ Debug และ Monitor

### Render Dashboard:
1. **Logs** - ดู build & runtime logs
2. **Metrics** - CPU, Memory usage
3. **Events** - Deploy history
4. **Settings** - Environment vars

### การแก้ปัญหา:
```bash
# ดู logs แบบ real-time
Render Dashboard → Service → Logs → Live tail

# ตรวจสอบ health check
curl https://your-app.onrender.com/api/keepalive

# ตรวจสอบ main site
curl https://your-app.onrender.com
```

## 📝 Deployment Checklist

### Pre-Deploy:
- [ ] Code pushed to GitHub
- [ ] Environment variables ready
- [ ] Supabase database configured
- [ ] Build scripts tested locally

### During Deploy:
- [ ] Repository connected to Render
- [ ] Environment variables set
- [ ] Build command configured
- [ ] Health check path set

### Post-Deploy:
- [ ] Site loads correctly
- [ ] Admin panel accessible
- [ ] Portfolio gallery works
- [ ] Database connection works
- [ ] UptimeRobot configured
- [ ] Email alerts tested

## 🎉 Go Live!

### Final Steps:
1. **Test all features** - upload, delete, edit images
2. **Setup UptimeRobot** - prevent sleep
3. **Share URL** - `https://fuzio-catering-portfolio.onrender.com`
4. **Monitor performance** - first 24 hours

### Success Indicators:
- ✅ Site loads < 3 seconds
- ✅ Admin functions work
- ✅ Images display properly
- ✅ No sleep issues (with UptimeRobot)
- ✅ Email alerts working

## 🆘 Emergency Procedures

### If Site Goes Down:
1. Check Render logs
2. Check UptimeRobot alerts
3. Verify environment variables
4. Use CLI admin tools as backup

### CLI Backup Commands:
```bash
npm run admin:stats    # Check database
npm run admin:upload   # Emergency upload
npm run admin:help     # See all commands
```

เสร็จแล้ว! 🎊 Fuzio Catering Portfolio พร้อมใช้งานแบบ production!