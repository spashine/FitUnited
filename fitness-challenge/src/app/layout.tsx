import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/hooks/useAppContext';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Global Wellbeing Challenge 2026',
  description: 'Gamified wellbeing event across US, Mexico, and India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-ey-light text-ey-dark min-h-screen`}>
        <AppProvider>
          <Navigation />
          <main className="max-w-6xl mx-auto p-4 md:p-8 pb-24">
            {children}
          </main>
        </AppProvider>
      </body>
    </html >
  );
}
