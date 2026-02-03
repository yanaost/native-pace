import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type ProgressColor = 'primary' | 'secondary' | 'success' | 'error';

export interface ProgressProps extends Omit<LinearProgressProps, 'variant' | 'color'> {
  value: number;
  color?: ProgressColor;
  label?: string;
  showPercentage?: boolean;
}

export default function Progress({
  value,
  color = 'primary',
  label,
  showPercentage = false,
  ...props
}: ProgressProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {(label || showPercentage) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          {label && <Typography variant="body2" color="text.secondary">{label}</Typography>}
          {showPercentage && <Typography variant="body2" color="text.secondary">{Math.round(value)}%</Typography>}
        </Box>
      )}
      <LinearProgress variant="determinate" value={value} color={color} {...props} />
    </Box>
  );
}
