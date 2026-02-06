import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Her - Your Warm AI Companion',
  description: 'Experience a warm, intelligent conversation with Her - your AI companion',
  keywords: ['AI', 'chat', 'assistant', 'companion', 'Her'],
  authors: [{ name: 'Her Team' }],
  openGraph: {
    title: 'Her - Your Warm AI Companion',
    description: 'Experience a warm, intelligent conversation',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
