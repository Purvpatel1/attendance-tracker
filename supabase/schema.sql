-- ========================================================
-- STUDENT ATTENDANCE TRACKER V2 - SUPABASE DATABASE SCHEMA
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. PROFILES TABLE (Student Profile)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  roll_number TEXT,
  branch TEXT NOT NULL,
  batch TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------
-- 2. SUBJECTS TABLE (Branch & Batch Curriculum)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY,
  branch TEXT NOT NULL,
  batch TEXT NOT NULL DEFAULT 'ALL',
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Lecture', 'Practical', 'Tutorial', 'Lab', 'Seminar', 'Project')),
  teacher TEXT,
  target_percentage NUMERIC DEFAULT 75.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by branch and batch
CREATE INDEX IF NOT EXISTS idx_subjects_branch_batch ON public.subjects(branch, batch);

-- --------------------------------------------------------
-- 3. TIMETABLE SLOTS TABLE (Weekly Schedule Slots)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.timetable_slots (
  id UUID PRIMARY KEY,
  branch TEXT NOT NULL,
  batch TEXT NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  room_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering slots by branch, batch, and day
CREATE INDEX IF NOT EXISTS idx_timetable_slots_schedule ON public.timetable_slots(branch, batch, day_of_week);

-- --------------------------------------------------------
-- 4. EXTRA LECTURES TABLE (Student One-off Classes)
-- --------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_extra_lectures_student_date 
  ON public.extra_lectures(student_id, date);

-- --------------------------------------------------------
-- 5. ATTENDANCE LOGS TABLE (Student Records)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  slot_id UUID REFERENCES public.timetable_slots(id) ON DELETE CASCADE,
  extra_lecture_id UUID REFERENCES public.extra_lectures(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour_index INT DEFAULT 1 NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'CANCELLED')),
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Single source constraint
  CONSTRAINT check_attendance_log_source CHECK (
    (slot_id IS NOT NULL AND extra_lecture_id IS NULL) OR 
    (slot_id IS NULL AND extra_lecture_id IS NOT NULL)
  ),
  
  -- Composite unique constraints
  CONSTRAINT unique_student_recurring_hourly_log UNIQUE (student_id, date, slot_id, hour_index),
  CONSTRAINT unique_student_extra_hourly_log UNIQUE (student_id, date, extra_lecture_id, hour_index)
);

-- Index for fetching student attendance records
CREATE INDEX IF NOT EXISTS idx_attendance_logs_student ON public.attendance_logs(student_id, date);

-- Ownership verification trigger for extra lecture logs
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

-- --------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extra_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Students can read, insert, and update only their own profile
CREATE POLICY "Students can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Students can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Subjects & Timetable Slots: Authenticated students can only view curriculum (SELECT only)
CREATE POLICY "Authenticated users can view subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view timetable slots" ON public.timetable_slots
  FOR SELECT TO authenticated USING (true);

-- Extra Lectures: Students manage only their own extra lectures for their curriculum
CREATE POLICY "Students can view own extra lectures" ON public.extra_lectures
  FOR SELECT USING (auth.uid() = student_id);

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

CREATE POLICY "Students can delete own extra lectures" ON public.extra_lectures
  FOR DELETE USING (auth.uid() = student_id);

-- Attendance Logs: Students can manage ONLY their own attendance records
CREATE POLICY "Students can view own attendance logs" ON public.attendance_logs
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own attendance logs" ON public.attendance_logs
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own attendance logs" ON public.attendance_logs
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can delete own attendance logs" ON public.attendance_logs
  FOR DELETE USING (auth.uid() = student_id);

-- --------------------------------------------------------
-- 6. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, roll_number, branch, batch)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'roll_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'branch', 'Computer Engineering (CE)'),
    COALESCE(NEW.raw_user_meta_data->>'batch', 'CE1')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

