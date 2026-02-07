'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const navLinks = [
  { href: '/dashboard', label: 'DASHBOARD' },
  { href: '/learn', label: 'LEARN' },
  { href: '/review', label: 'REVIEW' },
];

export interface HeaderProps {
  userEmail?: string;
}

export default function Header({ userEmail }: HeaderProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    handleMenuClose();
    router.push('/login');
  };

  return (
    <Box
      component="header"
      sx={{
        py: 1.5,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'white',
        borderTop: '4px solid',
        borderImage: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899) 1',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <Link href="/dashboard">
        <Image src="/logo.png" alt="NativePace" width={72} height={72} />
      </Link>

      <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 4, gap: 3 }}>
        {navLinks.map((link) => (
          <Typography
            key={link.href}
            component={Link}
            href={link.href}
            sx={{
              textDecoration: 'none',
              color: '#64748b',
              fontWeight: 500,
              letterSpacing: '0.05em',
              fontSize: '0.9rem',
              '&:hover': { color: '#3b82f6' },
            }}
          >
            {link.label}
          </Typography>
        ))}
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <IconButton
        onClick={handleMenuOpen}
        sx={{
          color: '#64748b',
          '&:hover': { color: '#3b82f6' },
        }}
      >
        <AccountCircleIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {userEmail && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {userEmail}
            </Typography>
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>LOGOUT</MenuItem>
      </Menu>
    </Box>
  );
}
