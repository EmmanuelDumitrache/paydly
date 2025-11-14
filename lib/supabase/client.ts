import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // createBrowserClient automatically handles cookies via document.cookie
  // No explicit cookie configuration needed - browser handles it
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

export type SupabaseClient = ReturnType<typeof createClient>;

