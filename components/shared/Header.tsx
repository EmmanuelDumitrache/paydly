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
          <span className="text-xl font-semibold text-slate-900">Paydly</span>
          <span className="hidden text-xs font-medium uppercase tracking-wide text-indigo-600 sm:inline">
            Get paid faster
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
            href="/login"
            className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600 md:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={clsx(
              'rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500'
            )}
          >
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
}

