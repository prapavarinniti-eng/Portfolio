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

    // Try to insert into a simple table structure
    const { data, error } = await supabase
      .from('simple_bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // If table doesn't exist, create it and try again
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.log('Creating simple_bookings table...');
        
        // Create simple table without constraints
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS simple_bookings (
            id SERIAL PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            event_type TEXT NOT NULL,
            event_date TEXT NOT NULL,
            guest_count INTEGER DEFAULT 0,
            special_requests TEXT DEFAULT '',
            booking_reference TEXT UNIQUE NOT NULL,
            booking_status TEXT DEFAULT 'รอดำเนินการ',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `;
        
        // Try to create table (this might not work with regular client, but worth trying)
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableQuery });
        
        if (!createError) {
          // Try insert again
          const { data: retryData, error: retryError } = await supabase
            .from('simple_bookings')
            .insert([bookingData])
            .select()
            .single();
            
          if (!retryError && retryData) {
            return NextResponse.json({
              success: true,
              reference: retryData.booking_reference,
              message: 'การจองเสร็จสิ้น'
            });
          }
        }
      }
      
      // If all else fails, return error
      return NextResponse.json(
        { error: `เกิดข้อผิดพลาด: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reference: data.booking_reference,
      message: 'การจองเสร็จสิ้น'
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}

// GET method for admin to view bookings
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('simple_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'ไม่สามารถดึงข้อมูลการจองได้' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}