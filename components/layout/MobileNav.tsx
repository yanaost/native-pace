'use client';

import { usePathname, useRouter } from 'next/navigation';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import ReplayIcon from '@mui/icons-material/Replay';
import PersonIcon from '@mui/icons-material/Person';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: <DashboardIcon /> },
  { href: '/learn', label: 'Learn', icon: <SchoolIcon /> },
  { href: '/review', label: 'Review', icon: <ReplayIcon /> },
  { href: '/profile', label: 'Profile', icon: <PersonIcon /> },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = navItems.findIndex((item) => pathname.startsWith(item.href));

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', md: 'none' },
        zIndex: 1000,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentIndex}
        onChange={(_, newValue) => {
          router.push(navItems[newValue].href);
        }}
        showLabels
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
