import type { Metadata } from 'next';
import ThemeRegistry from '@/lib/theme/ThemeRegistry';
import './globals.css';

export const metadata: Metadata = {
  title: 'NativePace - Understand Native English',
  description: 'Learn to understand fast native English speech',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
