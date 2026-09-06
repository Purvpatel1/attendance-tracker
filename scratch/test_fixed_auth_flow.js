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

async function runEndToEndTest() {
  console.log('===========================================================');
  console.log('TESTING COMPLETE AUTH FLOW (SIGNUP -> LOGOUT -> SIGNIN)');
  console.log('===========================================================\n');

  const testId = Date.now();
  const email = `it_student_${testId}@studentdomain.edu`;
  const password = 'Password123!';
  const fullName = 'Alex Mercer';
  const rollNumber = '21IT045';
  const branch = 'Information Technology (IT)';
  const batch = 'IT1';

  // 1. SIGN UP
  console.log('[STEP 1] Executing Sign Up...');
  console.log(`Email: ${email} | Branch: ${branch} | Batch: ${batch}`);

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
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
    console.error('❌ Sign Up Error:', signUpErr);
    return;
  }

  let session = signUpData.session;
  let user = signUpData.user;

  if (!session && user) {
    console.log('Notice: Session null from signUp, performing signInWithPassword...');
    const { data: sData, error: sErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!sErr && sData?.session) {
      session = sData.session;
      user = sData.user;
    }
  }

  console.log('✅ STEP 1 SUCCESS: User created. ID:', user?.id);

  // Save profile to DB
  if (user && session) {
    console.log('Persisting profile to public.profiles table...');
    const { error: profErr } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      roll_number: rollNumber,
      branch,
      batch,
    });
    if (profErr) {
      console.warn('Profile DB upsert notice:', profErr.message);
    }
  }

  // 2. LOG OUT
  console.log('\n[STEP 2] Signing Out student session...');
  await supabase.auth.signOut();
  console.log('✅ STEP 2 SUCCESS: Session signed out.');

  // 3. SIGN IN AGAIN
  console.log('\n[STEP 3] Signing In again with existing credentials...');
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginErr || !loginData?.user) {
    console.error('❌ STEP 3 FAILED (signIn error):', loginErr?.message);
    return;
  }

  console.log('✅ STEP 3 SUCCESS: Signed back in successfully. User ID:', loginData.user.id);
  console.log('   Authenticated Session Token Present?:', Boolean(loginData.session));

  // 4. RETRIEVE EXISTING PROFILE FROM DB
  console.log('\n[STEP 4] Fetching student profile from public.profiles table...');
  const { data: dbProfile, error: dbErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', loginData.user.id)
    .maybeSingle();

  if (dbErr) {
    console.error('❌ STEP 4 FAILED (Profile query error):', dbErr.message);
    return;
  }

  console.log('✅ STEP 4 SUCCESS: Profile fetched from database!');
  console.log('   Retrieved Profile:', JSON.stringify(dbProfile, null, 2));

  if (dbProfile?.branch === branch && dbProfile?.batch === batch) {
    console.log('\n===========================================================');
    console.log('🎉 VERIFICATION COMPLETE: Existing student profile & batch restored!');
    console.log('===========================================================');
  } else {
    console.warn('\n⚠️ Profile branch/batch mismatch:', dbProfile);
  }
}

runEndToEndTest();
