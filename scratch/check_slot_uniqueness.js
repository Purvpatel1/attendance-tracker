import { TIMETABLE_SLOTS_BY_BRANCH } from '../src/data/timetableData.js';

for (const [branch, slots] of Object.entries(TIMETABLE_SLOTS_BY_BRANCH)) {
  const seeds = new Set();
  const duplicates = [];

  slots.forEach((slot, idx) => {
    const seed = `${branch}:${slot.batchScope}:${slot.dayOfWeek}:${slot.startTime}:${slot.endTime}:${slot.code}`;
    if (seeds.has(seed)) {
      duplicates.push({ idx, seed });
    }
    seeds.add(seed);
  });

  console.log(`Branch ${branch}: Total slots = ${slots.length}, Unique seeds = ${seeds.size}, Duplicates = ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.log('Duplicates in', branch, ':', duplicates);
  }
}
