import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range');

  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('price_data')
      .select('*')
      .order('time', { ascending: true });

    if (error) {
      throw error;
    }

    // Here you can implement logic to filter data based on the range
    // For now, we'll just return all data

    const candles = data.map((item) => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    const lines = data.map((item) => ({
      time: item.time,
      value: item.close,
    }));

    return NextResponse.json({ candles, lines });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}