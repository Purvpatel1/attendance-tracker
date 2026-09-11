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

async function debugDelete() {
  const timestamp = Date.now();
  const email = `test_del_${timestamp}@example.com`;
  const password = 'Password123!';

  const { data: signUpData } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Del Test', roll_number: '26001', branch: 'Information Technology (IT)', batch: 'IT1' } }
  });

  let session = signUpData?.session;
  let user = signUpData?.user;
  if (!session && user) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
    session = signInData?.session;
    user = signInData?.user;
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: 'Del Test',
    roll_number: '26001',
    branch: 'Information Technology (IT)',
    batch: 'IT1',
  });

  const subjectId = '358c360c-1587-4218-8cbb-d17d339fbfe5';

  // 1. Create Extra Lecture
  const { data: exData, error: exErr } = await supabase.from('extra_lectures').insert({
    student_id: user.id,
    subject_id: subjectId,
    date: '2026-09-11',
    start_time: '10:00',
    end_time: '12:00',
  }).select();

  console.log('Extra lecture created:', exData?.[0]?.id, exErr);
  const extraId = exData[0].id;

  // 2. Insert Attendance Log
  const { data: logData, error: logErr } = await supabase.from('attendance_logs').insert({
    student_id: user.id,
    subject_id: subjectId,
    extra_lecture_id: extraId,
    date: '2026-09-11',
    hour_index: 2,
    status: 'PRESENT',
  }).select();

  console.log('Log inserted:', logData?.[0], logErr);

  // 3. Delete Attendance Log
  const { data: delData, error: delErr } = await supabase
    .from('attendance_logs')
    .delete()
    .eq('student_id', user.id)
    .eq('extra_lecture_id', extraId)
    .eq('hour_index', 2)
    .select();

  console.log('Delete result:', { delData, delErr });
}

debugDelete().catch(console.error);
