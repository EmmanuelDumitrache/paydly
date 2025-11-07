import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

import type { Database } from '@/types/database';

function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createBrowserClient<Database>(url, anonKey);
}

export function createClient() {
  return getSupabaseBrowserClient();
}

export type SupabaseClient = ReturnType<typeof createClient>;

