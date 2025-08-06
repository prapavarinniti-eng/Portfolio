import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['new', 'contacted', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'สถานะไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Update inquiry status
    const { data, error } = await supabase
      .from('customer_inquiries')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดของระบบ' },
      { status: 500 }
    );
  }
}