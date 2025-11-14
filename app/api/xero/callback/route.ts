// @ts-nocheck - Supabase generic types cause issues with type inference
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { exchangeCodeForTokens, fetchConnections } from '@/lib/xero/client';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/settings?xero=error`);
  }

  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');

  if (!code || !stateParam) {
    return NextResponse.redirect(`${origin}/settings?xero=missing_params`);
  }

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
        cookieMap[name] = valueParts.join('=');
      }
    });
  }
  
  const stateFromHeader = cookieMap['xero_oauth_state'];
  console.log('[Xero Callback] State from request header:', stateFromHeader ? stateFromHeader.substring(0, 20) + '...' : 'NOT FOUND');

  // Use state from cookie store, or fallback to request header
  const finalStoredState = storedState || stateFromHeader;

  if (!finalStoredState || finalStoredState !== stateParam) {
    console.error('[Xero Callback] ❌ State mismatch or missing!');
    console.error('[Xero Callback] Expected:', stateParam);
    console.error('[Xero Callback] Got from cookie:', storedState);
    console.error('[Xero Callback] Got from header:', stateFromHeader);
    console.error('[Xero Callback] Cookie header length:', cookieHeader.length);
    console.error('[Xero Callback] All cookie names in header:', Object.keys(cookieMap).join(', '));
    return NextResponse.redirect(`${origin}/settings?xero=invalid_state&details=${encodeURIComponent('OAuth session expired. Please try connecting again.')}`);
  }
  
  console.log('[Xero Callback] ✅ State validated successfully');

  // Use stateParam since it matches finalStoredState after validation
  const [userId] = stateParam.split(':');
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    console.error('[Xero Callback] ❌ User ID mismatch!');
    console.error('[Xero Callback] Expected user ID from state:', userId);
    console.error('[Xero Callback] Actual user ID:', user?.id);
    return NextResponse.redirect(`${origin}/login`);
  }
  
  console.log('[Xero Callback] ✅ User validated:', user.id);

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

    const tenantName = encodeURIComponent(tenant.tenantName || 'Xero');
    const response = NextResponse.redirect(`${origin}/dashboard?xero=success&tenant=${tenantName}`);
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

