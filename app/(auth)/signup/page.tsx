'use client';

import { useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { signUpWithEmail, signInWithGoogle } from '@/lib/supabase/auth';
import { trackSignupStarted, trackSignupCompleted } from '@/lib/analytics/track';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    trackSignupStarted('email');

    const { data, error } = await signUpWithEmail(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (data?.user?.id) {
        trackSignupCompleted(data.user.id, 'email');
      }
      setSuccess(true);
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    trackSignupStarted('google');
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
    // OAuth redirects automatically, tracking will happen on callback
  };

  if (success) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Check your email to confirm your account!
        </Alert>
        <Typography variant="body2" color="text.secondary">
          We sent a confirmation link to <strong>{email}</strong>
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleEmailSignup}>
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
          inputProps={{ minLength: 6 }}
          helperText="Minimum 6 characters"
          sx={{ mb: 3 }}
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Account'}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }}>or</Divider>

      <Button
        fullWidth
        variant="outlined"
        size="large"
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        Continue with Google
      </Button>

      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'inherit' }}>
          Log in
        </Link>
      </Typography>
    </Box>
  );
}
