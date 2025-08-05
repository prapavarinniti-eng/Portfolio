const https = require('https');
const http = require('http');

// ใส่ URL ของเว็บไซต์ที่ deploy แล้ว
const SITE_URL = process.env.SITE_URL || 'https://your-app.onrender.com';
const PING_INTERVAL = 14 * 60 * 1000; // 14 นาที (Render sleep หลัง 15 นาที)

function pingServer() {
  const url = new URL(SITE_URL);
  const client = url.protocol === 'https:' ? https : http;
  
  console.log(`🏓 Pinging ${SITE_URL} at ${new Date().toISOString()}`);
  
  const req = client.get(SITE_URL, (res) => {
    console.log(`✅ Ping successful - Status: ${res.statusCode}`);
  });
  
  req.on('error', (error) => {
    console.log(`❌ Ping failed: ${error.message}`);
  });
  
  req.setTimeout(10000, () => {
    req.destroy();
    console.log('⏰ Ping timeout');
  });
}

function startKeepAlive() {
  console.log('🚀 Keep-alive service started');
  console.log(`📍 Target: ${SITE_URL}`);
  console.log(`⏱️  Interval: ${PING_INTERVAL / 1000 / 60} minutes`);
  
  // Ping ทันทีเมื่อเริ่ม
  pingServer();
  
  // Ping ทุกๆ 14 นาที
  setInterval(pingServer, PING_INTERVAL);
}

// รันเฉพาะเมื่อไม่ใช่ development
if (process.env.NODE_ENV === 'production') {
  startKeepAlive();
} else {
  console.log('🔧 Keep-alive disabled in development mode');
}

module.exports = { startKeepAlive };