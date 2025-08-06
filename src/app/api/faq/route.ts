import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      faqs: data || []
    });

  } catch (error) {
    console.error('GET FAQ error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล FAQ' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, category, display_order } = body;

    // Validate required fields
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'กรุณากรอกคำถามและคำตอบ' },
        { status: 400 }
      );
    }

    // Insert new FAQ
    const { data, error } = await supabase
      .from('faq')
      .insert({
        question: question.trim(),
        answer: answer.trim(),
        category: category || 'general',
        display_order: display_order || 0,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'เพิ่ม FAQ สำเร็จ',
      data
    });

  } catch (error) {
    console.error('POST FAQ error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดของระบบ' },
      { status: 500 }
    );
  }
}