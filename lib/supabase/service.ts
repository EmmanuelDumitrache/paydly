import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createServiceClient() {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });
}

