import type { Metadata } from 'next';

import { CTA } from '@/components/landing/CTA';
import { FAQ } from '@/components/landing/FAQ';
import { Features } from '@/components/landing/Features';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { Problem } from '@/components/landing/Problem';
import { SocialProof } from '@/components/landing/SocialProof';
import { StructuredData } from '@/components/seo/StructuredData';
import Reveal from '@/components/ui/Reveal';

export const metadata: Metadata = {
  title: 'Automate Invoice Reminders from Xero | Get Paid 40% Faster',
  description:
    'Automate invoice reminders from Xero. Connect your Xero account, track overdue invoices, and send polite reminders at custom intervals. Set it once and focus on billable work. 14-day free trial.',
  keywords: [
    'invoice reminders',
    'Xero automation',
    'automate invoice follow-ups',
    'get paid faster',
    'accounts receivable automation',
    'late payment reminders',
    'Xero integration',
  ],
  openGraph: {
    title: 'Paydly — Automate invoice reminders and get paid faster',
    description:
      'Automate invoice reminders from Xero. Connect your Xero account and let Paydly send polite reminders at custom intervals. Get paid 40% faster.',
    url: '/',
  },
  alternates: {
    canonical: '/',
  },
};

const faqSchema = [
  {
    '@type': 'Question',
    name: 'How does Paydly connect to my Xero account?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: "Paydly uses Xero's official OAuth integration to securely connect to your account. You'll authorize Paydly to read your invoices (we never modify them). Your Xero credentials are never stored on our servers.",
    },
  },
  {
    '@type': 'Question',
    name: 'What happens during the 14-day trial?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'You get full access to all features: unlimited invoice syncing, automated reminders at 7, 14, and 21 days overdue, and email delivery. No credit card required to start. After 14 days, you\'ll need to add payment to continue.',
    },
  },
  {
    '@type': 'Question',
    name: 'Can I customize which reminders are sent?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Yes! In Settings, you can toggle reminders on or off for 7-day, 14-day, and 21-day intervals. You can also pause reminders for specific invoices if a client needs more time.',
    },
  },
  {
    '@type': 'Question',
    name: 'Will my clients know reminders are automated?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'The emails are friendly and professional, sent from your company name. They don\'t mention automation—they simply remind clients about the outstanding invoice and include a link to pay.',
    },
  },
];

export default function Home() {
  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="softwareApplication" />
      <StructuredData type="faq" data={{ faqs: faqSchema }} />
      <Hero />
      <Reveal>
        <Problem />
      </Reveal>
      <Reveal delayMs={100}>
        <HowItWorks />
      </Reveal>
      <Reveal delayMs={200}>
        <Features />
      </Reveal>
      <Reveal delayMs={300}>
        <SocialProof />
      </Reveal>
      <Reveal delayMs={200}>
        <FAQ />
      </Reveal>
      <Reveal delayMs={100}>
        <Pricing />
      </Reveal>
      <Reveal>
        <CTA />
      </Reveal>
    </>
  );
}
