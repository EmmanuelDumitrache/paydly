'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CreditCard, 
  LayoutDashboard, 
  ListChecks, 
  Settings,
  Clock,
  AlertCircle,
  HelpCircle,
  Mail,
  History
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upcoming', label: 'Upcoming', icon: Clock },
  { href: '/overdue', label: 'Overdue', icon: AlertCircle },
  { href: '/invoices', label: 'Invoices', icon: ListChecks },
  { href: '/templates', label: 'Templates', icon: Mail },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/support', label: 'Support', icon: HelpCircle },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

