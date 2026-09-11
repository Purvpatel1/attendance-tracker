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

async function testInvestigation() {
  console.log('=== INVESTIGATING SUPABASE DELETE BEHAVIOR ===\n');

  // Create test user and authenticate
  const timestamp = Date.now();
  const email = `test_inv_${timestamp}@example.com`;
  const password = 'Password123!';

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Investigate User', roll_number: '26099', branch: 'Computer Engineering (CE)', batch: 'CE1' } }
  });

  if (signUpError) {
    console.error('Signup Error:', signUpError);
    return;
  }

  let session = signUpData?.session;
  let user = signUpData?.user;
  if (!session && user) {
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      console.error('SignIn Error:', signInErr);
      return;
    }
    session = signInData?.session;
    user = signInData?.user;
  }

  console.log('Authenticated user ID:', user?.id);

  // 1. Check user profile
  await supabase.from('profiles').upsert({
    id: user.id,
    full_name: 'Investigate User',
    roll_number: '26099',
    branch: 'Computer Engineering (CE)',
    batch: 'CE1',
  });

  // Fetch subject
  const { data: subjects } = await supabase.from('subjects').select('*').limit(1);
  const subjectId = subjects[0]?.id;
  console.log('Subject ID:', subjectId);

  // Fetch slot
  const { data: slots } = await supabase.from('timetable_slots').select('*').limit(1);
  const slotId = slots[0]?.id;
  console.log('Slot ID:', slotId);

  // --- TEST A: RECURRING TIMETABLE ATTENDANCE ---
  console.log('\n--- TEST A: Recurring Timetable Attendance ---');
  const recPayload = {
    student_id: user.id,
    subject_id: subjectId,
    slot_id: slotId,
    extra_lecture_id: null,
    date: '2026-09-10',
    hour_index: 1,
    status: 'PRESENT'
  };

  const { data: insRec, error: insRecErr } = await supabase
    .from('attendance_logs')
    .upsert(recPayload, { onConflict: 'student_id,date,slot_id,hour_index' })
    .select();

  console.log('Inserted Recurring Row:', insRec, insRecErr);

  // Now test DELETE for Recurring Row with .select()
  const { data: delRec, error: delRecErr } = await supabase
    .from('attendance_logs')
    .delete()
    .eq('student_id', user.id)
    .eq('date', '2026-09-10')
    .eq('slot_id', slotId)
    .eq('hour_index', 1)
    .select();

  console.log('Delete Recurring Result with .select():', { delRec, delRecErr });

  // Verify if row is still in DB
  const { data: checkRec } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('student_id', user.id)
    .eq('date', '2026-09-10')
    .eq('slot_id', slotId)
    .eq('hour_index', 1);

  console.log('Verification after Recurring Delete (should be []):', checkRec);

  // --- TEST B: EXTRA LECTURE ATTENDANCE ---
  console.log('\n--- TEST B: Extra Lecture Attendance ---');
  const { data: exData, error: exErr } = await supabase.from('extra_lectures').insert({
    student_id: user.id,
    subject_id: subjectId,
    date: '2026-09-10',
    start_time: '14:00',
    end_time: '16:00'
  }).select();

  console.log('Created Extra Lecture:', exData?.[0], exErr);
  const extraId = exData?.[0]?.id;

  if (extraId) {
    const extraPayload = {
      student_id: user.id,
      subject_id: subjectId,
      slot_id: null,
      extra_lecture_id: extraId,
      date: '2026-09-10',
      hour_index: 2,
      status: 'ABSENT'
    };

    const { data: insExtra, error: insExtraErr } = await supabase
      .from('attendance_logs')
      .upsert(extraPayload, { onConflict: 'student_id,date,extra_lecture_id,hour_index' })
      .select();

    console.log('Inserted Extra Lecture Log:', insExtra, insExtraErr);

    // Delete Extra Lecture Log
    const { data: delExtra, error: delExtraErr } = await supabase
      .from('attendance_logs')
      .delete()
      .eq('student_id', user.id)
      .eq('date', '2026-09-10')
      .eq('extra_lecture_id', extraId)
      .eq('hour_index', 2)
      .select();

    console.log('Delete Extra Result with .select():', { delExtra, delExtraErr });

    // Verify if row is still in DB
    const { data: checkExtra } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('student_id', user.id)
      .eq('date', '2026-09-10')
      .eq('extra_lecture_id', extraId)
      .eq('hour_index', 2);

    console.log('Verification after Extra Delete (should be []):', checkExtra);
  }
}

testInvestigation().catch(console.error);
