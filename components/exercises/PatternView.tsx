'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { formatPhonetic } from '@/lib/utils/pattern-helpers';
import type { Pattern } from '@/types/pattern';

/** Props for PatternView component */
export interface PatternViewProps {
  /** The pattern to display */
  pattern: Pattern;
  /** Callback when user clicks "Got it! Next" */
  onNext: () => void;
  /** Whether to show the next button (default: true) */
  showNextButton?: boolean;
  /** Custom next button text (default: "Got it! Next") */
  nextButtonText?: string;
  /** Enable keyboard shortcuts for audio (default: true) */
  enableAudioShortcuts?: boolean;
}

/**
 * PatternView component displays a single pattern for learning.
 * Shows title, description, phonetics, audio comparison, tips, and next button.
 */
export default function PatternView({
  pattern,
  onNext,
  showNextButton = true,
  nextButtonText = 'Got it! Next',
  enableAudioShortcuts = true,
}: PatternViewProps) {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Title and Description */}
      <Typography variant="h5" component="h1" gutterBottom>
        {pattern.title}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {pattern.description}
      </Typography>

      {/* Phonetic Comparison */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Dictionary
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'serif' }}>
              {formatPhonetic(pattern.phoneticClear)}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Natural
            </Typography>
            <Typography variant="h6" sx={{ fontFamily: 'serif' }}>
              {formatPhonetic(pattern.phoneticReduced)}
            </Typography>
          </Box>
        </Box>

        {/* Example Sentence */}
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            &ldquo;{pattern.exampleSentence}&rdquo;
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sounds like: &ldquo;{pattern.exampleTranscription}&rdquo;
          </Typography>
        </Box>

        {/* Audio Player */}
        <AudioPlayer
          slowUrl={pattern.audioSlowUrl}
          fastUrl={pattern.audioFastUrl}
          audioId={`pattern-${pattern.id}`}
          enableGlobalShortcuts={enableAudioShortcuts}
        />

        {enableAudioShortcuts && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 1 }}
          >
            Keyboard: S = Slow, F = Fast, Space = Replay
          </Typography>
        )}
      </Card>

      {/* Tips Section */}
      {pattern.tips && pattern.tips.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Tips
          </Typography>
          <List dense disablePadding>
            {pattern.tips.map((tip, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LightbulbIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={tip} />
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      {/* Next Button */}
      {showNextButton && (
        <Button
          variant="primary"
          size="large"
          onClick={onNext}
          fullWidth
        >
          {nextButtonText}
        </Button>
      )}
    </Box>
  );
}
