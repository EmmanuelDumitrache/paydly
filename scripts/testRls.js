const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const USERS = [
  {
    email: 'rls.user1@example.com',
    password: 'Password123!'
  },
  {
    email: 'rls.user2@example.com',
    password: 'Password123!'
  }
];

(async () => {
  console.log('--- Ensuring users exist ---');
  for (const user of USERS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    });

    if (error && !error.message?.includes('duplicate key value')) {
      console.error('Failed to create user', user.email, error);
      process.exit(1);
    }

    if (data?.user) {
      console.log('Created user', user.email);
    } else {
      console.log('User already exists', user.email);
    }
  }

  const userRecords = [];
  for (const user of USERS) {
    const { data, error } = await admin
      .from('profiles')
      .select('id, email')
      .eq('email', user.email)
      .maybeSingle();
    if (error || !data) {
      console.error('Failed to fetch profile for', user.email, error);
      process.exit(1);
    }
    userRecords.push({ ...user, id: data.id });
  }

  console.log('--- Inserting invoices for each user ---');
  for (const [index, user] of userRecords.entries()) {
    const invoiceNumber = `RLS-TEST-${index + 1}`;
    const { error } = await admin
      .from('invoices')
      .upsert({
        user_id: user.id,
        xero_invoice_id: `rls-test-${index + 1}`,
        invoice_number: invoiceNumber,
        contact_name: 'Test Contact',
        contact_email: user.email,
        amount_due: 100 * (index + 1),
        total_amount: 100 * (index + 1),
        due_date: '2025-12-01',
        status: 'AUTHORISED'
      }, { onConflict: 'user_id,xero_invoice_id' });
    if (error) {
      console.error('Failed to insert invoice for', user.email, error);
      process.exit(1);
    }
    console.log('Upserted invoice for', user.email);
  }

  console.log('--- Testing access with user 1 ---');
  const user1Client = createClient(url, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  const signIn1 = await user1Client.auth.signInWithPassword({
    email: USERS[0].email,
    password: USERS[0].password
  });
  if (signIn1.error) {
    console.error('User1 sign-in failed', signIn1.error);
    process.exit(1);
  }
  const { data: user1Invoices, error: user1Error } = await user1Client
    .from('invoices')
    .select('invoice_number, user_id');
  console.log('User1 invoices:', user1Invoices);
  console.log('User1 query error:', user1Error);

  console.log('--- Testing access with user 2 ---');
  const user2Client = createClient(url, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  const signIn2 = await user2Client.auth.signInWithPassword({
    email: USERS[1].email,
    password: USERS[1].password
  });
  if (signIn2.error) {
    console.error('User2 sign-in failed', signIn2.error);
    process.exit(1);
  }
  const { data: user2Invoices, error: user2Error } = await user2Client
    .from('invoices')
    .select('invoice_number, user_id');
  console.log('User2 invoices:', user2Invoices);
  console.log('User2 query error:', user2Error);

  console.log('--- Attempting cross access (user1 requesting specific invoice ID from user2) ---');
  const targetInvoice = await admin
    .from('invoices')
    .select('id')
    .eq('user_id', userRecords[1].id)
    .maybeSingle();
  if (!targetInvoice.data) {
    console.error('Could not fetch target invoice for user2');
    process.exit(1);
  }
  const { data: crossData, error: crossError } = await user1Client
    .from('invoices')
    .select('id, user_id')
    .eq('id', targetInvoice.data.id)
    .maybeSingle();
  console.log('Cross access result data:', crossData);
  console.log('Cross access error:', crossError);

  console.log('--- Done ---');
})();
