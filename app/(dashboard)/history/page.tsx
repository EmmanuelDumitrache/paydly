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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  console.log('[HistoryPage] NEXT_PUBLIC_BASE_URL:', baseUrl);

  let emailHistory = [];
  let fetchError = null;

  try {
    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_BASE_URL is not defined.');
    }
    const response = await fetch(`${baseUrl}/api/history`, { cache: 'no-store' }); // Disable caching for debugging
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch email history: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    emailHistory = data.emailHistory;
    console.log('[HistoryPage] Fetched email history:', emailHistory);
  } catch (error) {
    fetchError = error instanceof Error ? error.message : 'An unknown error occurred during fetch.';
    console.error('[HistoryPage] Error fetching or parsing email history:', fetchError);
  }

  if (fetchError) {
    // Optionally, render an error message on the page or redirect
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Email History</h1>
        <p className="text-red-600">Error loading history: {fetchError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Email History</h1>
      <p className="text-slate-600">View a log of all sent reminder emails.</p>
      <EmailHistoryTable history={emailHistory || []} />
    </div>
  );
}
