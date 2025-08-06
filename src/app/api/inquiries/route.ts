import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, eventType, message } = body;

    // Validate required fields
    if (!name || !phone || !email || !eventType || !message) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'รูปแบบอีเมลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Validate phone format (Thai phone number)
    const phoneRegex = /^[0-9]{10}$|^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    const cleanPhone = phone.replace(/[-\s]/g, '');
    if (!phoneRegex.test(cleanPhone) && cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Insert inquiry into database
    const { data, error } = await supabase
      .from('customer_inquiries')
      .insert({
        name: name.trim(),
        phone: cleanPhone,
        email: email.toLowerCase().trim(),
        event_type: eventType,
        message: message.trim(),
        status: 'new',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ส่งข้อความสำเร็จ เราจะติดต่อกลับภายใน 24 ชั่วโมง',
      data: {
        id: data.id,
        created_at: data.created_at
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');

  try {
    let query = supabase
      .from('customer_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      inquiries: data || [],
      totalCount: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('GET inquiries error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}