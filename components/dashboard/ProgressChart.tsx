'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  type ChartDataPoint,
  getChartMaxValue,
  calculateBarHeight,
  calculateChartWidth,
  calculateBarX,
  hasAnyPractice,
  getWeeklySummary,
  DEFAULT_CHART_CONFIG,
} from '@/lib/utils/progress-chart-helpers';

/** Props for ProgressChart component */
export interface ProgressChartProps {
  /** Chart data points (7 days) */
  data: ChartDataPoint[];
  /** Chart title */
  title?: string;
}

/** Chart dimensions */
const CHART_HEIGHT = 120;
const LABEL_HEIGHT = 24;
const PADDING = 16;

/**
 * Displays a weekly practice bar chart using SVG.
 */
export default function ProgressChart({
  data,
  title = 'This Week',
}: ProgressChartProps) {
  const maxValue = getChartMaxValue(data);
  const chartWidth = calculateChartWidth(data.length);
  const hasPractice = hasAnyPractice(data);
  const summary = getWeeklySummary(data);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {summary}
        </Typography>
      </Box>

      {/* Chart */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <svg
          width={chartWidth + PADDING * 2}
          height={CHART_HEIGHT + LABEL_HEIGHT}
          role="img"
          aria-label={`Weekly practice chart: ${summary}`}
        >
          <g transform={`translate(${PADDING}, 0)`}>
            {data.map((point, index) => {
              const barHeight = calculateBarHeight(
                point.value,
                maxValue,
                CHART_HEIGHT - 10
              );
              const x = calculateBarX(index);
              const y = CHART_HEIGHT - barHeight;

              return (
                <g key={point.date}>
                  {/* Bar background */}
                  <rect
                    x={x}
                    y={10}
                    width={DEFAULT_CHART_CONFIG.barWidth}
                    height={CHART_HEIGHT - 10}
                    fill="#f3f4f6"
                    rx={4}
                  />

                  {/* Bar value */}
                  {point.value > 0 && (
                    <rect
                      x={x}
                      y={y}
                      width={DEFAULT_CHART_CONFIG.barWidth}
                      height={barHeight}
                      fill="#3b82f6"
                      rx={4}
                    />
                  )}

                  {/* Value label (shown on hover or always for non-zero) */}
                  {point.value > 0 && (
                    <text
                      x={x + DEFAULT_CHART_CONFIG.barWidth / 2}
                      y={y - 4}
                      textAnchor="middle"
                      fontSize={10}
                      fill="#6b7280"
                    >
                      {point.value}
                    </text>
                  )}

                  {/* Day label */}
                  <text
                    x={x + DEFAULT_CHART_CONFIG.barWidth / 2}
                    y={CHART_HEIGHT + 16}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#6b7280"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </Box>

      {/* Empty state message */}
      {!hasPractice && (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mt: 1 }}
        >
          Start practicing to see your progress!
        </Typography>
      )}
    </Box>
  );
}
