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

async function testSubjectInsert() {
  const email = `auth_test_sub_${Date.now()}@example.com`;
  const password = 'Password123!';

  const { data: sData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Sub Test', branch: 'Computer Engineering (CE)', batch: 'CE1' } }
  });

  let user = sData?.user;
  let session = sData?.session;

  if (!session && user) {
    const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
    session = loginData?.session;
    user = loginData?.user;
  }

  console.log('Authenticated user:', user?.id);

  // Check if subjects table has rows
  const { data: existingSub, error: subQueryErr } = await supabase.from('subjects').select('*');
  console.log('Existing subjects in DB:', existingSub, 'Query Error:', subQueryErr);

  // Try inserting subject
  const { data: insSub, error: insErr } = await supabase.from('subjects').insert({
    branch: 'Computer Engineering (CE)',
    batch: 'CE1',
    code: '26AF1245PC501',
    name: 'Machine Learning',
    type: 'Lecture'
  }).select();

  console.log('Insert Subject Result:', insSub);
  console.log('Insert Subject Error:', insErr);
}

testSubjectInsert();
