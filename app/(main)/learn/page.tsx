'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import { createClient } from '@/lib/supabase/client';
import { LEVELS, Level, isLevelPremium } from '@/lib/constants/levels';
import { canAccessLevel, getLevelPatternCount } from '@/lib/utils/level-access';
import Card from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';
import type { SubscriptionTier } from '@/types/user';

/** Props for the LevelCard component */
export interface LevelCardProps {
  level: Level;
  isLocked: boolean;
  isPremium: boolean;
  progress: number;
  patternsCompleted: number;
  totalPatterns: number;
  onClick: () => void;
}

/**
 * Card component for displaying a level
 */
export function LevelCard({
  level,
  isLocked,
  isPremium,
  progress,
  patternsCompleted,
  totalPatterns,
  onClick,
}: LevelCardProps) {
  return (
    <Card
      sx={{
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked ? 0.7 : 1,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': isLocked
          ? {}
          : {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
      }}
      onClick={isLocked ? undefined : onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="h6" component="h2">
          Level {level.id}: {level.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isPremium && (
            <Chip
              icon={<StarIcon />}
              label="Premium"
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
          {isLocked && (
            <LockIcon color="action" fontSize="small" />
          )}
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {level.description}
      </Typography>

      <Progress
        value={progress}
        label={`${patternsCompleted}/${totalPatterns} patterns`}
        showPercentage
        color={progress === 100 ? 'success' : 'primary'}
      />
    </Card>
  );
}

/**
 * Learn index page - displays all levels with progress
 */
export default function LearnPage() {
  const router = useRouter();
  const [userTier, setUserTier] = useState<SubscriptionTier>('free');
  const [levelProgress, setLevelProgress] = useState<Record<number, { completed: number; total: number }>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // Get user profile for subscription tier
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserTier(profile.subscription_tier as SubscriptionTier);
        }

        // Get user's pattern progress
        const { data: progress } = await supabase
          .from('user_pattern_progress')
          .select('pattern_id, mastery_score')
          .eq('user_id', user.id);

        if (progress) {
          // Get all patterns to map progress to levels
          const { data: patterns } = await supabase
            .from('patterns')
            .select('id, level, order_index');

          if (patterns) {
            // Calculate progress per level
            const progressByLevel: Record<number, { completed: number; total: number }> = {};

            LEVELS.forEach((level) => {
              const levelPatterns = patterns.filter((p) => p.level === level.id);
              const completedPatterns = levelPatterns.filter((p) =>
                progress.some((prog) => prog.pattern_id === p.id && prog.mastery_score >= 50)
              );

              progressByLevel[level.id] = {
                completed: completedPatterns.length,
                total: getLevelPatternCount(level),
              };
            });

            setLevelProgress(progressByLevel);
          }
        }
      }

      setIsLoading(false);
    }

    loadData();
  }, []);

  const handleLevelClick = (levelId: number) => {
    router.push(`/learn/${levelId}`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Learn
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Master connected speech patterns level by level
      </Typography>

      <Grid container spacing={3}>
        {LEVELS.map((level) => {
          const isPremium = isLevelPremium(level.id);
          const isLocked = !canAccessLevel(level.accessTier, userTier);
          const progress = levelProgress[level.id] || { completed: 0, total: getLevelPatternCount(level) };
          const progressPercent = progress.total > 0
            ? (progress.completed / progress.total) * 100
            : 0;

          return (
            <Grid size={{ xs: 12, sm: 6 }} key={level.id}>
              <LevelCard
                level={level}
                isLocked={isLocked}
                isPremium={isPremium}
                progress={progressPercent}
                patternsCompleted={progress.completed}
                totalPatterns={progress.total}
                onClick={() => handleLevelClick(level.id)}
              />
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
