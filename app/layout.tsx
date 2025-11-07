import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { Analytics } from '@vercel/analytics/react';

import { Footer } from '@/components/shared/Footer';
import { Header } from '@/components/shared/Header';

import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Paydly — Automate invoice reminders and get paid faster',
  description:
    'Paydly connects to Xero and automatically chases overdue invoices with smart reminders so you can focus on billable work.',
  metadataBase: new URL('https://paydly.com'),
  openGraph: {
    title: 'Paydly',
    description:
      'Get paid faster by automating invoice reminders. Connect Xero and let Paydly follow up at 7, 14, and 21 days overdue.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white text-slate-900 antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
