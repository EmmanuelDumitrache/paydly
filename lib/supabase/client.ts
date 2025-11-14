import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // createBrowserClient from @supabase/ssr uses cookies by default
  // Explicitly enable PKCE flow for OAuth authentication
  // Note: The code verifier should be stored in a cookie accessible to both client and server
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      // Don't override storage - let @supabase/ssr handle cookies automatically
    },
  });
}

export type SupabaseClient = ReturnType<typeof createClient>;

