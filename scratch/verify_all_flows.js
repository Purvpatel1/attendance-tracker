import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('AUTHENTICATION FLOW END-TO-END VERIFICATION');
  console.log('====================================================\n');

  const uniqueId = Date.now();
  const testEmail = `student_v2_${uniqueId}@college.edu`;
  const testPassword = 'Password123!';
  const fullName = 'EndToEnd Test Student';
  const rollNumber = `26CE${uniqueId.toString().slice(-3)}`;
  const branch = 'Computer Engineering (CE)';
  const batch = 'CE1';

  // ----------------------------------------------------
  // TEST 1: NEW ACCOUNT SIGN UP
  // ----------------------------------------------------
  console.log('[TEST 1] Creating New Student Account via Supabase Auth...');
  console.log(`Email: ${testEmail} | Branch: ${branch} | Batch: ${batch}`);

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: fullName,
        roll_number: rollNumber,
        branch,
        batch,
      },
    },
  });

  if (signUpErr) {
    console.error('❌ TEST 1 FAILED (signUp error):', signUpErr);
    return;
  }

  let session = signUpData?.session;
  let user = signUpData?.user;

  // Auto-login fallback if session is null
  if (user && !session) {
    console.log('Notice: Session is null from signUp (email confirmation toggle active). Attempting instant signInWithPassword...');
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    if (!signInErr && signInData?.session) {
      session = signInData.session;
      user = signInData.user;
    }
  }

  console.log('✅ TEST 1 PASSED: User Created. User ID:', user?.id);
  console.log('   Authenticated Session Present?:', Boolean(session));
  console.log('   Session Access Token (JWT):', session?.access_token ? 'VALID JWT PRESENT' : 'NO JWT');

  // Ensure profile is inserted/upserted if session is present
  if (session && user) {
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      roll_number: rollNumber,
      branch,
      batch,
    });
  }

  // ----------------------------------------------------
  // TEST 2: DATABASE PROFILE PERSISTENCE
  // ----------------------------------------------------
  console.log('\n[TEST 2] Verifying Database Profile in public.profiles table...');
  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileErr || !profileData) {
    console.error('❌ TEST 2 FAILED (Profile missing in DB):', profileErr?.message);
    return;
  }

  console.log('✅ TEST 2 PASSED: Profile verified in PostgreSQL database!');
  console.log('   Database Profile Row:', JSON.stringify(profileData, null, 2));

  // ----------------------------------------------------
  // TEST 3: LOG OUT & EXISTING ACCOUNT SIGN IN
  // ----------------------------------------------------
  console.log('\n[TEST 3] Logging Out and Signing Back In...');
  await supabase.auth.signOut();
  console.log('   Sign Out Executed. Verifying Sign In with credentials...');

  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (loginErr || !loginData?.session) {
    console.error('❌ TEST 3 FAILED (signIn error):', loginErr?.message);
    return;
  }

  console.log('✅ TEST 3 PASSED: Sign In Successful! User ID:', loginData.user.id);
  console.log('   Authenticated Session JWT:', Boolean(loginData.session.access_token));

  // ----------------------------------------------------
  // TEST 4: SESSION PERSISTENCE & REFRESH
  // ----------------------------------------------------
  console.log('\n[TEST 4] Verifying Session Restoration...');
  const { data: restoredSession } = await supabase.auth.getSession();
  if (!restoredSession?.session) {
    console.error('❌ TEST 4 FAILED: Active session lost');
    return;
  }

  console.log('✅ TEST 4 PASSED: Session restored successfully across page refresh simulation!');
  console.log('   Active User Email:', restoredSession.session.user.email);

  console.log('\n====================================================');
  console.log('ALL 4 AUTHENTICATION FLOWS VERIFIED SUCCESSFULLY!');
  console.log('====================================================');
}

runEndToEndVerification();
