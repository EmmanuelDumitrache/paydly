'use server';

import { revalidatePath } from 'next/cache';

function checkboxToBoolean(value: FormDataEntryValue | null) {
  return value === 'on' || value === 'true';
}

export async function updateReminderSchedule(formData: FormData) {
  // Mock implementation for now - will connect to Supabase after database setup
  const updates = {
    day_7_enabled: checkboxToBoolean(formData.get('day_7_enabled')),
    day_14_enabled: checkboxToBoolean(formData.get('day_14_enabled')),
    day_21_enabled: checkboxToBoolean(formData.get('day_21_enabled')),
  };

  console.log('Reminder schedule updated (mock):', updates);

  // Simulate successful update
  await new Promise(resolve => setTimeout(resolve, 100));

  revalidatePath('/settings');

  /* Real Supabase implementation - uncomment when database is ready
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('reminder_settings')
    .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' });

  if (error) {
    throw error;
  }

  revalidatePath('/settings');
  */
}

export async function updateAccountProfile(formData: FormData) {
  // Mock implementation for now - will connect to Supabase after database setup
  const fullName = formData.get('full_name')?.toString().trim() || null;
  const companyName = formData.get('company_name')?.toString().trim() || null;

  console.log('Account profile updated (mock):', { fullName, companyName });

  // Simulate successful update
  await new Promise(resolve => setTimeout(resolve, 100));

  revalidatePath('/settings');

  /* Real Supabase implementation - uncomment when database is ready
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

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
  */
}

