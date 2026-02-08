import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

/**
 * Site-wide footer component with multi-column layout
 */
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 4,
        bgcolor: '#1a1a2e',
        color: 'white',
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 4,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, letterSpacing: '0.05em' }}>
              PRODUCT
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/#pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>Pricing</Link>
              <Link href="/learn" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>Lessons</Link>
              <Link href="/signup" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>Get Started</Link>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, letterSpacing: '0.05em' }}>
              COMPANY
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/about" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>About</Link>
              <Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>Contact</Link>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, letterSpacing: '0.05em' }}>
              LEGAL
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>Terms of Service</Link>
            </Box>
          </Box>
        </Box>
        <Box sx={{ pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            © 2025 NativePace. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
