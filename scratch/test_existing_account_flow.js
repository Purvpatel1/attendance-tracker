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

async function testFullFlow() {
  const email = `student_${Date.now()}@testdomain.com`;
  const password = 'Password123!';
  const fullName = 'Alice Smith';
  const rollNumber = '21IT099';
  const branch = 'Information Technology (IT)';
  const batch = 'IT1';

  console.log('=== 1. SIGN UP ===');
  console.log('Signing up:', email);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, roll_number: rollNumber, branch, batch }
    }
  });

  if (signUpErr) {
    console.error('SignUp Error:', signUpErr);
    return;
  }

  console.log('SignUp Data User ID:', signUpData.user?.id);
  console.log('SignUp Data Session:', signUpData.session ? 'PRESENT' : 'NULL');

  let session = signUpData.session;
  let user = signUpData.user;

  if (!session && user) {
    console.log('Session null from signUp, trying signInWithPassword...');
    const { data: sData, error: sErr } = await supabase.auth.signInWithPassword({ email, password });
    console.log('signInWithPassword error after signUp:', sErr);
    console.log('signInWithPassword session:', sData?.session ? 'PRESENT' : 'NULL');
    if (sData?.session) {
      session = sData.session;
      user = sData.user;
    }
  }

  if (user) {
    // Upsert profile
    console.log('Upserting profile for user:', user.id);
    const { data: pData, error: pErr } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      roll_number: rollNumber,
      branch,
      batch
    }).select();
    console.log('Profile upsert result:', pData, 'Error:', pErr);
  }

  console.log('\n=== 2. LOG OUT ===');
  await supabase.auth.signOut();
  console.log('Logged out successfully.');

  console.log('\n=== 3. SIGN IN AGAIN ===');
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  console.log('Login error:', loginErr);
  console.log('Login User ID:', loginData?.user?.id);
  console.log('Login Session:', loginData?.session ? 'PRESENT' : 'NULL');

  if (loginData?.user) {
    console.log('Fetching profile for logged in user...');
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .maybeSingle();

    console.log('Fetched profile:', profile);
    console.log('Fetch profile error:', profileErr);
  }
}

testFullFlow();
