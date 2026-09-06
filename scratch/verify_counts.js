import { SUBJECTS_BY_BRANCH, TIMETABLE_SLOTS_BY_BRANCH } from '../src/data/timetableData.js';
import fs from 'fs';

console.log('--- SUBJECTS BREAKDOWN BY BRANCH ---');
let totalSubjects = 0;
for (const [branch, subs] of Object.entries(SUBJECTS_BY_BRANCH)) {
  console.log(`Branch: "${branch}": ${subs.length} subjects`);
  totalSubjects += subs.length;
}
console.log(`TOTAL SUBJECTS IN timetableData.js = ${totalSubjects}`);

console.log('\n--- TIMETABLE SLOTS BREAKDOWN BY BRANCH ---');
let totalSlots = 0;
for (const [branch, slots] of Object.entries(TIMETABLE_SLOTS_BY_BRANCH)) {
  console.log(`Branch: "${branch}": ${slots.length} slots`);
  totalSlots += slots.length;
}
console.log(`TOTAL TIMETABLE SLOTS IN timetableData.js = ${totalSlots}`);

// Check unique codes vs total subject records
const uniqueCodes = new Set();
for (const [branch, subs] of Object.entries(SUBJECTS_BY_BRANCH)) {
  subs.forEach(s => uniqueCodes.add(s.code));
}
console.log(`\nUnique Subject Codes across all branches = ${uniqueCodes.size}`);
console.log(`Total Branch-Specific Subject Records = ${totalSubjects}`);
