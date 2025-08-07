import { NextRequest, NextResponse } from 'next/server';

// Simple booking data storage
const bookings: any[] = [];

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
        { error: `กรุณากรอกข้อมูลให้ครบถ้วน: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Create booking record
    const booking = {
      id: Date.now(),
      reference: generateReference(),
      name: body.name,
      phone: body.phone,
      email: body.email,
      eventType: body.eventType,
      eventDate: body.eventDate,
      guestCount: body.guestCount,
      location: body.location || '',
      details: body.details || '',
      status: 'รอติดต่อ',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
    };

    // Store booking (in production, this would go to database)
    bookings.push(booking);
    
    // Log for admin to see
    console.log('\n🎉 NEW BOOKING RECEIVED!');
    console.log('====================================');
    console.log(`📋 Reference: ${booking.reference}`);
    console.log(`👤 Name: ${booking.name}`);
    console.log(`📞 Phone: ${booking.phone}`);
    console.log(`📧 Email: ${booking.email}`);
    console.log(`🎉 Event: ${booking.eventType}`);
    console.log(`📅 Date: ${booking.eventDate}`);
    console.log(`👥 Guests: ${booking.guestCount}`);
    console.log(`📍 Location: ${booking.location}`);
    console.log(`💬 Details: ${booking.details}`);
    console.log(`⏰ Submitted: ${booking.submittedAt}`);
    console.log('====================================\n');
    
    // Return success with booking details
    return NextResponse.json({
      success: true,
      reference: booking.reference,
      booking: {
        reference: booking.reference,
        name: booking.name,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        guestCount: booking.guestCount
      },
      message: 'บันทึกข้อมูลเรียบร้อย! เราจะติดต่อกลับภายใน 2 ชั่วโมง'
    });

  } catch (error) {
    console.error('❌ Booking form error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่' },
      { status: 500 }
    );
  }
}

// GET method to view all bookings (for admin)
export async function GET() {
  return NextResponse.json({ 
    bookings: bookings.length > 0 ? bookings : [],
    total: bookings.length,
    message: bookings.length > 0 ? 'มีข้อมูลการจอง' : 'ยังไม่มีข้อมูลการจอง'
  });
}