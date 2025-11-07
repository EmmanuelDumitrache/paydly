'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HIDDEN_PREFIXES = ['/dashboard', '/invoices', '/settings', '/billing'];

export function Footer() {
  const pathname = usePathname();
  const hideChrome =
    pathname === '/login' ||
    pathname === '/signup' ||
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideChrome) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} Paydly. All rights reserved.</p>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/about" className="transition hover:text-slate-900">
            About
          </Link>
          <Link href="/privacy" className="transition hover:text-slate-900">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-slate-900">
            Terms
          </Link>
          <a
            href="mailto:hello@paydly.com"
            className="transition hover:text-slate-900"
          >
            Contact
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-slate-900"
          >
            Twitter
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-slate-900"
          >
            LinkedIn
          </a>
        </nav>
      </div>
    </footer>
  );
}

