const cron = require('node-cron');
const https = require('https');
const http = require('http');

const SITE_URL = process.env.SITE_URL || 'https://your-app.onrender.com';

function pingWebsite() {
  const url = new URL(SITE_URL);
  const client = url.protocol === 'https:' ? https : http;
  
  const timestamp = new Date().toLocaleString('th-TH');
  console.log(`🔔 [${timestamp}] Pinging ${SITE_URL}`);
  
  const req = client.get(SITE_URL, (res) => {
    console.log(`✅ [${timestamp}] Success - Status: ${res.statusCode}`);
  });
  
  req.on('error', (error) => {
    console.log(`❌ [${timestamp}] Error: ${error.message}`);
  });
  
  req.setTimeout(15000, () => {
    req.destroy();
    console.log(`⏰ [${timestamp}] Timeout`);
  });
}

// กำหนดเวลา ping
function setupCronJobs() {
  console.log('⏰ Setting up cron jobs...');
  
  // Ping ทุก 10 นาที
  cron.schedule('*/10 * * * *', () => {
    pingWebsite();
  });
  
  // Log status ทุกชั่วโมง
  cron.schedule('0 * * * *', () => {
    console.log(`📊 Keep-alive service running - ${new Date().toLocaleString('th-TH')}`);
  });
  
  console.log('✅ Cron jobs scheduled');
  console.log('📍 Target:', SITE_URL);
  console.log('⏱️  Schedule: Every 10 minutes');
}

if (process.env.NODE_ENV === 'production') {
  setupCronJobs();
  // Ping ทันทีเมื่อเริ่ม
  setTimeout(pingWebsite, 5000);
} else {
  console.log('🔧 Cron keep-alive disabled in development');
}

module.exports = { setupCronJobs, pingWebsite };