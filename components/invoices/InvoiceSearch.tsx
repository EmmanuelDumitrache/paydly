'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function InvoiceSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);
  const initialValue = searchParams.get('search') ?? '';
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const nextValue = searchParams.get('search') ?? '';
    setValue(nextValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParamsString);

      if (value.trim().length > 0) {
        params.set('search', value.trim());
      } else {
        params.delete('search');
      }

      // Reset pagination when search changes
      params.delete('page');

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 300);

    return () => clearTimeout(handler);
  }, [value, pathname, router, searchParamsString]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <input
        name="search"
        value={value}
        onChange={handleChange}
        placeholder="Search by client or invoice #"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        aria-label="Search invoices by client or invoice number"
      />
    </div>
  );
}


