// @ts-nocheck - Supabase generic types cause issues with type inference
import { differenceInCalendarDays } from 'date-fns';
import { NextResponse } from 'next/server';

import { getReminderTemplate } from '@/lib/email/templates';
import { sendReminderEmail } from '@/lib/email/send';
import { createServiceClient } from '@/lib/supabase/service';
import { alreadySentToday, nextReminderType } from '@/lib/reminders/utils';
import { syncXeroInvoicesForUser } from '@/lib/xero/sync';
import { refreshAccessToken } from '@/lib/xero/client';
import { TRIAL_REMINDER_LIMIT } from '@/lib/reminders/constants';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  if (!CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Create cron run log entry
  const { data: cronRun, error: cronError } = await supabase
    .from('cron_runs')
    .insert({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (cronError || !cronRun) {
    console.error('[Cron] Failed to create cron run log:', cronError);
    return NextResponse.json({ error: 'Failed to initialize cron run' }, { status: 500 });
  }

  const cronRunId = cronRun.id;
  console.log('[Cron] Started cron run:', cronRunId);

  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id,email,company_name,subscription_status,reminder_send_count,xero_tenant_id,xero_access_token,xero_refresh_token,xero_token_expires_at')
    .in('subscription_status', ['trialing', 'active'])
    .not('xero_tenant_id', 'is', null);

  if (usersError) {
    // Log failure
    await supabase
      .from('cron_runs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: usersError.message,
      })
      .eq('id', cronRunId);
    
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  let remindersSent = 0;
  let remindersFailed = 0;
  let invoicesSynced = 0;
  let syncsFailed = 0;

  const today = new Date().toISOString().split('T')[0];
  const trialLimit = TRIAL_REMINDER_LIMIT;

  // Type assertion for users array
  type UserProfile = {
    id: string;
    email: string;
    company_name: string | null;
    subscription_status: string;
    reminder_send_count: number | null;
    xero_tenant_id: string | null;
    xero_access_token: string | null;
    xero_refresh_token: string | null;
    xero_token_expires_at: string | null;
  };

  function isTokenExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return true;
    return new Date(expiresAt).getTime() <= Date.now() + 60 * 1000; // Refresh 1 min early
  }

  for (const user of (users ?? []) as UserProfile[]) {
    const isTrialUser = user.subscription_status === 'trialing';
    let usageCount = user.reminder_send_count ?? 0;

    // Step 1: Sync invoices from Xero BEFORE sending reminders
    try {
      console.log(`[Cron] Syncing invoices for user ${user.id}`);
      
      // Check if token needs refresh
      if (isTokenExpired(user.xero_token_expires_at)) {
        console.log(`[Cron] Token expired for user ${user.id}, refreshing...`);
        if (user.xero_refresh_token) {
          try {
            const refreshed = await refreshAccessToken(user.xero_refresh_token);
            const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
            
            // Update tokens in database
            await supabase
              .from('profiles')
              .update({
                xero_access_token: refreshed.access_token,
                xero_refresh_token: refreshed.refresh_token,
                xero_token_expires_at: newExpiresAt,
              })
              .eq('id', user.id);
            
            console.log(`[Cron] Token refreshed for user ${user.id}`);
          } catch (refreshError) {
            console.error(`[Cron] Failed to refresh token for user ${user.id}:`, refreshError);
            syncsFailed += 1;
            continue; // Skip this user if token refresh fails
          }
        } else {
          console.error(`[Cron] No refresh token available for user ${user.id}`);
          syncsFailed += 1;
          continue;
        }
      }
      
      // Sync invoices
      const syncResult = await syncXeroInvoicesForUser(supabase, user.id);
      invoicesSynced += syncResult.synced;
      console.log(`[Cron] Synced ${syncResult.synced} invoices for user ${user.id}`);
    } catch (syncError) {
      console.error(`[Cron] Failed to sync invoices for user ${user.id}:`, syncError);
      syncsFailed += 1;
      // Continue to send reminders even if sync fails
    }

    // Step 2: Send reminders (existing logic)
    const { data: settings } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Type assertion for settings
    type Settings = {
      day_7_enabled: boolean;
      day_14_enabled: boolean;
      day_21_enabled: boolean;
      reminders_globally_paused?: boolean;
      custom_intervals?: {
        day_1: number;
        day_2: number;
        day_3: number;
      };
    } | null;

    const typedSettings = settings as Settings;

    // Skip if reminders are globally paused
    if (typedSettings?.reminders_globally_paused) {
      console.log(`[Cron] Reminders globally paused for user ${user.id}, skipping`);
      continue;
    }

    const schedule = {
      day_7_enabled: typedSettings?.day_7_enabled ?? true,
      day_14_enabled: typedSettings?.day_14_enabled ?? true,
      day_21_enabled: typedSettings?.day_21_enabled ?? true,
    };

    const customIntervals = typedSettings?.custom_intervals || { day_1: 7, day_2: 14, day_3: 21 };

    // Update last cron run timestamp for this user
    await supabase
      .from('profiles')
      .update({ last_cron_run_at: new Date().toISOString() })
      .eq('id', user.id);

    if (isTrialUser && usageCount >= trialLimit) {
      console.log(`[Cron] Trial limit reached for user ${user.id}, skipping reminders`);
      continue;
    }

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .eq('reminders_paused', false)
      .neq('status', 'PAID')
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    // Type assertion for invoices
    type InvoiceData = {
      id: string;
      invoice_number: string;
      contact_name: string;
      contact_email: string | null;
      amount_due: number | string;
      currency_code: string;
      due_date: string;
      reminder_count: number;
      last_reminder_sent_at: string | null;
    };

    for (const invoice of (invoices ?? []) as InvoiceData[]) {
      if (isTrialUser && usageCount >= trialLimit) {
        break;
      }

      const daysOverdue = Math.max(differenceInCalendarDays(new Date(), new Date(invoice.due_date)), 0);
      if (daysOverdue <= 0) continue;

      const reminderType = nextReminderType(daysOverdue, invoice.reminder_count ?? 0, schedule, customIntervals);
      if (!reminderType) continue;

      if (alreadySentToday(invoice.last_reminder_sent_at ?? null)) {
        continue;
      }

      const toEmail = invoice.contact_email || user.email;
      const companyName = user.company_name || user.email;
      const serviceSupabase = createServiceClient();
      const template = await getReminderTemplate(
        reminderType,
        {
          invoice_number: invoice.invoice_number,
          contact_name: invoice.contact_name,
          amount: typeof invoice.amount_due === 'string' ? parseFloat(invoice.amount_due) : invoice.amount_due,
          currency: invoice.currency_code || 'AUD',
          due_date: new Date(invoice.due_date).toLocaleDateString(),
          company_name: companyName,
        },
        serviceSupabase,
        user.id
      );

      try {
        await sendReminderEmail({
          to: toEmail,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        remindersSent += 1;

        // Log to email_history table
        await supabase.from('email_history').insert({
          user_id: user.id,
          sent_at: new Date().toISOString(),
          reminder_type: reminderType,
          send_method: 'automated',
          recipient_email: toEmail,
          status: 'sent',
        });

        await supabase.from('reminder_logs').insert({
          invoice_id: invoice.id,
          user_id: user.id,
          reminder_type: reminderType,
          email_status: 'sent',
        });

        await supabase
          .from('invoices')
          .update({
            last_reminder_sent_at: new Date().toISOString(),
            reminder_count: (invoice.reminder_count ?? 0) + 1,
          })
          .eq('id', invoice.id);

        try {
          await serviceSupabase.rpc('increment_reminder_send_count', {
            target_user: user.id,
            delta: 1,
          });
        } catch (usageError) {
          console.error('[Cron] Failed to increment reminder usage:', usageError);
        }

        if (isTrialUser) {
          usageCount += 1;
          user.reminder_send_count = usageCount;
        }
      } catch (error) {
        remindersFailed += 1;
        await supabase.from('reminder_logs').insert({
          invoice_id: invoice.id,
          user_id: user.id,
          reminder_type: reminderType,
          email_status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
        // Log to email_history table for failed sends
        await supabase.from('email_history').insert({
          user_id: user.id,
          sent_at: new Date().toISOString(),
          reminder_type: reminderType,
          send_method: 'automated',
          recipient_email: toEmail,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  // Update cron run with completion status
  await supabase
    .from('cron_runs')
    .update({
      status: 'success',
      completed_at: new Date().toISOString(),
      reminders_sent: remindersSent,
      reminders_failed: remindersFailed,
      invoices_synced: invoicesSynced,
      syncs_failed: syncsFailed,
      users_processed: (users ?? []).length,
    })
    .eq('id', cronRunId);

  console.log('[Cron] Completed cron run:', cronRunId, {
    remindersSent,
    remindersFailed,
    invoicesSynced,
    syncsFailed,
    usersProcessed: (users ?? []).length,
  });

  return NextResponse.json({ 
    remindersSent, 
    remindersFailed, 
    invoicesSynced, 
    syncsFailed,
    usersProcessed: (users ?? []).length 
  });
}

