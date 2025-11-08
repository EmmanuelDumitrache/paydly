'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

function checkboxToBoolean(value: FormDataEntryValue | null) {
  return value === 'on' || value === 'true';
}

export async function updateReminderSchedule(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const updates = {
    day_7_enabled: checkboxToBoolean(formData.get('day_7_enabled')),
    day_14_enabled: checkboxToBoolean(formData.get('day_14_enabled')),
    day_21_enabled: checkboxToBoolean(formData.get('day_21_enabled')),
  };

  const { error } = await supabase
    .from('reminder_settings')
    .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });

  if (error) {
    throw error;
  }

  revalidatePath('/settings');
}

export async function updateAccountProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const fullName = formData.get('full_name')?.toString().trim() || null;
  const companyName = formData.get('company_name')?.toString().trim() || null;

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      company_name: companyName,
    })
    .eq('id', user.id);

  if (error) {
    throw error;
  }

  revalidatePath('/settings');
}

