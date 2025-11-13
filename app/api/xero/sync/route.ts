// @ts-nocheck - Supabase generic types cause issues with type inference
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { syncXeroInvoicesForUser } from '@/lib/xero/sync';
import { checkActiveSubscription } from '@/lib/auth/subscription';

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has active subscription
  const profile = await checkActiveSubscription(supabase, user.id);
  if (!profile) {
    return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
  }

  // Check if this is a form submission (has form data) or an API call (JSON)
  const contentType = request.headers.get('content-type');
  const isFormSubmission = contentType?.includes('application/x-www-form-urlencoded') || 
                           contentType?.includes('multipart/form-data');

  try {
    const result = await syncXeroInvoicesForUser(supabase, user.id);
    revalidatePath('/dashboard');
    revalidatePath('/overdue');
    revalidatePath('/upcoming');

    // If it's a form submission, redirect with query params
    if (isFormSubmission) {
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
    }

    // Otherwise, return JSON for API calls
    return NextResponse.json({
      success: true,
      synced: result.synced,
      newInvoices: result.newInvoices,
      updatedInvoices: result.updatedInvoices,
      message: result.message,
    });
  } catch (syncError) {
    console.error('Sync error details:', syncError);
    const message = syncError instanceof Error ? syncError.message : 'Failed to sync invoices';

    // If it's a form submission, redirect with error params
    if (isFormSubmission) {
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

    // Otherwise, return JSON error for API calls
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

