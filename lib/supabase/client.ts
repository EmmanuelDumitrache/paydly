import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';

  // IMPORTANT: @supabase/ssr handles cookies automatically for PKCE flow
  // Do NOT provide custom cookie handlers as it breaks the built-in PKCE storage
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

export type SupabaseClient = ReturnType<typeof createClient>;

