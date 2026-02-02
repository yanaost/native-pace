import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        p: 3,
      }}
    >
      <Typography variant="h3" component="h1" fontWeight="bold">
        NativePace
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Train smarter with personalized running workouts
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" color="primary">
          Get Started
        </Button>
        <Button variant="outlined" color="primary">
          Learn More
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" color="success">
          Success
        </Button>
        <Button variant="contained" color="error">
          Error
        </Button>
      </Stack>
    </Box>
  );
}
