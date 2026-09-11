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

import { SUBJECTS_BY_BRANCH } from '../src/data/timetableData.js';
import { getSubjectUuid } from '../src/services/attendanceService.js';

async function fetchEligibleSubjects(branch, batch) {
  if (!branch) return [];

  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('branch', branch)
      .order('name', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.filter(
        (sub) => sub.branch === branch && (sub.batch === 'ALL' || sub.batch === batch)
      );
    }
  } catch (err) {
    console.warn('Network or DB error fetching subjects:', err.message);
  }

  const branchSubjects = SUBJECTS_BY_BRANCH[branch] || [];
  const resolved = await Promise.all(
    branchSubjects
      .filter((s) => !s.batch || s.batch === 'ALL' || s.batch === batch)
      .map(async (sub) => {
        const id = await getSubjectUuid(branch, sub.code);
        return {
          ...sub,
          id,
          branch,
          batch: sub.batch || 'ALL',
        };
      })
  );
  return resolved;
}

async function testAllPairs() {
  console.log('========================================================');
  console.log('TESTING ELIGIBLE SUBJECTS FOR ALL BRANCHES & BATCHES');
  console.log('========================================================\n');

  // Sign in a student to have authenticated RLS access
  const email = `test_elig_${Date.now()}@example.com`;
  const password = 'Password123!';
  const { data: signUpData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Test Elig', roll_number: '26001', branch: 'Information Technology (IT)', batch: 'IT1' } }
  });

  let session = signUpData?.session;
  if (!session && signUpData?.user) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
    session = signInData?.session;
  }

  const testCases = [
    { branch: 'Information Technology (IT)', batch: 'IT1' },
    { branch: 'Information Technology (IT)', batch: 'IT2' },
    { branch: 'Computer Engineering (CE)', batch: 'CE1' },
    { branch: 'Computer Science & Engineering (CSE)', batch: 'CSE2' },
    { branch: 'Computer Science Engineering-AIML (AIML)', batch: 'AM1' },
  ];

  for (const tc of testCases) {
    const res = await fetchEligibleSubjects(tc.branch, tc.batch);
    console.log(`\nBranch: "${tc.branch}" | Batch: "${tc.batch}"`);
    console.log(`  Count: ${res.length}`);
    res.forEach((s) => {
      console.log(`   - [${s.id}] ${s.name} (${s.code}) | Batch: ${s.batch}`);
    });

    // Verify IT has Minor ML and Minor ML Lab
    if (tc.branch === 'Information Technology (IT)') {
      const hasMinorML = res.some((s) => s.name.includes('Minor Machine Learning'));
      const hasMLLab = res.some((s) => s.name.includes('Minor Machine Learning Lab'));
      console.log(`   --> IT Minor ML Present?: ${hasMinorML}`);
      console.log(`   --> IT Minor ML Lab Present?: ${hasMLLab}`);
    }
  }
}

testAllPairs().catch(console.error);
