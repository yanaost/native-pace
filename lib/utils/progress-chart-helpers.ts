/**
 * Progress Chart Helpers
 *
 * Pure utility functions for generating chart data from practice records.
 */

/** Data point for the chart */
export interface ChartDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  label: string; // Display label (e.g., "Mon")
  value: number; // Practice count for the day
}

/** Chart configuration */
export interface ChartConfig {
  maxHeight: number;
  barWidth: number;
  barGap: number;
}

/** Default chart configuration */
export const DEFAULT_CHART_CONFIG: ChartConfig = {
  maxHeight: 100,
  barWidth: 30,
  barGap: 8,
};

/**
 * Normalizes a date to midnight UTC (YYYY-MM-DD format).
 *
 * @param date - Date to normalize
 * @returns ISO date string (YYYY-MM-DD)
 */
export function normalizeDateToDay(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Gets an array of dates for the last N days.
 *
 * @param days - Number of days to include
 * @param referenceDate - End date (defaults to today)
 * @returns Array of ISO date strings, oldest first
 */
export function getLastNDays(days: number, referenceDate: Date = new Date()): string[] {
  const dates: string[] = [];
  const refDateNormalized = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate()
    )
  );

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(refDateNormalized);
    date.setUTCDate(date.getUTCDate() - i);
    dates.push(normalizeDateToDay(date));
  }

  return dates;
}

/**
 * Gets short day name for a date.
 *
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Short day name (Mon, Tue, etc.)
 */
export function getDayLabel(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

/**
 * Groups records by date.
 *
 * @param records - Array of records with a date field
 * @param dateExtractor - Function to extract date from record
 * @returns Map of date string to count
 */
export function groupByDay<T>(
  records: T[],
  dateExtractor: (record: T) => string | Date | null
): Map<string, number> {
  const groups = new Map<string, number>();

  for (const record of records) {
    const dateValue = dateExtractor(record);
    if (dateValue === null) continue;

    const dateString =
      typeof dateValue === 'string'
        ? normalizeDateToDay(new Date(dateValue))
        : normalizeDateToDay(dateValue);

    groups.set(dateString, (groups.get(dateString) ?? 0) + 1);
  }

  return groups;
}

/**
 * Creates chart data for the last 7 days.
 *
 * @param dailyCounts - Map of date string to count
 * @param referenceDate - Reference date for "today"
 * @returns Array of chart data points
 */
export function createWeeklyChartData(
  dailyCounts: Map<string, number>,
  referenceDate: Date = new Date()
): ChartDataPoint[] {
  const days = getLastNDays(7, referenceDate);

  return days.map((date) => ({
    date,
    label: getDayLabel(date),
    value: dailyCounts.get(date) ?? 0,
  }));
}

/**
 * Gets the maximum value from chart data.
 *
 * @param data - Array of chart data points
 * @returns Maximum value, or 1 if all values are 0
 */
export function getChartMaxValue(data: ChartDataPoint[]): number {
  const max = Math.max(...data.map((d) => d.value));
  return max > 0 ? max : 1;
}

/**
 * Calculates bar height for SVG rendering.
 *
 * @param value - Value for this bar
 * @param maxValue - Maximum value in dataset
 * @param maxHeight - Maximum bar height in pixels
 * @returns Bar height in pixels
 */
export function calculateBarHeight(
  value: number,
  maxValue: number,
  maxHeight: number
): number {
  if (maxValue <= 0) return 0;
  if (value <= 0) return 0;
  return Math.round((value / maxValue) * maxHeight);
}

/**
 * Calculates total chart width.
 *
 * @param dataPointCount - Number of data points
 * @param config - Chart configuration
 * @returns Total width in pixels
 */
export function calculateChartWidth(
  dataPointCount: number,
  config: ChartConfig = DEFAULT_CHART_CONFIG
): number {
  if (dataPointCount <= 0) return 0;
  return dataPointCount * config.barWidth + (dataPointCount - 1) * config.barGap;
}

/**
 * Calculates x position for a bar.
 *
 * @param index - Bar index (0-based)
 * @param config - Chart configuration
 * @returns X position in pixels
 */
export function calculateBarX(
  index: number,
  config: ChartConfig = DEFAULT_CHART_CONFIG
): number {
  return index * (config.barWidth + config.barGap);
}

/**
 * Checks if there's any practice data.
 *
 * @param data - Array of chart data points
 * @returns True if at least one day has practice
 */
export function hasAnyPractice(data: ChartDataPoint[]): boolean {
  return data.some((d) => d.value > 0);
}

/**
 * Gets a summary of the week's practice.
 *
 * @param data - Array of chart data points
 * @returns Summary string (e.g., "15 exercises this week")
 */
export function getWeeklySummary(data: ChartDataPoint[]): string {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return 'No practice this week';
  }
  if (total === 1) {
    return '1 exercise this week';
  }
  return `${total} exercises this week`;
}
