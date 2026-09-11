-- ========================================================
-- STUDENT ATTENDANCE TRACKER V2 - HOUR-BY-HOUR MIGRATION
-- Adds hour_index and updates uniqueness constraint safely
-- ========================================================

-- 1. Add hour_index column to attendance_logs with default 1
ALTER TABLE public.attendance_logs 
  ADD COLUMN IF NOT EXISTS hour_index INT DEFAULT 1 NOT NULL;

-- 2. Drop old single-slot uniqueness constraint if exists
ALTER TABLE public.attendance_logs 
  DROP CONSTRAINT IF EXISTS unique_student_attendance_entry;

-- 3. Add hour-based uniqueness constraint
ALTER TABLE public.attendance_logs 
  DROP CONSTRAINT IF EXISTS unique_student_hourly_attendance_entry;

ALTER TABLE public.attendance_logs 
  ADD CONSTRAINT unique_student_hourly_attendance_entry 
  UNIQUE (student_id, date, slot_id, subject_id, hour_index);

-- 4. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';

