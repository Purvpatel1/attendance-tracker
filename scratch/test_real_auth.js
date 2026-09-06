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

async function runTest() {
  const email = `teststudent${Date.now()}@gmail.com`;
  const password = 'Password123!';
  const fullName = 'Test Student';
  const rollNumber = '21IT001';
  const branch = 'Information Technology (IT)';
  const batch = 'IT1';

  console.log('1. SIGNING UP with:', email);
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
    console.error('SignUp Error:', signUpErr);
    return;
  }

  console.log('SignUp Success!');
  console.log('SignUp User:', signUpData.user?.id);
  console.log('SignUp Session:', signUpData.session ? 'PRESENT' : 'NULL');

  // If session is null, let's see if signInWithPassword works right after signup
  if (!signUpData.session) {
    console.log('Session is null, trying signInWithPassword...');
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('SignIn after SignUp error:', signInErr);
    console.log('SignIn after SignUp session:', signInData?.session ? 'PRESENT' : 'NULL');
  }

  // Check profiles table insertion
  const { data: prof, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', signUpData.user.id);
  console.log('Profile query result:', prof, 'Error:', profErr);

  // Now test LOGOUT and RE-SIGNIN
  console.log('\n2. LOGGING OUT...');
  await supabase.auth.signOut();

  console.log('\n3. SIGNING IN AGAIN with existing credentials...');
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log('Re-SignIn Error:', loginErr);
  console.log('Re-SignIn User:', loginData?.user?.id);
  console.log('Re-SignIn Session:', loginData?.session ? 'PRESENT' : 'NULL');

  if (loginData?.user) {
    // Fetch profile
    const { data: prof2, error: profErr2 } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .maybeSingle();
    console.log('Re-SignIn Profile fetch:', prof2, 'Error:', profErr2);
  }
}

runTest();
