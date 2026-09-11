import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach((line) => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const { supabase } = await import('../src/lib/supabaseClient.js');

async function testExtraLectureDelete() {
  console.log('--- Testing DELETE on extra_lectures vs attendance_logs ---');

  const timestamp = Date.now();
  const email = `test_del_ex_${timestamp}@example.com`;
  const password = 'Password123!';

  const { data: signUpData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Del Ex User', roll_number: '26097', branch: 'Computer Engineering (CE)', batch: 'CE1' } }
  });

  let user = signUpData?.user;
  if (!signUpData?.session && user) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
    user = signInData?.user;
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: 'Del Ex User',
    roll_number: '26097',
    branch: 'Computer Engineering (CE)',
    batch: 'CE1',
  });

  const { data: subjects } = await supabase.from('subjects').select('id').limit(1);
  const subjectId = subjects[0].id;

  // 1. Create Extra Lecture
  const { data: exData, error: exErr } = await supabase.from('extra_lectures').insert({
    student_id: user.id,
    subject_id: subjectId,
    date: '2026-09-12',
    start_time: '14:00',
    end_time: '16:00',
  }).select();

  console.log('Extra Lecture Created:', exData?.[0]?.id, exErr);
  const extraId = exData?.[0]?.id;

  // 2. Delete Extra Lecture
  const { data: delExData, error: delExErr } = await supabase
    .from('extra_lectures')
    .delete()
    .eq('id', extraId)
    .select();

  console.log('Extra Lecture Delete Result:', { delExData, delExErr });
}

testExtraLectureDelete().catch(console.error);
