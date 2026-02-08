'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success message
    // In production, this would send to an API endpoint
    setSubmitted(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 8 }}>
      <Container maxWidth="sm">
        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Back to Home
        </Link>

        <Box sx={{ textAlign: 'center', mt: 4, mb: 6 }}>
          <Image src="/logo.png" alt="NativePace" width={80} height={80} />
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mt: 2 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Have a question or feedback? We&apos;d love to hear from you.
          </Typography>
        </Box>

        {submitted ? (
          <Box
            sx={{
              bgcolor: 'success.light',
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Message Sent!
            </Typography>
            <Typography variant="body1">
              Thank you for reaching out. We&apos;ll get back to you as soon as possible.
            </Typography>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              bgcolor: 'white',
              p: 4,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                placeholder="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
              />
              <TextField
                placeholder="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
              />
              <TextField
                placeholder="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
              />
              <TextField
                placeholder="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                multiline
                rows={5}
                fullWidth
                variant="outlined"
              />
              <Button type="submit" variant="primary" size="large" fullWidth>
                Send Message
              </Button>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Or email us directly at
          </Typography>
          <Typography variant="body1">
            <a href="mailto:support@nativepace.com" style={{ color: '#3b82f6', fontWeight: 500 }}>
              support@nativepace.com
            </a>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
