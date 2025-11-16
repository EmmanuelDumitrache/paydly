import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';

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
  title: {
    default: 'Paydly — Automate invoice reminders and get paid faster',
    template: '%s • Paydly',
  },
  description:
    'Automate invoice reminders from Xero. Paydly connects to your Xero account, tracks overdue invoices, and sends polite reminders at custom intervals. Get paid 40% faster with automated follow-ups.',
  keywords: [
    'invoice reminders',
    'Xero automation',
    'automate invoice follow-ups',
    'get paid faster',
    'accounts receivable automation',
    'late payment reminders',
    'invoice chasing software',
    'Xero integration',
    'automated invoice reminders',
    'invoice payment automation',
  ],
  authors: [{ name: 'Paydly' }],
  creator: 'Paydly',
  publisher: 'Paydly',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://paydly.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Paydly',
    title: 'Paydly — Automate invoice reminders and get paid faster',
    description:
      'Automate invoice reminders from Xero. Connect your Xero account and let Paydly send polite reminders at custom intervals. Get paid 40% faster with automated follow-ups.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Paydly - Automate invoice reminders',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paydly — Automate invoice reminders and get paid faster',
    description:
      'Automate invoice reminders from Xero. Connect your Xero account and let Paydly send polite reminders at custom intervals.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '3byqk2cB_ePqU8HtHFYq0udMcQpKIljKLTYG5vLAY7k',
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
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
