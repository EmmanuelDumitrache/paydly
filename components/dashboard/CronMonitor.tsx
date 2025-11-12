'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import type { CronRun } from '@/types';

interface CronStatus {
  cronRuns: CronRun[];
  lastSuccessfulRun: CronRun | null;
  lastCronRunAt: string | null;
  stats: {
    remindersToday: number;
    remindersThisWeek: number;
    remindersThisMonth: number;
  };
}

export function CronMonitor() {
  const [status, setStatus] = useState<CronStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/cron/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('[CronMonitor] Failed to fetch status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const lastRun = status.lastSuccessfulRun;
  const lastRunTime = lastRun?.completed_at || lastRun?.started_at;
  
  // Determine status
  let statusColor = 'text-slate-400';
  let statusBg = 'bg-slate-100';
  let StatusIcon = Clock;
  let statusText = 'No runs yet';

  if (lastRun) {
    if (lastRun.status === 'success') {
      statusColor = 'text-emerald-600';
      statusBg = 'bg-emerald-100';
      StatusIcon = CheckCircle2;
      statusText = 'Healthy';
    } else if (lastRun.status === 'failed') {
      statusColor = 'text-rose-600';
      statusBg = 'bg-rose-100';
      StatusIcon = XCircle;
      statusText = 'Failed';
    } else if (lastRun.status === 'running') {
      statusColor = 'text-amber-600';
      statusBg = 'bg-amber-100';
      StatusIcon = AlertCircle;
      statusText = 'Running';
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${statusBg}`}>
              <StatusIcon className={`h-5 w-5 ${statusColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Automation Status</h3>
                <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
              </div>
              <p className="text-xs text-slate-500">
                {lastRunTime ? (
                  <>
                    Last run {formatDistanceToNow(new Date(lastRunTime), { addSuffix: true })}
                    {status.stats.remindersToday > 0 && (
                      <> • Sent {status.stats.remindersToday} reminder{status.stats.remindersToday === 1 ? '' : 's'} today</>
                    )}
                  </>
                ) : (
                  'Waiting for first automated run'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              title="Refresh status"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              title={expanded ? 'Hide details' : 'Show details'}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {expanded && status.cronRuns.length > 0 && (
        <div className="border-t border-slate-200 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Runs</h4>
          <div className="space-y-2">
            {status.cronRuns.slice(0, 5).map((run) => {
              const runTime = run.completed_at || run.started_at;
              let runStatusColor = 'text-slate-500';
              let runStatusBg = 'bg-slate-100';
              
              if (run.status === 'success') {
                runStatusColor = 'text-emerald-700';
                runStatusBg = 'bg-emerald-50';
              } else if (run.status === 'failed') {
                runStatusColor = 'text-rose-700';
                runStatusBg = 'bg-rose-50';
              } else if (run.status === 'running') {
                runStatusColor = 'text-amber-700';
                runStatusBg = 'bg-amber-50';
              }

              return (
                <div
                  key={run.id}
                  className={`flex items-center justify-between rounded-lg border ${runStatusBg} p-3`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${runStatusColor}`}>
                        {run.status === 'success' ? '✓ Success' : run.status === 'failed' ? '✗ Failed' : '⋯ Running'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(runTime), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {run.reminders_sent > 0 && (
                        <span>{run.reminders_sent} reminder{run.reminders_sent === 1 ? '' : 's'} sent</span>
                      )}
                      {run.invoices_synced > 0 && (
                        <span className="ml-2">{run.invoices_synced} invoice{run.invoices_synced === 1 ? '' : 's'} synced</span>
                      )}
                      {run.reminders_sent === 0 && run.invoices_synced === 0 && (
                        <span className="text-slate-400">No activity</span>
                      )}
                    </div>
                    {run.error_message && (
                      <div className="mt-1 text-xs text-rose-600">{run.error_message}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

