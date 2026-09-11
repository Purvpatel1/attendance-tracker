-- ========================================================
-- STUDENT ATTENDANCE TRACKER V2 - PHASE 4B FINAL MIGRATION
-- Extra Lecture Support Schema, Constraints, Trigger & RLS
-- ========================================================

-- 1. Create Extra Lectures Table
CREATE TABLE IF NOT EXISTS public.extra_lectures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookup by student & date
CREATE INDEX IF NOT EXISTS idx_extra_lectures_student_date 
  ON public.extra_lectures(student_id, date);

-- 2. Modify attendance_logs Table
ALTER TABLE public.attendance_logs 
  ALTER COLUMN slot_id DROP NOT NULL;

ALTER TABLE public.attendance_logs 
  ADD COLUMN IF NOT EXISTS extra_lecture_id UUID REFERENCES public.extra_lectures(id) ON DELETE CASCADE;

-- 3. Source CHECK Constraint
ALTER TABLE public.attendance_logs 
  DROP CONSTRAINT IF EXISTS check_attendance_log_source;

ALTER TABLE public.attendance_logs 
  ADD CONSTRAINT check_attendance_log_source 
  CHECK (
    (slot_id IS NOT NULL AND extra_lecture_id IS NULL) OR 
    (slot_id IS NULL AND extra_lecture_id IS NOT NULL)
  );

-- 4. Unique Constraints
ALTER TABLE public.attendance_logs 
  DROP CONSTRAINT IF EXISTS unique_student_hourly_attendance_entry;

ALTER TABLE public.attendance_logs 
  DROP CONSTRAINT IF EXISTS unique_student_recurring_hourly_log;

ALTER TABLE public.attendance_logs 
  DROP CONSTRAINT IF EXISTS unique_student_extra_hourly_log;

-- Constraint for recurring timetable slots
ALTER TABLE public.attendance_logs 
  ADD CONSTRAINT unique_student_recurring_hourly_log 
  UNIQUE (student_id, date, slot_id, hour_index);

-- Constraint for extra lectures
ALTER TABLE public.attendance_logs 
  ADD CONSTRAINT unique_student_extra_hourly_log 
  UNIQUE (student_id, date, extra_lecture_id, hour_index);

-- 5. Hardened Ownership & Subject Matching Verification Trigger
CREATE OR REPLACE FUNCTION public.verify_attendance_log_ownership()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.extra_lecture_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.extra_lectures
      WHERE id = NEW.extra_lecture_id
        AND student_id = NEW.student_id
        AND subject_id = NEW.subject_id
    ) THEN
      RAISE EXCEPTION
        'Security Violation: extra lecture does not belong to student or subject';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verify_attendance_log_ownership ON public.attendance_logs;
CREATE TRIGGER trg_verify_attendance_log_ownership
  BEFORE INSERT OR UPDATE ON public.attendance_logs
  FOR EACH ROW EXECUTE FUNCTION public.verify_attendance_log_ownership();

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.extra_lectures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own extra lectures" ON public.extra_lectures;
CREATE POLICY "Students can view own extra lectures" ON public.extra_lectures
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can insert own extra lectures" ON public.extra_lectures;
CREATE POLICY "Students can insert own extra lectures" ON public.extra_lectures
  FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    subject_id IN (
      SELECT s.id FROM public.subjects s
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE s.branch = p.branch 
        AND (s.batch = 'ALL' OR s.batch = p.batch)
    )
  );

DROP POLICY IF EXISTS "Students can update own extra lectures" ON public.extra_lectures;
CREATE POLICY "Students can update own extra lectures" ON public.extra_lectures
  FOR UPDATE
  USING (
    auth.uid() = student_id
  )
  WITH CHECK (
    auth.uid() = student_id
    AND subject_id IN (
      SELECT s.id
      FROM public.subjects s
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE s.branch = p.branch
        AND (s.batch = 'ALL' OR s.batch = p.batch)
    )
  );

DROP POLICY IF EXISTS "Students can delete own extra lectures" ON public.extra_lectures;
CREATE POLICY "Students can delete own extra lectures" ON public.extra_lectures
  FOR DELETE USING (auth.uid() = student_id);

-- Attendance logs delete policy (allows unmarking attendance)
DROP POLICY IF EXISTS "Students can delete own attendance logs" ON public.attendance_logs;
CREATE POLICY "Students can delete own attendance logs" ON public.attendance_logs
  FOR DELETE USING (auth.uid() = student_id);

-- 7. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
