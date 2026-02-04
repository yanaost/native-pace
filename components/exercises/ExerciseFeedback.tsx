'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  FeedbackData,
  getEncouragementMessage,
  getFeedbackTitle,
  getIncorrectExplanation,
  getExerciseTip,
  shouldShowUserAnswer,
  shouldShowCorrectAnswer,
  createFeedbackData,
} from '@/lib/utils/feedback-helpers';
import { highlightPatterns, TextSegment } from '@/lib/utils/dictation-helpers';

// Re-export types and functions for convenience
export type { FeedbackData };
export {
  getEncouragementMessage,
  getFeedbackTitle,
  getIncorrectExplanation,
  getExerciseTip,
  shouldShowUserAnswer,
  shouldShowCorrectAnswer,
  createFeedbackData,
};

/** Props for ExerciseFeedback component */
export interface ExerciseFeedbackProps {
  /** Whether the modal is open */
  open: boolean;
  /** Feedback data to display */
  feedback: FeedbackData;
  /** Callback when user clicks Continue */
  onContinue: () => void;
}

/**
 * ExerciseFeedback modal component.
 * Shows feedback after an exercise with celebration/encouragement,
 * explanation, and pattern information.
 */
export default function ExerciseFeedback({
  open,
  feedback,
  onContinue,
}: ExerciseFeedbackProps) {
  const {
    isCorrect,
    exerciseType,
    userAnswer,
    correctAnswer,
    patternTitle,
    patternExplanation,
    highlightedPatterns,
  } = feedback;

  const title = getFeedbackTitle(isCorrect);
  const encouragement = getEncouragementMessage(isCorrect);
  const tip = getExerciseTip(exerciseType);
  const showUserAnswer = shouldShowUserAnswer(exerciseType, userAnswer);
  const showCorrectAnswer = shouldShowCorrectAnswer(isCorrect, exerciseType);

  // Highlight patterns in correct answer if provided
  const highlightedCorrectAnswer: TextSegment[] = highlightedPatterns
    ? highlightPatterns(correctAnswer, highlightedPatterns)
    : [{ text: correctAnswer, isHighlighted: false }];

  return (
    <Modal open={open} onClose={onContinue} title="">
      <Box sx={{ textAlign: 'center', py: 2 }}>
        {/* Icon and Title */}
        {isCorrect ? (
          <CheckCircleIcon
            sx={{ fontSize: 72, color: 'success.main', mb: 2 }}
          />
        ) : (
          <CancelIcon
            sx={{ fontSize: 72, color: 'error.main', mb: 2 }}
          />
        )}

        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {encouragement}
        </Typography>

        {/* User's Answer (for incorrect answers) */}
        {showUserAnswer && !isCorrect && (
          <Box
            sx={{
              bgcolor: 'error.light',
              p: 2,
              borderRadius: 1,
              mb: 2,
              textAlign: 'left',
            }}
          >
            <Typography variant="caption" color="error.dark">
              Your answer:
            </Typography>
            <Typography variant="body1">{userAnswer}</Typography>
          </Box>
        )}

        {/* Correct Answer (for incorrect answers) */}
        {showCorrectAnswer && (
          <Box
            sx={{
              bgcolor: 'success.light',
              p: 2,
              borderRadius: 1,
              mb: 2,
              textAlign: 'left',
            }}
          >
            <Typography variant="caption" color="success.dark">
              Correct answer:
            </Typography>
            <Typography variant="body1">
              {highlightedCorrectAnswer.map((segment, index) => (
                <Box
                  key={index}
                  component="span"
                  sx={{
                    bgcolor: segment.isHighlighted ? 'warning.light' : 'transparent',
                    px: segment.isHighlighted ? 0.5 : 0,
                    borderRadius: segment.isHighlighted ? 0.5 : 0,
                    fontWeight: segment.isHighlighted ? 'bold' : 'normal',
                  }}
                >
                  {segment.text}
                </Box>
              ))}
            </Typography>
          </Box>
        )}

        {/* Explanation for incorrect answers */}
        {!isCorrect && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {getIncorrectExplanation(exerciseType, correctAnswer)}
          </Typography>
        )}

        {/* Pattern Information */}
        <Box
          sx={{
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            mb: 3,
            textAlign: 'left',
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Pattern: {patternTitle}
          </Typography>
          {patternExplanation && (
            <Typography variant="body2" color="text.secondary">
              {patternExplanation}
            </Typography>
          )}
        </Box>

        {/* Tip */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            bgcolor: 'primary.light',
            p: 2,
            borderRadius: 1,
            mb: 3,
            textAlign: 'left',
          }}
        >
          <LightbulbIcon color="primary" sx={{ mt: 0.5 }} />
          <Typography variant="body2">{tip}</Typography>
        </Box>

        {/* Continue Button */}
        <Button
          variant="primary"
          size="large"
          onClick={onContinue}
          fullWidth
        >
          Continue
        </Button>
      </Box>
    </Modal>
  );
}
