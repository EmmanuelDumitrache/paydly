// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';

import { fetchInvoices, type InvoiceStatusFilter } from '@/lib/data/invoices';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get('status') ?? 'all') as InvoiceStatusFilter;
  const search = searchParams.get('search') ?? undefined;
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = Number.parseInt(searchParams.get('pageSize') ?? '20', 10);

  try {
    const result = await fetchInvoices(supabase, {
      status,
      search,
      page: Number.isNaN(page) ? 1 : page,
      pageSize: Number.isNaN(pageSize) ? 20 : pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

