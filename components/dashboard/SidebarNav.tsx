'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CreditCard, 
  LayoutDashboard, 
  ListChecks, 
  Settings,
  ChevronDown,
  Clock,
  AlertCircle
} from 'lucide-react';

interface SubItem {
  href: string;
  label: string;
  icon: any;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  subItems?: SubItem[];
}

const NAV_ITEMS: NavItem[] = [
  { 
    href: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    subItems: [
      { href: '/dashboard/upcoming', label: 'Upcoming', icon: Clock },
      { href: '/dashboard/overdue', label: 'Overdue', icon: AlertCircle },
    ]
  },
  { href: '/invoices', label: 'Invoices', icon: ListChecks },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>('/dashboard');

  const toggleExpand = (href: string) => {
    setExpandedItem(expandedItem === href ? null : href);
  };

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href));
        const isExpanded = expandedItem === item.href;
        const hasSubItems = item.subItems && item.subItems.length > 0;

        return (
          <div key={item.href}>
            {hasSubItems ? (
              <div>
                <button
                  onClick={() => toggleExpand(item.href)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-3">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                            isSubActive
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <SubIcon className="h-4 w-4" />
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Link
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
            )}
          </div>
        );
      })}
    </nav>
  );
}

