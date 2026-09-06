import { createClient } from '@supabase/supabase-js';

const url = 'https://dbljekkyenasgffgyedp.supabase.co';
const key = 'sb_publishable_BfzrvZ1vXWlzIm7dF2-qrw_tNaDxk_D';

console.log('Connecting to Supabase at:', url);
const supabase = createClient(url, key);

async function check() {
  const { data: subjects, error: subErr } = await supabase.from('subjects').select('*');
  console.log('Subjects query result:', { count: subjects?.length, subErr });
  if (subjects && subjects.length > 0) {
    console.log('Sample subject:', subjects[0]);
  }

  const { data: slots, error: slotErr } = await supabase.from('timetable_slots').select('*');
  console.log('Slots query result:', { count: slots?.length, slotErr });
  if (slots && slots.length > 0) {
    console.log('Sample slot:', slots[0]);
  }
}

check();
