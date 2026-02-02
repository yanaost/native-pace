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

    // Test 1: Insert progress record
    const { data: inserted, error: insertError } = await supabase
      .from('user_pattern_progress')
      .insert({
        user_id: user.id,
        pattern_id: pattern.id,
        mastery_score: 50,
        times_practiced: 1,
        times_correct: 1,
        next_review_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: `Insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Test 2: Read progress record
    const { data: read, error: readError } = await supabase
      .from('user_pattern_progress')
      .select('*')
      .eq('id', inserted.id)
      .single();

    if (readError) {
      return NextResponse.json(
        { success: false, error: `Read failed: ${readError.message}` },
        { status: 500 }
      );
    }

    // Test 3: Update progress record
    const { data: updated, error: updateError } = await supabase
      .from('user_pattern_progress')
      .update({
        mastery_score: 75,
        times_practiced: 2,
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

    // Test 4: Delete progress record (cleanup)
    const { error: deleteError } = await supabase
      .from('user_pattern_progress')
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
      message: 'All user_pattern_progress RLS tests passed',
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
