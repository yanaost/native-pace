'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@/components/ui/Card';
import {
  formatStreakText,
  getStreakMotivationMessage,
} from '@/lib/utils/streak-helpers';
import {
  getStreakEmoji,
  shouldShowLongestStreak,
  shouldShowNewRecordBadge,
} from '@/lib/utils/streak-card-helpers';

/** Props for StreakCard component */
export interface StreakCardProps {
  /** Current streak count in days */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak?: number;
  /** Whether the current streak is a new personal record */
  isNewRecord?: boolean;
}

/**
 * Displays the user's practice streak with visual indicator.
 * Uses fire emoji to represent the streak visually.
 */
export default function StreakCard({
  currentStreak,
  longestStreak,
  isNewRecord = false,
}: StreakCardProps) {
  const streakText = formatStreakText(currentStreak);
  const motivationMessage = getStreakMotivationMessage(currentStreak, isNewRecord);
  const emoji = getStreakEmoji(currentStreak);
  const showLongestStreak = shouldShowLongestStreak(currentStreak, longestStreak);
  const showNewRecordBadge = shouldShowNewRecordBadge(isNewRecord, currentStreak);

  return (
    <Card>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* Fire emoji as visual indicator */}
        <Box
          sx={{
            fontSize: 48,
            lineHeight: 1,
          }}
          role="img"
          aria-label="streak indicator"
        >
          {emoji}
        </Box>

        {/* Streak info */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {streakText}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {motivationMessage}
          </Typography>

          {showLongestStreak && (
            <Typography variant="caption" color="text.secondary">
              Best: {longestStreak} days
            </Typography>
          )}
        </Box>

        {/* New record badge */}
        {showNewRecordBadge && (
          <Box
            sx={{
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            NEW RECORD!
          </Box>
        )}
      </Box>
    </Card>
  );
}
