import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SUBJECTS_BY_BRANCH, TIMETABLE_SLOTS_BY_BRANCH } from '../src/data/timetableData.js';

// Synchronous SHA-256 deterministic UUID generator (identical output in Node and Browser)
export function stringToUuid(str) {
  const hash = crypto.createHash('sha256').update(str, 'utf8').digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

let seedSql = `-- ========================================================\n`;
seedSql += `-- ATTENDANCE TRACKER V2 - CANONICAL SEED DATA\n`;
seedSql += `-- Populates public.subjects and public.timetable_slots from timetableData.js\n`;
seedSql += `-- ========================================================\n\n`;

// 1. Subjects
seedSql += `-- --------------------------------------------------------\n`;
seedSql += `-- 1. SUBJECTS SEED DATA\n`;
seedSql += `-- --------------------------------------------------------\n`;

const seededSubjectIds = new Map(); // key: branch:code -> uuid

for (const [branch, subjects] of Object.entries(SUBJECTS_BY_BRANCH)) {
  seedSql += `\n-- Branch: ${branch}\n`;
  for (const s of subjects) {
    const key = `${branch}:${s.code}`;
    const id = stringToUuid(key);
    seededSubjectIds.set(key, id);

    const teacherVal = s.teacher ? `'${s.teacher.replace(/'/g, "''")}'` : 'NULL';
    const nameVal = s.name.replace(/'/g, "''");
    const codeVal = s.code;
    const typeVal = s.type;

    seedSql += `INSERT INTO public.subjects (id, branch, batch, code, name, type, teacher)\n`;
    seedSql += `VALUES ('${id}', '${branch.replace(/'/g, "''")}', 'ALL', '${codeVal}', '${nameVal}', '${typeVal}', ${teacherVal})\n`;
    seedSql += `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, teacher = EXCLUDED.teacher;\n`;
  }
}

// 2. Timetable Slots
seedSql += `\n-- --------------------------------------------------------\n`;
seedSql += `-- 2. TIMETABLE SLOTS SEED DATA\n`;
seedSql += `-- --------------------------------------------------------\n`;

for (const [branch, slots] of Object.entries(TIMETABLE_SLOTS_BY_BRANCH)) {
  seedSql += `\n-- Branch: ${branch}\n`;
  slots.forEach((slot, index) => {
    const subjectKey = `${branch}:${slot.code}`;
    const subjectId = seededSubjectIds.get(subjectKey);

    if (!subjectId) {
      console.error(`ERROR: Subject ID not found for ${subjectKey}`);
      return;
    }

    const slotSeed = `${branch}:${slot.batchScope}:${slot.dayOfWeek}:${slot.startTime}:${slot.endTime}:${slot.code}`;
    const slotId = stringToUuid(slotSeed);
    const roomVal = slot.room ? `'${slot.room.replace(/'/g, "''")}'` : 'NULL';

    seedSql += `INSERT INTO public.timetable_slots (id, branch, batch, day_of_week, start_time, end_time, subject_id, room_no)\n`;
    seedSql += `VALUES ('${slotId}', '${branch.replace(/'/g, "''")}', '${slot.batchScope}', ${slot.dayOfWeek}, '${slot.startTime}:00', '${slot.endTime}:00', '${subjectId}', ${roomVal})\n`;
    seedSql += `ON CONFLICT (id) DO NOTHING;\n`;
  });
}

const outputPath = path.resolve(process.cwd(), 'supabase/seed.sql');
fs.writeFileSync(outputPath, seedSql, 'utf8');
console.log(`Successfully generated seed.sql at ${outputPath}`);
