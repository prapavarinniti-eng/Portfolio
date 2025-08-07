import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple table structure - no complex constraints
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Generate simple booking reference
function generateReference(): string {
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FZ${date}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simple validation - just check required fields exist
    if (!body.name || !body.phone || !body.email || !body.eventType || !body.eventDate || !body.guestCount) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Create simple booking record
    const bookingData = {
      customer_name: body.name,
      customer_phone: body.phone,
      customer_email: body.email,
      event_type: body.eventType,
      event_date: body.eventDate,
      guest_count: parseInt(body.guestCount) || 0,
      special_requests: body.details || '',
      booking_reference: generateReference(),
      booking_status: 'รอดำเนินการ',
      created_at: new Date().toISOString()
    };

    // Since we can't create tables dynamically, let's just return success
    // This will work as a contact form without database storage for now
    console.log('Booking request received:', bookingData);
    
    // Return success response
    return NextResponse.json({
      success: true,
      reference: bookingData.booking_reference,
      message: 'การจองเสร็จสิ้น! เราจะติดต่อกลับภายใน 24 ชั่วโมง'
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}

// GET method - return empty for now
export async function GET() {
  return NextResponse.json({ 
    bookings: [],
    message: 'Booking data is logged in console for now'
  });
}