import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - ดึงข้อมูลการจองตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      
      console.error('Error fetching booking:', error);
      return NextResponse.json(
        { error: 'Failed to fetch booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking });

  } catch (error) {
    console.error('Booking GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - อัปเดตข้อมูลการจอง (สำหรับ Admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Define allowed fields for update
    const allowedFields = [
      'booking_status',
      'payment_status',
      'final_price',
      'deposit_amount',
      'admin_notes',
      'special_requests',
      'venue_address',
      'venue_details'
    ];

    // Filter only allowed fields
    const updateData = Object.keys(body)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = body[key];
        return obj;
      }, {});

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    // Send status update notification if booking status changed
    if (updateData.booking_status) {
      try {
        await sendStatusUpdateNotification(booking, updateData.booking_status);
      } catch (notificationError) {
        console.warn('Failed to send status update notification:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking
    });

  } catch (error) {
    console.error('Booking PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - ลบการจอง (สำหรับ Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting booking:', error);
      return NextResponse.json(
        { error: 'Failed to delete booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Booking DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to send status update notification
async function sendStatusUpdateNotification(booking: any, newStatus: string) {
  const statusMessages: Record<string, string> = {
    confirmed: `✅ การจองของคุณได้รับการยืนยันแล้ว! รหัสการจอง: ${booking.booking_reference}`,
    cancelled: `❌ การจองของคุณถูกยกเลิก รหัสการจอง: ${booking.booking_reference}`,
    completed: `🎉 งานของคุณเสร็จสิ้นแล้ว ขอบคุณที่ใช้บริการ รหัสการจอง: ${booking.booking_reference}`
  };

  const message = statusMessages[newStatus];
  if (message) {
    // TODO: Send notification via email/SMS/Line
    console.log('Status update notification:', message);
  }
}