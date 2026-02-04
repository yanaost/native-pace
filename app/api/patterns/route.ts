import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/utils/logger';
import {
  parseQueryParams,
  type PatternsResponse,
} from '@/lib/api/patterns-helpers';

const logger = createLogger('api/patterns');

/**
 * GET /api/patterns
 *
 * Fetch patterns with optional filtering and pagination.
 *
 * Query Parameters:
 * - level: Filter by level (1-6)
 * - category: Filter by category (weak-forms, reductions, etc.)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest): Promise<NextResponse<PatternsResponse>> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const { level, category, page, limit, errors } = parseQueryParams(searchParams);

    // Return validation errors
    if (errors.length > 0) {
      logger.warn('Invalid query parameters', { errors });
      return NextResponse.json(
        { success: false, error: errors.join('; ') },
        { status: 400 }
      );
    }

    logger.info('Fetching patterns', { level, category, page, limit });

    const supabase = await createClient();

    // Build count query (for pagination)
    let countQuery = supabase
      .from('patterns')
      .select('*', { count: 'exact', head: true });

    if (level !== null) {
      countQuery = countQuery.eq('level', level);
    }
    if (category !== null) {
      countQuery = countQuery.eq('category', category);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      logger.error('Failed to count patterns', countError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch patterns' },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Build data query
    let dataQuery = supabase
      .from('patterns')
      .select('*')
      .order('level', { ascending: true })
      .order('order_index', { ascending: true })
      .range(offset, offset + limit - 1);

    if (level !== null) {
      dataQuery = dataQuery.eq('level', level);
    }
    if (category !== null) {
      dataQuery = dataQuery.eq('category', category);
    }

    const { data: patterns, error: dataError } = await dataQuery;

    if (dataError) {
      logger.error('Failed to fetch patterns', dataError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch patterns' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logger.info('Patterns fetched successfully', {
      count: patterns?.length ?? 0,
      total,
      duration,
    });

    return NextResponse.json({
      success: true,
      data: {
        patterns: patterns ?? [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    logger.error('Unexpected error fetching patterns', error as Error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
