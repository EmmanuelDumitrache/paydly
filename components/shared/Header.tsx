'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV_LINKS = [
  { href: '#problem', label: 'Problem' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
];

const HIDDEN_PREFIXES = ['/dashboard', '/invoices', '/settings', '/billing', '/upcoming', '/overdue', '/support', '/templates'];

export function Header() {
  const pathname = usePathname();
  const hideChrome =
    pathname === '/login' ||
    pathname === '/signup' ||
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideChrome) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-semibold bg-gradient-to-r from-slate-900 via-indigo-600 to-slate-900 bg-[length:300%_100%] bg-clip-text text-transparent animate-light-sweep">
            Paydly
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-slate-900">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-300 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 inline-flex items-center gap-1.5"
          >
            <span>Live Demo</span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </Link>
          <Link
            href="/login"
            className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600 md:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={clsx(
              'rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 animate-glow-soft'
            )}
          >
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
}

