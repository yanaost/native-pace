import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            NativePace
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Understand native English speakers
          </Typography>
        </Box>
        {children}
      </Container>
    </Box>
  );
}
