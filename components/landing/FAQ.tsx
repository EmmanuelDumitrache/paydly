'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'How does Paydly connect to my Xero account?',
    answer:
      'Paydly uses Xero\'s official OAuth integration to securely connect to your account. You\'ll authorize Paydly to read your invoices (we never modify them). Your Xero credentials are never stored on our servers.',
  },
  {
    question: 'What happens during the 14-day trial?',
    answer:
      'You get full access to all features: unlimited invoice syncing, automated reminders at 7, 14, and 21 days overdue, and email delivery. No credit card required to start. After 14 days, you\'ll need to add payment to continue.',
  },
  {
    question: 'Can I customize which reminders are sent?',
    answer:
      'Yes! In Settings, you can toggle reminders on or off for 7-day, 14-day, and 21-day intervals. You can also pause reminders for specific invoices if a client needs more time.',
  },
  {
    question: 'Will my clients know reminders are automated?',
    answer:
      'The emails are friendly and professional, sent from your company name. They don\'t mention automation—they simply remind clients about the outstanding invoice and include a link to pay.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-white py-20">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Everything you need to know about Paydly and automated invoice reminders.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-lg font-semibold text-slate-900">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="border-t border-slate-200 px-6 py-5">
                  <p className="text-base text-slate-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Still have questions?{' '}
            <a href="mailto:hello@paydly.io" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Email us
            </a>{' '}
            and we'll get back to you within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
}

