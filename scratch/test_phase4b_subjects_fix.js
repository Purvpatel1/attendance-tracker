import fs from 'fs';
import path from 'path';

// 1. Load .env BEFORE importing application modules
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const { supabase } = await import('../src/lib/supabaseClient.js');
const { fetchEligibleSubjects } = await import('../src/services/extraLectureService.js');

let totalTests = 0;
let passTests = 0;

function assert(desc, condition, detail = '') {
  totalTests++;
  if (condition) {
    passTests++;
    console.log(`✅ [PASS] Test ${totalTests}: ${desc} ${detail ? `(${detail})` : ''}`);
  } else {
    console.log(`❌ [FAIL] Test ${totalTests}: ${desc} ${detail ? `(${detail})` : ''}`);
  }
}

async function runVerification() {
  console.log('========================================================');
  console.log('PHASE 4B SUBJECT ELIGIBILITY VERIFICATION (SINGLE SOURCE DB)');
  console.log('========================================================\n');

  // Authenticate student to satisfy RLS SELECT policy
  const email = `test_subj_pure_${Date.now()}@example.com`;
  const password = 'Password123!';
  const { data: signUpData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Pure DB Test Student', roll_number: '26IT100', branch: 'Information Technology (IT)', batch: 'IT1' } },
  });

  let session = signUpData?.session;
  if (!session && signUpData?.user) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
    session = signInData?.session;
  }

  // 1. IT + IT1 Verification
  const it1Subjects = await fetchEligibleSubjects('Information Technology (IT)', 'IT1');
  assert('IT + IT1 returns eligible subjects from Supabase DB', it1Subjects.length === 11, `Count: ${it1Subjects.length}`);
  
  const hasMinorML = it1Subjects.some(s => s.name === 'Minor Machine Learning');
  const hasMinorMLLab = it1Subjects.some(s => s.name === 'Minor Machine Learning Lab');
  assert('IT + IT1 includes Minor Machine Learning', hasMinorML, 'Minor ML present');
  assert('IT + IT1 includes Minor Machine Learning Lab', hasMinorMLLab, 'Minor ML Lab present');

  // 2. Branch/Batch-Generic Verification (CE + CE1/CE2, CSE + CSE1/CSE2, AIML + AM1/AM2, IT + IT1/IT2)
  const ce1Subjects = await fetchEligibleSubjects('Computer Engineering (CE)', 'CE1');
  const cse2Subjects = await fetchEligibleSubjects('Computer Science & Engineering (CSE)', 'CSE2');
  const aiml1Subjects = await fetchEligibleSubjects('Computer Science Engineering-AIML (AIML)', 'AM1');
  const it2Subjects = await fetchEligibleSubjects('Information Technology (IT)', 'IT2');

  assert('CE + CE1 returns 11 eligible subjects from Supabase DB', ce1Subjects.length === 11, `Count: ${ce1Subjects.length}`);
  assert('CSE + CSE2 returns 11 eligible subjects from Supabase DB', cse2Subjects.length === 11, `Count: ${cse2Subjects.length}`);
  assert('AIML + AM1 returns 11 eligible subjects from Supabase DB', aiml1Subjects.length === 11, `Count: ${aiml1Subjects.length}`);
  assert('IT + IT2 returns 11 eligible subjects from Supabase DB', it2Subjects.length === 11, `Count: ${it2Subjects.length}`);

  // 3. Strict Branch Isolation Verification (No unrelated-branch subjects appear)
  const itHasCeSubject = it1Subjects.some(s => s.branch && s.branch !== 'Information Technology (IT)');
  const ceHasItSubject = ce1Subjects.some(s => s.branch && s.branch !== 'Computer Engineering (CE)');
  assert('IT subjects contain zero non-IT subjects', !itHasCeSubject);
  assert('CE subjects contain zero non-CE subjects', !ceHasItSubject);

  console.log('\n========================================================');
  console.log(`RESULTS: ${passTests} / ${totalTests} PASSED`);
  console.log('========================================================\n');
}

runVerification().catch(console.error);
