'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import SchoolIcon from '@mui/icons-material/School';
import RefreshIcon from '@mui/icons-material/Refresh';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StreakCard from '@/components/dashboard/StreakCard';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { getDuePatternsCount } from '@/lib/utils/review-queue';
import { TOTAL_PATTERNS } from '@/lib/constants/levels';
import {
  groupByDay,
  createWeeklyChartData,
  type ChartDataPoint,
} from '@/lib/utils/progress-chart-helpers';
import {
  formatDashboardGreeting,
  calculateOverallProgress,
  getProgressDescription,
  getCurrentLevelInfo,
  getReviewSummaryText,
  getContinueLearningText,
  getLearnButtonText,
  hasCompletedAllPatterns,
} from '@/lib/utils/dashboard-helpers';

/** User profile data from database */
interface ProfileData {
  display_name: string | null;
  streak_current: number;
  streak_longest: number;
  last_practice_date: string | null;
}

/**
 * Dashboard page - main user landing page after login
 */
export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [patternsLearned, setPatternsLearned] = useState(0);
  const [reviewDueCount, setReviewDueCount] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);

    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('display_name, streak_current, streak_longest, last_practice_date')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch patterns learned count (distinct patterns with progress)
    const { count: learnedCount } = await supabase
      .from('user_pattern_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setPatternsLearned(learnedCount ?? 0);

    // Fetch due patterns count
    const dueCount = await getDuePatternsCount(supabase, user.id);
    setReviewDueCount(dueCount);

    // Fetch exercise attempts for last 7 days for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: attempts } = await supabase
      .from('exercise_attempts')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    const dailyCounts = groupByDay(attempts ?? [], (a) => a.created_at);
    const weeklyData = createWeeklyChartData(dailyCounts);
    setChartData(weeklyData);

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleContinueLearning = useCallback(() => {
    const levelInfo = getCurrentLevelInfo(patternsLearned);
    if (levelInfo) {
      router.push(`/learn/${levelInfo.levelId}`);
    } else {
      router.push('/learn');
    }
  }, [router, patternsLearned]);

  const handleStartReview = useCallback(() => {
    router.push('/review');
  }, [router]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  const greeting = formatDashboardGreeting(profile?.display_name ?? null);
  const progressPercent = calculateOverallProgress(patternsLearned, TOTAL_PATTERNS);
  const progressText = getProgressDescription(patternsLearned, TOTAL_PATTERNS);
  const levelInfo = getCurrentLevelInfo(patternsLearned);
  const reviewText = getReviewSummaryText(reviewDueCount);
  const continueText = getContinueLearningText(patternsLearned);
  const buttonText = getLearnButtonText(patternsLearned);
  const isAllComplete = hasCompletedAllPatterns(patternsLearned);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Greeting */}
      <Typography variant="h4" component="h1" gutterBottom>
        {greeting}
      </Typography>

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Streak Card */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <StreakCard
            currentStreak={profile?.streak_current ?? 0}
            longestStreak={profile?.streak_longest ?? 0}
          />
        </Grid>

        {/* Progress Card */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  fontSize: 48,
                  lineHeight: 1,
                }}
                role="img"
                aria-label="progress"
              >
                📚
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {progressPercent}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {progressText}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressPercent}
                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Continue Learning Section */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SchoolIcon color="primary" sx={{ fontSize: 32 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{continueText}</Typography>
            {levelInfo && !isAllComplete && (
              <Typography variant="body2" color="text.secondary">
                Level {levelInfo.levelId}: {levelInfo.levelName} •{' '}
                {levelInfo.patternsCompletedInLevel}/{levelInfo.patternsInLevel} patterns
              </Typography>
            )}
            {isAllComplete && (
              <Typography variant="body2" color="text.secondary">
                Congratulations! You&apos;ve completed all patterns.
              </Typography>
            )}
          </Box>
        </Box>
        <Button
          variant="primary"
          fullWidth
          onClick={handleContinueLearning}
          startIcon={<SchoolIcon />}
        >
          {buttonText}
        </Button>
      </Card>

      {/* Review Due Section */}
      {reviewDueCount > 0 && (
        <Card sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <RefreshIcon color="warning" sx={{ fontSize: 32 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">Review Due</Typography>
              <Typography variant="body2" color="text.secondary">
                {reviewText}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {reviewDueCount}
            </Box>
          </Box>
          <Button
            variant="outline"
            fullWidth
            onClick={handleStartReview}
            startIcon={<RefreshIcon />}
          >
            Start Review
          </Button>
        </Card>
      )}

      {/* Progress Chart */}
      <Card>
        <ProgressChart data={chartData} title="This Week" />
      </Card>
    </Container>
  );
}
