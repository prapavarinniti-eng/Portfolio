import { NextRequest, NextResponse } from 'next/server';

// Endpoint สำหรับ keep-alive ping
export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  
  console.log(`🏓 Keep-alive ping received - ${timestamp}`);
  console.log(`👤 User-Agent: ${userAgent}`);
  
  // ข้อมูล server status
  const status = {
    alive: true,
    timestamp,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV,
    version: process.version
  };
  
  return NextResponse.json({
    status: 'alive',
    message: 'Server is awake and running',
    data: status,
    ping: 'pong'
  });
}

// สำหรับ POST requests (optional)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 Keep-alive POST:', body);
    
    return NextResponse.json({
      status: 'received',
      timestamp: new Date().toISOString(),
      received: body
    });
  } catch {
    return NextResponse.json({
      status: 'error',
      message: 'Invalid JSON body'
    }, { status: 400 });
  }
}