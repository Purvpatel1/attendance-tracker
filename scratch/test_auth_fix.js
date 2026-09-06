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

async function testFullAuthFlow() {
  const email = `student_${Date.now()}@college.edu`;
  const password = 'Password123!';
  const fullName = 'Test Student';
  const rollNumber = '26CE099';
  const branch = 'Computer Engineering (CE)';
  const batch = 'CE1';

  console.log('1. Attempting signUp for:', email);
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
    console.error('signUp Failed:', signUpErr);
    return;
  }

  console.log('signUp Success. User ID:', signUpData?.user?.id);
  console.log('Initial Session Present?:', Boolean(signUpData?.session));

  let activeSession = signUpData?.session;
  let activeUser = signUpData?.user;

  // If no initial session (e.g. if email confirmation was enabled or session delayed), perform signInWithPassword
  if (!activeSession) {
    console.log('2. No immediate session. Attempting auto signInWithPassword...');
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInErr) {
      console.error('auto signIn Failed:', signInErr);
    } else {
      activeSession = signInData.session;
      activeUser = signInData.user;
      console.log('auto signIn Success! Active Session JWT Present:', Boolean(activeSession));
    }
  }

  if (activeUser) {
    console.log('3. Fetching profile from DB for User ID:', activeUser.id);
    // Give DB trigger a tiny 300ms window if needed
    await new Promise((r) => setTimeout(r, 300));

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', activeUser.id)
      .single();

    console.log('Profile DB Result:', profile);
    console.log('Profile DB Error:', pErr?.message);
  }
}

testFullAuthFlow();
