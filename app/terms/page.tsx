import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - NativePace',
  description: 'Terms of Service for NativePace',
};

export default function TermsPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 8 }}>
      <Container maxWidth="md">
        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Back to Home
        </Link>

        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mt: 4, mb: 4 }}>
          Terms of Service
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Last updated: February 2025
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Section title="1. Acceptance of Terms">
            <Typography variant="body1" paragraph>
              By accessing or using NativePace, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </Typography>
          </Section>

          <Section title="2. Description of Service">
            <Typography variant="body1" paragraph>
              NativePace is an online learning platform designed to help users understand native
              English speakers by teaching connected speech patterns, reductions, and natural
              pronunciation.
            </Typography>
          </Section>

          <Section title="3. User Accounts">
            <Typography variant="body1" paragraph>
              To access certain features, you must create an account. You are responsible for:
            </Typography>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </Section>

          <Section title="4. Subscription and Payments">
            <Typography variant="body1" paragraph>
              Premium features require a paid subscription. By subscribing, you agree to:
            </Typography>
            <ul>
              <li>Pay the applicable fees for your chosen plan</li>
              <li>Automatic renewal unless cancelled before the renewal date</li>
              <li>Our refund policy as stated in Section 5</li>
            </ul>
          </Section>

          <Section title="5. Refund Policy">
            <Typography variant="body1" paragraph>
              We offer a 30-day money-back guarantee for new subscribers. If you are not satisfied
              with our service, contact us within 30 days of your initial purchase for a full refund.
            </Typography>
          </Section>

          <Section title="6. Intellectual Property">
            <Typography variant="body1" paragraph>
              All content on NativePace, including audio files, text, graphics, and software, is
              owned by NativePace and protected by copyright laws. You may not reproduce, distribute,
              or create derivative works without our permission.
            </Typography>
          </Section>

          <Section title="7. Acceptable Use">
            <Typography variant="body1" paragraph>
              You agree not to:
            </Typography>
            <ul>
              <li>Share your account with others</li>
              <li>Download or redistribute our content</li>
              <li>Use automated systems to access our service</li>
              <li>Interfere with the proper functioning of the service</li>
            </ul>
          </Section>

          <Section title="8. Termination">
            <Typography variant="body1" paragraph>
              We may terminate or suspend your account at any time for violations of these terms.
              You may cancel your account at any time through your account settings or by contacting us.
            </Typography>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <Typography variant="body1" paragraph>
              NativePace is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
              that the service will be uninterrupted or error-free.
            </Typography>
          </Section>

          <Section title="10. Limitation of Liability">
            <Typography variant="body1" paragraph>
              To the maximum extent permitted by law, NativePace shall not be liable for any indirect,
              incidental, special, or consequential damages arising from your use of the service.
            </Typography>
          </Section>

          <Section title="11. Changes to Terms">
            <Typography variant="body1" paragraph>
              We may update these terms from time to time. We will notify you of significant changes
              by email or through the service.
            </Typography>
          </Section>

          <Section title="12. Contact">
            <Typography variant="body1" paragraph>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:support@nativepace.com" style={{ color: '#3b82f6' }}>
                support@nativepace.com
              </a>
            </Typography>
          </Section>
        </Box>
      </Container>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
