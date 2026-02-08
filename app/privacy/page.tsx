import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - NativePace',
  description: 'Privacy Policy for NativePace - Learn how we handle your data',
};

export default function PrivacyPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 8 }}>
      <Container maxWidth="md">
        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Back to Home
        </Link>

        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mt: 4, mb: 4 }}>
          Privacy Policy
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Last updated: February 2025
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Section title="1. Information We Collect">
            <Typography variant="body1" paragraph>
              We collect information you provide directly to us, such as when you create an account,
              subscribe to our service, or contact us for support.
            </Typography>
            <Typography variant="body1" paragraph>
              This includes:
            </Typography>
            <ul>
              <li>Email address</li>
              <li>Account credentials</li>
              <li>Learning progress and practice history</li>
              <li>Payment information (processed securely by our payment provider)</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <Typography variant="body1" paragraph>
              We use the information we collect to:
            </Typography>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Track your learning progress and personalize your experience</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </Section>

          <Section title="3. Data Security">
            <Typography variant="body1" paragraph>
              We implement appropriate security measures to protect your personal information.
              Your data is encrypted in transit and at rest. We use industry-standard security
              practices to safeguard your information.
            </Typography>
          </Section>

          <Section title="4. Data Retention">
            <Typography variant="body1" paragraph>
              We retain your personal information for as long as your account is active or as
              needed to provide you services. You can request deletion of your account and
              associated data at any time by contacting us.
            </Typography>
          </Section>

          <Section title="5. Your Rights">
            <Typography variant="body1" paragraph>
              You have the right to:
            </Typography>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </Section>

          <Section title="6. Cookies">
            <Typography variant="body1" paragraph>
              We use essential cookies to maintain your session and preferences. We do not use
              tracking cookies for advertising purposes.
            </Typography>
          </Section>

          <Section title="7. Contact Us">
            <Typography variant="body1" paragraph>
              If you have any questions about this Privacy Policy, please contact us at{' '}
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
