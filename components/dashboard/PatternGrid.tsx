'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import {
  type CategoryGroup,
  type PatternGridItem,
  getLegendItems,
  countByMasteryLevel,
} from '@/lib/utils/pattern-grid-helpers';

/** Props for PatternGrid component */
export interface PatternGridProps {
  /** Category groups with pattern items */
  groups: CategoryGroup[];
  /** Optional title */
  title?: string;
}

/** Size of each pattern dot */
const DOT_SIZE = 12;
const DOT_GAP = 4;

/**
 * Displays a visual grid of patterns grouped by category, color-coded by mastery.
 */
export default function PatternGrid({
  groups,
  title = 'Pattern Progress',
}: PatternGridProps) {
  const legendItems = getLegendItems();

  // Count all patterns across groups
  const allPatterns = groups.flatMap((g) => g.patterns);
  const counts = countByMasteryLevel(allPatterns);
  const totalPatterns = allPatterns.length;

  if (totalPatterns === 0) {
    return (
      <Box>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No patterns available yet. Start learning to see your progress!
        </Typography>
      </Box>
    );
  }

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
          {counts.mastered} / {totalPatterns} mastered
        </Typography>
      </Box>

      {/* Legend */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        {legendItems.map((item) => (
          <Box
            key={item.level}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: '2px',
                bgcolor: item.color,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Category Groups */}
      {groups.map((group) => (
        <Box key={group.category} sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
            {group.displayName}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: `${DOT_GAP}px`,
            }}
          >
            {group.patterns.map((pattern) => (
              <PatternDot key={pattern.patternId} pattern={pattern} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Single pattern dot with tooltip.
 */
function PatternDot({ pattern }: { pattern: PatternGridItem }) {
  const tooltipText = `${pattern.masteryScore}% mastery`;

  return (
    <Tooltip title={tooltipText} arrow placement="top">
      <Box
        sx={{
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: '2px',
          bgcolor: pattern.color,
          cursor: 'pointer',
          transition: 'transform 0.1s',
          '&:hover': {
            transform: 'scale(1.3)',
          },
        }}
        role="img"
        aria-label={tooltipText}
      />
    </Tooltip>
  );
}
