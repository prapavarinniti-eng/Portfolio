import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - ดึงข้อมูลการจองทั้งหมด (สำหรับ Admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('booking_status', status);
    }

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bookings,
      totalCount: count,
      page,
      limit
    });

  } catch (error) {
    console.error('Bookings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - สร้างการจองใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'customerName',
      'customerPhone', 
      'customerEmail',
      'eventType',
      'eventDate',
      'eventTime',
      'guestCount',
      'serviceType',
      'budgetRange'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate booking reference
    const bookingReference = generateBookingReference();

    // Prepare booking data
    const bookingData = {
      // ข้อมูลลูกค้า
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      customer_email: body.customerEmail,
      
      // ข้อมูลงาน
      event_type: body.eventType,
      event_date: body.eventDate,
      event_time: body.eventTime,
      event_duration: body.eventDuration || 4,
      
      // สถานที่
      venue_type: body.venueType || 'customer_venue',
      venue_address: body.venueAddress || '',
      venue_details: body.venueDetails || '',
      
      // จำนวนคน
      guest_count: body.guestCount,
      
      // ประเภทบริการ
      service_type: body.serviceType,
      menu_preferences: body.menuPreferences || '',
      
      // งบประมาณ
      budget_range: body.budgetRange,
      
      // ความต้องการพิเศษ
      special_requests: body.specialRequests || '',
      dietary_requirements: body.dietaryRequirements || [],
      
      // อุปกรณ์เพิ่มเติม
      equipment_needed: body.equipmentNeeded || [],
      
      // ราคาประเมิน
      estimated_price: body.estimatedPrice || null,
      
      // การติดต่อ
      preferred_contact_method: body.preferredContactMethod || 'phone',
      
      // สถานะเริ่มต้น
      booking_status: 'pending',
      payment_status: 'unpaid',
      
      // รหัสการจอง
      booking_reference: bookingReference
    };

    // Insert into database
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Send confirmation email/SMS (optional)
    try {
      await sendBookingConfirmation(booking);
    } catch (notificationError) {
      console.warn('Failed to send booking confirmation:', notificationError);
      // Don't fail the booking creation for notification errors
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      bookingReference,
      booking
    });

  } catch (error) {
    console.error('Booking POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate booking reference
function generateBookingReference(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
  const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `FZ${dateStr}${randomStr}`;
}

// Helper function to send booking confirmation
async function sendBookingConfirmation(booking: any) {
  // TODO: Implement email/SMS confirmation
  // This could integrate with services like:
  // - SendGrid for email
  // - Twilio for SMS  
  // - Line Notify for Line messages
  
  console.log('Booking confirmation for:', booking.booking_reference);
  
  // Example of what you might send:
  const confirmationMessage = `
    ✅ การจองสำเร็จ!
    รหัสการจอง: ${booking.booking_reference}
    ชื่อผู้จอง: ${booking.customer_name}
    ประเภทงาน: ${booking.event_type}
    วันที่: ${booking.event_date}
    จำนวนแขก: ${booking.guest_count} คน
    
    เราจะติดต่อกลับภายใน 24 ชั่วโมง
    
    📞 081-514-6939
    📧 prapavarinniti@gmail.com
  `;
  
  // For now, just log the message
  // In production, you would send this via email/SMS
}