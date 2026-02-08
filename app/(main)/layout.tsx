import { redirect } from 'next/navigation';
import Box from '@mui/material/Box';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header userEmail={user.email} />
      <Box
        component="main"
        sx={{
          flex: 1,
          pb: { xs: 8, md: 0 },
        }}
      >
        {children}
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Footer />
      </Box>
      <MobileNav />
    </Box>
  );
}
