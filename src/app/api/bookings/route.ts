import { NextRequest, NextResponse } from 'next/server';

// Generate booking reference
function generateReference(): string {
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FZ${date}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ['name', 'phone', 'email', 'eventType', 'eventDate', 'guestCount'];
    const missing = required.filter(field => !body[field]);
    
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Create booking data
    const bookingData = {
      reference: generateReference(),
      name: body.name,
      phone: body.phone,
      email: body.email,
      eventType: body.eventType,
      eventDate: body.eventDate,
      guestCount: parseInt(body.guestCount) || 0,
      details: body.details || '',
      timestamp: new Date().toISOString()
    };

    // Log booking for now (can add email/database later)
    console.log('📋 New booking request:', JSON.stringify(bookingData, null, 2));
    
    // Return success
    return NextResponse.json({
      success: true,
      reference: bookingData.reference,
      message: 'การจองเสร็จสิ้น! เราจะติดต่อกลับภายใน 24 ชั่วโมง'
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการส่งข้อมูล' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Booking API is working',
    message: 'POST to this endpoint with booking data'
  });
}