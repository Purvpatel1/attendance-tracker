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

async function checkAllBranchSubjects() {
  const branches = [
    'Computer Engineering (CE)',
    'Computer Science & Engineering (CSE)',
    'Computer Science Engineering-AIML (AIML)',
    'Information Technology (IT)',
  ];

  const email = `test_all_subj_${Date.now()}@example.com`;
  const password = 'Password123!';

  const { data: signUpData } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Test All Subj Student',
        roll_number: '26ALL001',
        branch: 'Computer Engineering (CE)',
        batch: 'CE1',
      },
    },
  });

  let session = signUpData?.session;
  if (!session && signUpData?.user) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
    session = signInData?.session;
  }

  for (const b of branches) {
    const { data: subjects, error: subErr } = await supabase
      .from('subjects')
      .select('*')
      .eq('branch', b);

    console.log(`\nBranch: "${b}" -> ${subjects?.length || 0} subjects returned.`);
    if (subjects && subjects.length > 0) {
      subjects.forEach(s => {
        console.log(`  - [${s.id}] ${s.name} (${s.code}) | Type: ${s.type} | Batch: ${s.batch}`);
      });
    }
  }
}

checkAllBranchSubjects().catch(console.error);
