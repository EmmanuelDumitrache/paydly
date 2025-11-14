// app/(dashboard)/history/page.tsx

import { createClient } from '@/lib/supabase/server';
import { EmailHistoryTable } from '@/components/history/EmailHistoryTable';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/history`);
  const { emailHistory } = await response.json();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Email History</h1>
      <p className="text-slate-600">View a log of all sent reminder emails.</p>
      <EmailHistoryTable history={emailHistory || []} />
    </div>
  );
}
