import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // CRITICAL: Configure createBrowserClient to use cookies for PKCE storage
  // By default, @supabase/ssr uses localStorage which is not accessible server-side
  // We need cookies so the server-side callback route can access the code verifier
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
    },
    cookies: {
      getAll() {
        // Parse cookies from document.cookie
        return document.cookie.split(';').map(cookie => {
          const [name, ...valueParts] = cookie.trim().split('=');
          return {
            name: name || '',
            value: valueParts.join('=') || '',
          };
        }).filter(cookie => cookie.name);
      },
      setAll(cookiesToSet) {
        // Set cookies in the browser
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookie = `${name}=${value}`;

          if (options?.maxAge) {
            cookie += `; max-age=${options.maxAge}`;
          }
          if (options?.path) {
            cookie += `; path=${options.path}`;
          }
          // Use domain from options if provided, otherwise set for both www and non-www
          const domain = options?.domain;
          if (domain) {
            cookie += `; domain=${domain}`;
          } else if (typeof window !== 'undefined') {
            // Set cookie for both www and non-www domains if on paydly.io
            const hostname = window.location.hostname;
            if (hostname.includes('paydly.io')) {
              cookie += `; domain=.paydly.io`;
            }
          }
          if (options?.sameSite) {
            cookie += `; samesite=${options.sameSite}`;
          } else {
            // Default to 'lax' for OAuth flows
            cookie += `; samesite=lax`;
          }
          if (options?.secure ?? (typeof window !== 'undefined' && window.location.protocol === 'https:')) {
            cookie += '; secure';
          }

          document.cookie = cookie;
        });
      },
    },
  });
}

export type SupabaseClient = ReturnType<typeof createClient>;

