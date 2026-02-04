'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getDuePatterns, ProgressWithPattern } from '@/lib/utils/review-queue';
import {
  createReviewSummary,
  getReviewPageTitle,
  getReviewPageSubtitle,
  getEmptyStateMessage,
} from '@/lib/utils/review-page-helpers';

/**
 * Review page - displays patterns due for review
 */
export default function ReviewPage() {
  const router = useRouter();
  const [duePatterns, setDuePatterns] = useState<ProgressWithPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDuePatterns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch due patterns
    const patterns = await getDuePatterns(supabase, user.id);
    setDuePatterns(patterns);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    loadDuePatterns();
  }, [loadDuePatterns]);

  const handleStartReview = useCallback(() => {
    router.push('/review/session');
  }, [router]);

  const handleContinueLearning = useCallback(() => {
    router.push('/learn');
  }, [router]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outline" onClick={loadDuePatterns} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Container>
    );
  }

  const summary = createReviewSummary(duePatterns);
  const title = getReviewPageTitle(summary.totalDue);
  const subtitle = getReviewPageSubtitle(summary.totalDue);

  // Empty state
  if (summary.isEmpty) {
    const emptyMessage = getEmptyStateMessage();
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 80, color: 'success.main', mb: 3 }}
          />
          <Typography variant="h4" gutterBottom>
            {emptyMessage.title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
          >
            {emptyMessage.description}
          </Typography>
          <Button
            variant="primary"
            size="large"
            onClick={handleContinueLearning}
            startIcon={<SchoolIcon />}
          >
            Continue Learning
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {/* Review Summary Card */}
      <Card sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RefreshIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h3" color="primary.main">
                {summary.totalDue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                patterns due
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Category Breakdown */}
        {summary.categories.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              By Category
            </Typography>
            <List dense disablePadding>
              {summary.categories.map((cat, index) => (
                <ListItem
                  key={cat.category}
                  disableGutters
                  sx={{
                    py: 0.5,
                    borderBottom:
                      index < summary.categories.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                >
                  <ListItemText
                    primary={cat.displayName}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {cat.count}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Card>

      {/* Start Review Button */}
      <Button
        variant="primary"
        size="large"
        fullWidth
        onClick={handleStartReview}
      >
        Start Review
      </Button>
    </Container>
  );
}
