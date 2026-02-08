import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'About - NativePace',
  description: 'Learn about NativePace and our mission to help you understand native English speakers',
};

export default function AboutPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 8 }}>
      <Container maxWidth="md">
        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Back to Home
        </Link>

        <Box sx={{ textAlign: 'center', mt: 4, mb: 6 }}>
          <Image src="/logo.png" alt="NativePace" width={100} height={100} />
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mt: 2 }}>
            About NativePace
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Section title="Our Mission">
            <Typography variant="body1" paragraph>
              NativePace was created to solve one of the most frustrating problems English learners face:
              understanding native speakers in real conversations.
            </Typography>
            <Typography variant="body1" paragraph>
              You&apos;ve studied English for years. You know the grammar. You have a good vocabulary.
              But when a native speaker talks at normal speed, it sounds like a blur of sounds that
              doesn&apos;t match what you learned in textbooks.
            </Typography>
            <Typography variant="body1" paragraph>
              That&apos;s because textbooks teach you &quot;What do you want to do?&quot; but native speakers
              actually say &quot;Whaddya wanna do?&quot;
            </Typography>
          </Section>

          <Section title="The Science Behind It">
            <Typography variant="body1" paragraph>
              Connected speech is the natural way humans speak. When we talk at normal speed, sounds
              blend together, syllables get reduced, and words link in predictable patterns.
            </Typography>
            <Typography variant="body1" paragraph>
              Research shows there are approximately 185 core connected speech patterns that account
              for most of the &quot;fast speech&quot; that learners struggle with. NativePace teaches you all
              of them through targeted listening exercises.
            </Typography>
          </Section>

          <Section title="Our Approach">
            <Typography variant="body1" paragraph>
              We believe in learning by doing. Each pattern is presented with:
            </Typography>
            <ul>
              <li><strong>Clear audio</strong> - Hear the formal pronunciation</li>
              <li><strong>Conversational audio</strong> - Hear how it really sounds</li>
              <li><strong>Interactive exercises</strong> - Train your ear to recognize patterns</li>
              <li><strong>Spaced repetition</strong> - Review at optimal intervals for retention</li>
            </ul>
          </Section>

          <Section title="Who We Are">
            <Typography variant="body1" paragraph>
              NativePace was built by language enthusiasts who experienced this problem firsthand.
              We combined insights from linguistics research with modern learning science to create
              a focused, effective tool for mastering connected speech.
            </Typography>
          </Section>

          <Section title="Get in Touch">
            <Typography variant="body1" paragraph>
              Have questions or feedback? We&apos;d love to hear from you.
            </Typography>
            <Typography variant="body1">
              Email us at{' '}
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
