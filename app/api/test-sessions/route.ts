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

    // Test 1: Insert session record
    const { data: inserted, error: insertError } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: user.id,
        patterns_practiced: 3,
        exercises_completed: 10,
        correct_answers: 8,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: `Insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    // Test 2: Read session record
    const { data: read, error: readError } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('id', inserted.id)
      .single();

    if (readError) {
      return NextResponse.json(
        { success: false, error: `Read failed: ${readError.message}` },
        { status: 500 }
      );
    }

    // Test 3: Update session record (set ended_at)
    const { data: updated, error: updateError } = await supabase
      .from('practice_sessions')
      .update({
        ended_at: new Date().toISOString(),
        exercises_completed: 15,
        correct_answers: 12,
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

    // Test 4: Delete session record (cleanup)
    const { error: deleteError } = await supabase
      .from('practice_sessions')
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
      message: 'All practice_sessions RLS tests passed',
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
