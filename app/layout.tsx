import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ui/use-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Soja AI CRM',
  description: 'Multi-tenant CRM for AI Automation Agencies'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-muted/40">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
