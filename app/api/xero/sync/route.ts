// @ts-nocheck - Supabase generic types cause issues with type inference
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { syncXeroInvoicesForUser } from '@/lib/xero/sync';

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncXeroInvoicesForUser(supabase, user.id);
    revalidatePath('/dashboard');
    revalidatePath('/overdue');
    revalidatePath('/upcoming');

    let redirectUrl: URL;
    const referer = request.headers.get('referer');

    if (referer) {
      try {
        redirectUrl = new URL(referer);
      } catch {
        redirectUrl = new URL(request.url);
      }
    } else {
      redirectUrl = new URL(request.url);
    }

    if (redirectUrl.pathname.startsWith('/api/')) {
      redirectUrl.pathname = '/settings';
    }

    redirectUrl.searchParams.set('sync', 'success');
    redirectUrl.searchParams.set('message', result.message);

    return NextResponse.redirect(redirectUrl);
  } catch (syncError) {
    console.error('Sync error details:', syncError);
    const message = syncError instanceof Error ? syncError.message : 'Failed to sync invoices';
    let redirectUrl: URL;
    const referer = request.headers.get('referer');

    if (referer) {
      try {
        redirectUrl = new URL(referer);
      } catch {
        redirectUrl = new URL(request.url);
      }
    } else {
      redirectUrl = new URL(request.url);
    }

    if (redirectUrl.pathname.startsWith('/api/')) {
      redirectUrl.pathname = '/settings';
    }

    redirectUrl.searchParams.set('sync', 'error');
    redirectUrl.searchParams.set('message', message);
    return NextResponse.redirect(redirectUrl);
  }
}

