-- ========================================================
-- STUDENT ATTENDANCE TRACKER V2 - SAFE PHASE 3 MIGRATION
-- Applies only Phase 3 database changes to existing Phase 1 DB
-- ========================================================

-- --------------------------------------------------------
-- 1. UPDATE SUBJECTS TABLE & TYPE CHECK CONSTRAINT
-- --------------------------------------------------------
-- Add optional teacher column if missing
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS teacher TEXT;

-- Update subjects.type check constraint to include Lab, Seminar, and Project
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_type_check;
ALTER TABLE public.subjects ADD CONSTRAINT subjects_type_check 
  CHECK (type IN ('Lecture', 'Practical', 'Tutorial', 'Lab', 'Seminar', 'Project'));

-- --------------------------------------------------------
-- 2. ENSURE ATTENDANCE LOGS RELATIONAL FOREIGN KEYS
-- --------------------------------------------------------
DO $$
BEGIN
  -- Convert subject_id to UUID if it was TEXT in Phase 1
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'attendance_logs' AND column_name = 'subject_id' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.attendance_logs ALTER COLUMN subject_id TYPE UUID USING subject_id::UUID;
  END IF;

  -- Convert slot_id to UUID if it was TEXT in Phase 1
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'attendance_logs' AND column_name = 'slot_id' AND data_type = 'text'
  ) THEN
    ALTER TABLE public.attendance_logs ALTER COLUMN slot_id TYPE UUID USING slot_id::UUID;
  END IF;
END $$;

-- Ensure foreign keys exist on attendance_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' AND table_name = 'attendance_logs' AND constraint_name = 'attendance_logs_subject_id_fkey'
  ) THEN
    ALTER TABLE public.attendance_logs 
      ADD CONSTRAINT attendance_logs_subject_id_fkey 
      FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' AND table_name = 'attendance_logs' AND constraint_name = 'attendance_logs_slot_id_fkey'
  ) THEN
    ALTER TABLE public.attendance_logs 
      ADD CONSTRAINT attendance_logs_slot_id_fkey 
      FOREIGN KEY (slot_id) REFERENCES public.timetable_slots(id) ON DELETE CASCADE;
  END IF;
END $$;

-- --------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR PHASE 3
-- --------------------------------------------------------

-- Enable RLS (idempotent)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Subjects RLS Policy (SELECT only for authenticated students)
DROP POLICY IF EXISTS "Authenticated users can view subjects" ON public.subjects;
CREATE POLICY "Authenticated users can view subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);

-- Timetable Slots RLS Policy (SELECT only for authenticated students)
DROP POLICY IF EXISTS "Authenticated users can view timetable slots" ON public.timetable_slots;
CREATE POLICY "Authenticated users can view timetable slots" ON public.timetable_slots
  FOR SELECT TO authenticated USING (true);

-- Attendance Logs RLS Policies (Student-scoped SELECT, INSERT, UPDATE)
DROP POLICY IF EXISTS "Students can view own attendance logs" ON public.attendance_logs;
CREATE POLICY "Students can view own attendance logs" ON public.attendance_logs
  FOR SELECT TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can insert own attendance logs" ON public.attendance_logs;
CREATE POLICY "Students can insert own attendance logs" ON public.attendance_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can update own attendance logs" ON public.attendance_logs;
CREATE POLICY "Students can update own attendance logs" ON public.attendance_logs
  FOR UPDATE TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Safely remove delete policy if it existed previously
DROP POLICY IF EXISTS "Students can delete own attendance logs" ON public.attendance_logs;
