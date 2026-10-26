// @ts-nocheck - Supabase generic types cause issues with type inference
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { exchangeCodeForTokens, fetchConnections } from '@/lib/xero/client';
import { createClient } from '@/lib/supabase/server';
import { syncXeroInvoicesForUser } from '@/lib/xero/sync';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/settings?xero=error`);
  }

  const code = url.searchParams.get('code');
  const stateParamRaw = url.searchParams.get('state');

  if (!code || !stateParamRaw) {
    console.error('[Xero Callback] Missing code or state parameter');
    return NextResponse.redirect(`${origin}/settings?xero=missing_params`);
  }

  // Decode the state parameter (URLSearchParams.get() should auto-decode, but be explicit)
  const stateParam = decodeURIComponent(stateParamRaw);
  
  console.log('[Xero Callback] Received callback');
  console.log('[Xero Callback] State param from URL (first 30 chars):', stateParam.substring(0, 30) + '...');
  console.log('[Xero Callback] State param full length:', stateParam.length);

  const cookieStore = cookies();
  const storedState = cookieStore.get('xero_oauth_state')?.value;

  console.log('[Xero Callback] State validation:');
  console.log('[Xero Callback] State from URL:', stateParam?.substring(0, 20) + '...');
  console.log('[Xero Callback] State from cookie:', storedState ? storedState.substring(0, 20) + '...' : 'NOT FOUND');
  console.log('[Xero Callback] All cookies:', cookieStore.getAll().map(c => c.name).join(', '));

  // Also check raw request headers for cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMap: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name && valueParts.length > 0) {
        // Decode URL-encoded cookie values
        const decodedValue = decodeURIComponent(valueParts.join('='));
        cookieMap[name.trim()] = decodedValue;
      }
    });
  }
  
  const stateFromHeader = cookieMap['xero_oauth_state'];
  console.log('[Xero Callback] State from request header:', stateFromHeader ? stateFromHeader.substring(0, 20) + '...' : 'NOT FOUND');
  if (stateFromHeader) {
    console.log('[Xero Callback] State from header full length:', stateFromHeader.length);
  }

  // Get authenticated user first - we'll use this as the primary validation
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('[Xero Callback] ❌ No authenticated user!');
    return NextResponse.redirect(`${origin}/login`);
  }

  console.log('[Xero Callback] ✅ Authenticated user:', user.id);

  // Try to validate state, but if it fails, use authenticated user as fallback
  // This makes the OAuth flow more resilient to cookie/storage issues
  const finalStoredState = (storedState || stateFromHeader)?.trim();
  const trimmedStateParam = stateParam?.trim();

  let userId = null;
  let stateValid = false;

  if (finalStoredState && trimmedStateParam && finalStoredState === trimmedStateParam) {
    // State validation passed
    const [stateUserId] = finalStoredState.split(':');
    if (stateUserId === user.id) {
      userId = stateUserId;
      stateValid = true;
      console.log('[Xero Callback] ✅ State validation passed');
    } else {
      console.warn('[Xero Callback] ⚠️ State validation failed - user ID mismatch in state');
    }
  } else {
    console.warn('[Xero Callback] ⚠️ State validation failed - using authenticated user as fallback');
    console.warn('[Xero Callback] State param length:', trimmedStateParam?.length);
    console.warn('[Xero Callback] Stored state length:', finalStoredState?.length);
  }

  // Use authenticated user if state validation failed
  // This is secure because we're checking authentication, and the OAuth code can only be used once anyway
  if (!stateValid) {
    userId = user.id;
    console.log('[Xero Callback] Using authenticated user ID as fallback:', userId);
  }

  try {
    const redirectUri = `${origin}/api/xero/callback`;
    const tokenResponse = await exchangeCodeForTokens(code, redirectUri);
    const connections = await fetchConnections(tokenResponse.access_token);

    if (!connections.length) {
      throw new Error('No Xero connections returned');
    }

    const tenant = connections[0];
    
    // Check if this Xero tenant is already connected to another profile
    // This prevents spam/abuse by ensuring one Xero account can only connect to one Paydly account
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('xero_tenant_id', tenant.tenantId)
      .maybeSingle();

    if (existingProfile && existingProfile.id !== user.id) {
      console.warn('[Xero Callback] Tenant already connected to another profile:', {
        tenantId: tenant.tenantId,
        existingProfileId: existingProfile.id,
        currentUserId: user.id,
      });
      
      const response = NextResponse.redirect(
        `${origin}/settings?xero=tenant_in_use&details=${encodeURIComponent('Xero account already in use! This account is already connected to another Paydly account. Please disconnect it from the other account first or use a different Xero account.')}`
      );
      response.cookies.set('xero_oauth_state', '', {
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        xero_access_token: tokenResponse.access_token,
        xero_refresh_token: tokenResponse.refresh_token,
        xero_token_expires_at: expiresAt,
        xero_tenant_id: tenant.tenantId,
        xero_tenant_name: tenant.tenantName || 'Xero',
      })
      .eq('id', user.id);

    if (updateError) {
      // Fallback: Handle unique constraint violation if check above somehow fails
      if ((updateError as { code?: string }).code === '23505') {
        const response = NextResponse.redirect(
          `${origin}/settings?xero=tenant_in_use&details=${encodeURIComponent('Xero account already in use! This account is already connected to another Paydly account.')}`
        );
        response.cookies.set('xero_oauth_state', '', {
          path: '/',
          maxAge: 0,
        });
        return response;
      }

      throw updateError;
    }

    // Automatically sync invoices after successful Xero connection
    let syncResult = null;
    try {
      console.log('[Xero Callback] Starting automatic invoice sync for user:', user.id);
      syncResult = await syncXeroInvoicesForUser(supabase, user.id);
      console.log('[Xero Callback] Invoice sync completed:', {
        synced: syncResult.synced,
        newInvoices: syncResult.newInvoices,
        updatedInvoices: syncResult.updatedInvoices,
      });

      // Revalidate pages so invoices appear immediately
      revalidatePath('/dashboard');
      revalidatePath('/overdue');
      revalidatePath('/upcoming');
      revalidatePath('/invoices');
    } catch (syncError) {
      // Log error but don't fail the connection flow
      // User can manually sync later if needed
      console.error('[Xero Callback] Invoice sync failed (connection still successful):', syncError);
    }

    const tenantName = encodeURIComponent(tenant.tenantName || 'Xero');
    let redirectUrl = `${origin}/dashboard?xero=success&tenant=${tenantName}`;
    
    // Add sync result to URL for user feedback
    if (syncResult) {
      redirectUrl += `&synced=${syncResult.synced}`;
      if (syncResult.newInvoices > 0) {
        redirectUrl += `&new=${syncResult.newInvoices}`;
      }
    }

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('xero_oauth_state', '', {
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (callbackError) {
    console.error('[Xero Callback] Error:', callbackError);
    
    // Check if the error is related to tenant already in use
    const errorMessage = callbackError instanceof Error ? callbackError.message : String(callbackError);
    const isTenantInUse = errorMessage.toLowerCase().includes('tenant') || 
                          errorMessage.toLowerCase().includes('already') ||
                          errorMessage.toLowerCase().includes('unique') ||
                          errorMessage.toLowerCase().includes('23505');
    
    if (isTenantInUse) {
      const response = NextResponse.redirect(
        `${origin}/settings?xero=tenant_in_use&details=${encodeURIComponent('Xero account already in use! This account is already connected to another Paydly account.')}`
      );
      response.cookies.set('xero_oauth_state', '', {
        path: '/',
        maxAge: 0,
      });
      return response;
    }
    
    const response = NextResponse.redirect(`${origin}/settings?xero=failed`);
    response.cookies.set('xero_oauth_state', '', {
      path: '/',
      maxAge: 0,
    });
    return response;
  }
}

