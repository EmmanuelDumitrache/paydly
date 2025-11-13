'use client';

import Link from 'next/link';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

interface TopBarProps {
  xeroConnected: boolean;
  xeroTenantName?: string | null;
  lastSyncAt?: string | null;
  onSync: () => void;
  isSyncing: boolean;
}

export function TopBar({ xeroConnected, xeroTenantName, lastSyncAt, onSync, isSyncing }: TopBarProps) {
  const pathname = usePathname();
  const [showXeroTooltip, setShowXeroTooltip] = useState(false);
  const [showAgentTooltip, setShowAgentTooltip] = useState(false);

  console.log('TopBar Props:', {
    xeroConnected,
    xeroTenantName,
    lastSyncAt,
  });

  const getXeroStatusText = () => {
    if (!xeroConnected) return 'Not connected';
    if (lastSyncAt) {
      const syncDate = new Date(lastSyncAt);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / 60000);

      if (diffMinutes < 1) return 'Synced just now';
      if (diffMinutes < 60) return `Synced ${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Synced ${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `Synced ${diffDays}d ago`;
    }
    return xeroTenantName ? `Connected to ${xeroTenantName}` : 'Connected';
  };

  const HIDDEN_PREFIXES = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/email-verification',
    '/email-sent',
    '/password-reset-sent',
    '/password-reset-complete',
    '/account-activation',
    '/activation-sent',
    '/activation-complete',
    '/terms',
    '/privacy',
    '/contact',
    '/about',
    '/faq',
    '/pricing',
    '/blog',
    '/careers',
    '/sitemap',
    '/robots.txt',
    '/favicon.ico',
    '/manifest.json',
    '/browserconfig.xml',
    '/sitemap.xml',
    '/rss.xml',
    '/atom.xml',
    '/jsonld.json',
  ];

  const hideChrome = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname === '/' ||
    pathname.includes('/templates');

  if (hideChrome) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-semibold text-slate-900">Paydly</span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing || !xeroConnected}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </button>

          {/* Xero Status Indicator */}
          <div
            className="relative"
            onMouseEnter={() => setShowXeroTooltip(true)}
            onMouseLeave={() => setShowXeroTooltip(false)}
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  xeroConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="text-sm text-slate-600">Xero</span>
            </div>
            
            {/* Tooltip */}
            {showXeroTooltip && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <p className="text-xs font-semibold text-slate-900">
                  {xeroConnected ? 'Connected' : 'Disconnected'}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {getXeroStatusText()}
                </p>
                {xeroTenantName && (
                  <p className="mt-1 text-xs text-slate-500">
                    Tenant: {xeroTenantName}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Paydly Agent (Coming Soon) */}
          <div
            className="relative"
            onMouseEnter={() => setShowAgentTooltip(true)}
            onMouseLeave={() => setShowAgentTooltip(false)}
          >
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              Paydly Agent
            </button>

            {/* Tooltip */}
            {showAgentTooltip && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <p className="text-xs font-semibold text-slate-900">Coming Soon</p>
                <p className="mt-1 text-xs text-slate-600">
                  AI-powered invoice assistant
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}