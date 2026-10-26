'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
}

const INVOICE_POOL: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-0234', status: '14-day reminder sent' },
  { id: '2', invoiceNumber: 'INV-0198', status: 'Scheduled for tomorrow' },
  { id: '3', invoiceNumber: 'INV-0156', status: 'Payment received' },
  { id: '4', invoiceNumber: 'INV-0287', status: '7-day reminder sent' },
  { id: '5', invoiceNumber: 'INV-0312', status: '21-day reminder sent' },
  { id: '6', invoiceNumber: 'INV-0245', status: 'New invoice tracked' },
  { id: '7', invoiceNumber: 'INV-0298', status: 'Payment received' },
  { id: '8', invoiceNumber: 'INV-0331', status: 'Scheduled for next week' },
];

export function Hero() {
  const [displayedInvoices, setDisplayedInvoices] = useState<Invoice[]>(INVOICE_POOL.slice(0, 3));
  const nextIndexRef = useRef(3);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedInvoices((prev) => {
        // Mark the oldest invoice for exit
        const oldestInvoice = prev[0];
        setExitingIds(new Set([oldestInvoice.id]));

        // After exit animation, remove it and add new one
        setTimeout(() => {
          setDisplayedInvoices((current) => {
            const newInvoices = [...current.slice(1)];
            const nextInvoice = INVOICE_POOL[nextIndexRef.current % INVOICE_POOL.length];
            newInvoices.push(nextInvoice);
            
            // Mark new invoice for entry animation
            setEnteringIds(new Set([nextInvoice.id]));
            
            // Clear exit animation after a moment
            setTimeout(() => {
              setExitingIds(new Set());
              setEnteringIds(new Set());
            }, 500);
            
            nextIndexRef.current = (nextIndexRef.current + 1) % INVOICE_POOL.length;
            
            return newInvoices;
          });
        }, 500);
        
        return prev;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-900 py-24 text-white" id="hero">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/0 to-slate-900 bg-[length:120%_120%] animate-gradient-drift" />
        <div className="absolute -bottom-48 right-0 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-24 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            Get paid faster
          </span>
          <h1 className="relative text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            <span className="relative inline-block bg-gradient-to-r from-white/40 via-white to-white/40 bg-[length:300%_100%] bg-clip-text text-transparent animate-light-sweep">
              Automated Invoice Reminders for Xero
            </span>
          </h1>
          <p className="max-w-xl text-lg text-indigo-100 md:text-xl md:text-2xl">
            Stop chasing overdue invoices. Paydly automatically reminds your clients and gets you paid 40% faster.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="relative rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-indigo-100 animate-glow"
            >
              Explore Live Demo →
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Start 14-day free trial
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-indigo-100">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Unlimited invoices & reminders
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              No credit card required
            </div>
          </div>
        </div>
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-wide text-indigo-200">Automations in progress</p>
            <ul className="space-y-3 text-sm text-indigo-100 min-h-[180px]">
              {displayedInvoices.map((invoice) => {
                const isExiting = exitingIds.has(invoice.id);
                const isEntering = enteringIds.has(invoice.id);
                
                return (
                  <li
                    key={invoice.id}
                    className={`flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 ${
                      isExiting ? 'animate-notification-exit' : isEntering ? 'animate-notification-enter' : ''
                    }`}
                  >
                    <span className="font-medium text-white">{invoice.invoiceNumber}</span>
                    <span className="text-xs text-indigo-200">{invoice.status}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

