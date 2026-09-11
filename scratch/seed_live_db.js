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

async function seedLiveDatabase() {
  console.log('Seeding public.subjects and public.timetable_slots from seed.sql...');
  
  const seedSqlPath = path.resolve(process.cwd(), 'supabase', 'seed.sql');
  const seedSql = fs.readFileSync(seedSqlPath, 'utf-8');

  // Extract INSERT statements for subjects
  const subjectInserts = [];
  const subjectRegex = /INSERT INTO public\.subjects \((.*?)\)\s*VALUES \((.*?)\)\s*ON CONFLICT/gi;
  let match;
  
  while ((match = subjectRegex.exec(seedSql)) !== null) {
    const rawValues = match[2];
    // parse values: 'id', 'branch', 'batch', 'code', 'name', 'type', 'teacher'
    const parts = rawValues.split(/,\s*(?=(?:[^']*'[^']*')*[^']*$)/).map(s => s.trim().replace(/^'|'$/g, ''));
    if (parts.length >= 7) {
      subjectInserts.push({
        id: parts[0],
        branch: parts[1],
        batch: parts[2],
        code: parts[3],
        name: parts[4],
        type: parts[5],
        teacher: parts[6],
      });
    }
  }

  console.log(`Parsed ${subjectInserts.length} subject rows to seed.`);
  const { data: subData, error: subErr } = await supabase.from('subjects').upsert(subjectInserts);
  if (subErr) {
    console.error('Subject seed error:', subErr);
  } else {
    console.log('✅ public.subjects seeded successfully!');
  }

  // Extract INSERT statements for timetable_slots
  const slotInserts = [];
  const slotRegex = /INSERT INTO public\.timetable_slots \((.*?)\)\s*VALUES \((.*?)\)\s*ON CONFLICT/gi;
  while ((match = slotRegex.exec(seedSql)) !== null) {
    const rawValues = match[2];
    const parts = rawValues.split(/,\s*(?=(?:[^']*'[^']*')*[^']*$)/).map(s => s.trim().replace(/^'|'$/g, ''));
    if (parts.length >= 8) {
      slotInserts.push({
        id: parts[0],
        branch: parts[1],
        batch: parts[2],
        day_of_week: parseInt(parts[3], 10),
        start_time: parts[4],
        end_time: parts[5],
        subject_id: parts[6],
        room_no: parts[7],
      });
    }
  }

  console.log(`Parsed ${slotInserts.length} slot rows to seed.`);
  const { data: slotData, error: slotErr } = await supabase.from('timetable_slots').upsert(slotInserts);
  if (slotErr) {
    console.error('Slot seed error:', slotErr);
  } else {
    console.log('✅ public.timetable_slots seeded successfully!');
  }
}

seedLiveDatabase().catch(console.error);
