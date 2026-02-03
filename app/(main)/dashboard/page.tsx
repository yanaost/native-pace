import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function DashboardPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary">
        Welcome to NativePace! This is the dashboard page.
      </Typography>
    </Box>
  );
}
