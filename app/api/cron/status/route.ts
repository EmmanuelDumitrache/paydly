// @ts-nocheck - Supabase generic types cause issues with type inference
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

export async function GET() {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch last 10 cron runs
  const { data: cronRuns, error: cronError } = await supabase
    .from('cron_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(10);

  if (cronError) {
    console.error('[Cron Status] Error fetching cron runs:', cronError);
    return NextResponse.json({ error: 'Failed to fetch cron status' }, { status: 500 });
  }

  // Get last successful run
  const lastSuccessfulRun = cronRuns?.find((run) => run.status === 'success');

  // Calculate reminders sent today/this week/this month
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const monthStart = startOfMonth(now).toISOString();

  const { data: todayLogs } = await supabase
    .from('reminder_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('sent_at', todayStart);

  const { data: weekLogs } = await supabase
    .from('reminder_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('sent_at', weekStart);

  const { data: monthLogs } = await supabase
    .from('reminder_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('sent_at', monthStart);

  // Get user's last cron run timestamp
  const { data: profile } = await supabase
    .from('profiles')
    .select('last_cron_run_at')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    cronRuns: cronRuns || [],
    lastSuccessfulRun: lastSuccessfulRun || null,
    lastCronRunAt: profile?.last_cron_run_at || null,
    stats: {
      remindersToday: todayLogs?.length || 0,
      remindersThisWeek: weekLogs?.length || 0,
      remindersThisMonth: monthLogs?.length || 0,
    },
  });
}

