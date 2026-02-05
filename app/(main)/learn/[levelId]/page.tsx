'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { createClient } from '@/lib/supabase/client';
import { getLevelById, LevelNumber } from '@/lib/constants/levels';
import {
  canAccessLevel,
  findNextUnlearnedPattern,
  calculateCompletionPercentage,
  PatternWithProgress,
} from '@/lib/utils/level-access';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Progress from '@/components/ui/Progress';
import type { SubscriptionTier } from '@/types/user';

/**
 * Level detail page - shows patterns in a level with completion status
 */
export default function LevelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const levelId = parseInt(params.levelId as string, 10) as LevelNumber;

  const [patterns, setPatterns] = useState<PatternWithProgress[]>([]);
  const [_userTier, setUserTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const level = getLevelById(levelId);

  useEffect(() => {
    async function loadData() {
      if (!level) {
        setError('Level not found');
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      // Get user and profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      const tier = (profile?.subscription_tier as SubscriptionTier) || 'free';
      setUserTier(tier);

      // Check if user can access this level
      if (!canAccessLevel(level.accessTier, tier)) {
        setError('This level requires a premium subscription');
        setIsLoading(false);
        return;
      }

      // Fetch patterns for this level
      const { data: levelPatterns, error: patternsError } = await supabase
        .from('patterns')
        .select('id, title, order_index')
        .eq('level', levelId)
        .order('order_index', { ascending: true });

      if (patternsError) {
        setError('Failed to load patterns');
        setIsLoading(false);
        return;
      }

      // Fetch user's progress for these patterns
      const patternIds = levelPatterns?.map((p) => p.id) || [];
      const { data: progressData } = await supabase
        .from('user_pattern_progress')
        .select('pattern_id, mastery_score')
        .eq('user_id', user.id)
        .in('pattern_id', patternIds);

      // Combine patterns with progress
      const patternsWithProgress: PatternWithProgress[] = (levelPatterns || []).map((p) => {
        const progress = progressData?.find((prog) => prog.pattern_id === p.id);
        const masteryScore = progress?.mastery_score ?? 0;
        return {
          id: p.id,
          title: p.title,
          orderIndex: p.order_index,
          masteryScore,
          isCompleted: masteryScore >= 50,
        };
      });

      setPatterns(patternsWithProgress);
      setIsLoading(false);
    }

    loadData();
  }, [level, levelId, router]);

  const handleBack = () => {
    router.push('/learn');
  };

  const handlePatternClick = (patternId: string) => {
    router.push(`/practice?pattern=${patternId}`);
  };

  const handleContinue = () => {
    const nextPattern = findNextUnlearnedPattern(patterns);
    if (nextPattern) {
      router.push(`/practice?pattern=${nextPattern.id}`);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error || !level) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={handleBack} aria-label="Back to levels">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Error</Typography>
        </Box>
        <Typography color="error">{error || 'Level not found'}</Typography>
        <Button variant="outline" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Levels
        </Button>
      </Container>
    );
  }

  const completionPercent = calculateCompletionPercentage(patterns);
  const completedCount = patterns.filter((p) => p.isCompleted).length;
  const nextPattern = findNextUnlearnedPattern(patterns);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <IconButton onClick={handleBack} aria-label="Back to levels">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Level {level.id}: {level.name}
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, ml: 6 }}>
        {level.description}
      </Typography>

      {/* Progress Card */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Progress</Typography>
          <Typography variant="body2" color="text.secondary">
            {completedCount}/{patterns.length} patterns
          </Typography>
        </Box>

        <Progress
          value={completionPercent}
          showPercentage
          color={completionPercent === 100 ? 'success' : 'primary'}
        />

        {nextPattern && (
          <Button
            variant="primary"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={handleContinue}
            sx={{ mt: 2, width: '100%' }}
          >
            Continue Learning
          </Button>
        )}

        {completionPercent === 100 && (
          <Typography
            variant="body1"
            color="success.main"
            sx={{ mt: 2, textAlign: 'center' }}
          >
            Level Complete!
          </Typography>
        )}
      </Card>

      {/* Pattern List */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Patterns
      </Typography>

      <Card padding="none">
        <List disablePadding>
          {patterns.map((pattern, index) => (
            <ListItem
              key={pattern.id}
              disablePadding
              divider={index < patterns.length - 1}
            >
              <ListItemButton onClick={() => handlePatternClick(pattern.id)}>
                <ListItemIcon>
                  {pattern.isCompleted ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <RadioButtonUncheckedIcon color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={pattern.title}
                  secondary={
                    pattern.masteryScore > 0
                      ? `${Math.round(pattern.masteryScore)}% mastered`
                      : 'Not started'
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Card>

      {patterns.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No patterns available for this level yet.
        </Typography>
      )}
    </Container>
  );
}
