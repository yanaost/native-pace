'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { signInWithEmail, signInWithGoogle } from '@/lib/supabase/auth';
import { trackLoginCompleted } from '@/lib/analytics/track';
import { identifyUser } from '@/lib/analytics/posthog';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data?.user?.id) {
        identifyUser(data.user.id, { email: data.user.email });
        trackLoginCompleted(data.user.id, 'email');
      }
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
    // OAuth redirects automatically
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleEmailLogin}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          sx={{ mb: 3 }}
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Log In'}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }}>or</Divider>

      <Button
        fullWidth
        variant="outlined"
        size="large"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        Continue with Google
      </Button>

      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: 'inherit' }}>
          Sign up
        </Link>
      </Typography>
    </Box>
  );
}
