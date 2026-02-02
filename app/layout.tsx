import type { Metadata } from 'next';
import ThemeRegistry from '@/lib/theme/ThemeRegistry';
import './globals.css';

export const metadata: Metadata = {
  title: 'NativePace - Running Training Platform',
  description: 'Train smarter with personalized running workouts based on your natural pace',
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
