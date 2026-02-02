import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Query patterns (no auth required - public content)
    const { data: patterns, error: patternsError } = await supabase
      .from('patterns')
      .select('*')
      .order('level')
      .order('order_index')
      .limit(10);

    if (patternsError) {
      return NextResponse.json(
        { success: false, error: patternsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Patterns table accessible',
      count: patterns?.length ?? 0,
      patterns,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
