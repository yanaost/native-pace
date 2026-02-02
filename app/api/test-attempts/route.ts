import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get first pattern to test with
    const { data: pattern, error: patternError } = await supabase
      .from('patterns')
      .select('id')
      .limit(1)
      .single();

    if (patternError || !pattern) {
      return NextResponse.json(
        { success: false, error: 'No patterns found to test with' },
        { status: 500 }
      );
    }

    // Test 1: Insert attempt record
    const { data: inserted, error: insertError } = await supabase
      .from('exercise_attempts')
      .insert({
        user_id: user.id,
        pattern_id: pattern.id,
        exercise_type: 'comparison',
        is_correct: true,
        response_time_ms: 1500,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: `Insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Test 2: Read attempt record
    const { data: read, error: readError } = await supabase
      .from('exercise_attempts')
      .select('*')
      .eq('id', inserted.id)
      .single();

    if (readError) {
      return NextResponse.json(
        { success: false, error: `Read failed: ${readError.message}` },
        { status: 500 }
      );
    }

    // Test 3: Update attempt record
    const { data: updated, error: updateError } = await supabase
      .from('exercise_attempts')
      .update({
        is_correct: false,
        response_time_ms: 2000,
      })
      .eq('id', inserted.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: `Update failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Test 4: Delete attempt record (cleanup)
    const { error: deleteError } = await supabase
      .from('exercise_attempts')
      .delete()
      .eq('id', inserted.id);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: `Delete failed: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'All exercise_attempts RLS tests passed',
      tests: {
        insert: 'passed',
        read: 'passed',
        update: 'passed',
        delete: 'passed',
      },
      sampleData: {
        inserted,
        read,
        updated,
      },
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
