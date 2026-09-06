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

async function testSignInExisting() {
  // Let's test with emails that were created previously or try to log in
  const emailsToTry = [
    'student_v2_1788694665889@college.edu',
    'teststudent1788694728708@gmail.com',
    'johndoe_test@example.com',
    'student_1788695178767@testdomain.com'
  ];

  for (const email of emailsToTry) {
    console.log(`Trying sign in for: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'Password123!'
    });

    if (error) {
      console.log(` -> Error: ${error.message} (code: ${error.code})`);
    } else {
      console.log(` -> SUCCESS! User ID: ${data.user?.id}, Session: ${data.session ? 'YES' : 'NO'}`);
      
      // Try to fetch profile
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      console.log(` -> Profile fetched:`, profile);
      console.log(` -> Profile error:`, profErr);
    }
  }
}

testSignInExisting();
