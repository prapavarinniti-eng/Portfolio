import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: packages, error } = await supabase
      .from('service_packages')
      .select('*')
      .eq('is_active', true)
      .order('price_per_person', { ascending: true });

    if (error) {
      console.error('Error fetching service packages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch service packages' },
        { status: 500 }
      );
    }

    return NextResponse.json({ packages });

  } catch (error) {
    console.error('Service packages API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}