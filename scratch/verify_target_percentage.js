import { createClient } from '@supabase/supabase-js';

const url = 'https://dbljekkyenasgffgyedp.supabase.co';
const key = 'sb_publishable_BfzrvZ1vXWlzIm7dF2-qrw_tNaDxk_D';

console.log('Connecting to Supabase at:', url);
const supabase = createClient(url, key);

async function verifyTargetPercentage() {
  const { data: subjects, error } = await supabase.from('subjects').select('*').limit(5);
  
  if (error) {
    console.error('Error querying public.subjects:', error);
    return;
  }

  console.log(`Successfully fetched ${subjects?.length || 0} sample subjects from Supabase.`);
  if (subjects && subjects.length > 0) {
    subjects.forEach((sub, idx) => {
      console.log(`[Subject ${idx + 1}] Code: ${sub.code}, Name: "${sub.name}", target_percentage: ${sub.target_percentage} (type: ${typeof sub.target_percentage})`);
    });
  }
}

verifyTargetPercentage();
