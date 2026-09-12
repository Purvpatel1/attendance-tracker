/**
 * Helper to determine whether a student profile has all required mandatory fields.
 * Returns true only if full_name, roll_number, branch, and batch are non-empty strings.
 */
export function isProfileComplete(profile) {
  if (!profile) return false;

  const hasName = Boolean(profile.full_name && String(profile.full_name).trim().length > 0);
  const hasRoll = Boolean(profile.roll_number && String(profile.roll_number).trim().length > 0);
  const hasBranch = Boolean(profile.branch && String(profile.branch).trim().length > 0);
  const hasBatch = Boolean(profile.batch && String(profile.batch).trim().length > 0);

  return hasName && hasRoll && hasBranch && hasBatch;
}
