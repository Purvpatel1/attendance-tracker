-- ========================================================
-- STUDENT ATTENDANCE TRACKER V2 - LOW ATTENDANCE ALERTS SCHEMA
-- Atomic State Machine, Partial Index & Function Security
-- ========================================================

-- 1. Add email_alerts_enabled column to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS email_alerts_enabled BOOLEAN DEFAULT true NOT NULL;

-- 2. Create student_subject_alert_states Table
CREATE TABLE IF NOT EXISTS public.student_subject_alert_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  last_state TEXT NOT NULL CHECK (last_state IN ('ABOVE_THRESHOLD', 'BELOW_THRESHOLD', 'CLAIMED')),
  claimed_at TIMESTAMPTZ,
  last_alerted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_subject_alert UNIQUE (student_id, subject_id)
);

-- 3. Partial Index for Fast Stale Claim Lookup
CREATE INDEX IF NOT EXISTS idx_alert_states_claimed_at
ON public.student_subject_alert_states (claimed_at)
WHERE last_state = 'CLAIMED';

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.student_subject_alert_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own alert states" ON public.student_subject_alert_states;
CREATE POLICY "Students can view own alert states" ON public.student_subject_alert_states
  FOR SELECT USING (auth.uid() = student_id);

-- 5. Atomic Alert Claim Function with 10-Minute Timeout Recovery
CREATE OR REPLACE FUNCTION public.claim_attendance_alert(
  p_student_id UUID,
  p_subject_id UUID,
  p_current_percentage NUMERIC
)
RETURNS TABLE (
  should_alert BOOLEAN,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rec record;
  v_threshold NUMERIC := 75.0;
  v_timeout_interval INTERVAL := INTERVAL '10 minutes';
BEGIN
  -- Row-level locking to prevent concurrent race conditions
  SELECT * INTO v_rec
  FROM public.student_subject_alert_states
  WHERE student_id = p_student_id AND subject_id = p_subject_id
  FOR UPDATE;

  -- 1. INITIAL STATE (no row exists for student & subject)
  IF v_rec IS NULL THEN
    IF p_current_percentage < v_threshold THEN
      INSERT INTO public.student_subject_alert_states (student_id, subject_id, last_state, claimed_at)
      VALUES (p_student_id, p_subject_id, 'CLAIMED', NOW());
      
      RETURN QUERY SELECT true, 'INITIAL_BELOW_THRESHOLD';
      RETURN;
    ELSE
      INSERT INTO public.student_subject_alert_states (student_id, subject_id, last_state, claimed_at)
      VALUES (p_student_id, p_subject_id, 'ABOVE_THRESHOLD', NULL);
      
      RETURN QUERY SELECT false, 'INITIAL_ABOVE_THRESHOLD';
      RETURN;
    END IF;
  END IF;

  -- 2. RECOVERY STATE: Attendance is >= 75%
  IF p_current_percentage >= v_threshold THEN
    UPDATE public.student_subject_alert_states
    SET last_state = 'ABOVE_THRESHOLD',
        claimed_at = NULL,
        updated_at = NOW()
    WHERE student_id = p_student_id AND subject_id = p_subject_id;
    
    RETURN QUERY SELECT false, 'RECOVERED_ABOVE_THRESHOLD';
    RETURN;
  END IF;

  -- 3. BELOW THRESHOLD (< 75%) HANDLING
  IF v_rec.last_state = 'ABOVE_THRESHOLD' THEN
    -- Transition from >=75% to <75%: Atomically claim
    UPDATE public.student_subject_alert_states
    SET last_state = 'CLAIMED',
        claimed_at = NOW(),
        updated_at = NOW()
    WHERE student_id = p_student_id AND subject_id = p_subject_id;
    
    RETURN QUERY SELECT true, 'TRANSITION_BELOW_THRESHOLD';
    RETURN;

  ELSIF v_rec.last_state = 'CLAIMED' THEN
    -- Check if CLAIMED state is stale (> 10 minutes old)
    IF v_rec.claimed_at IS NULL OR (NOW() - v_rec.claimed_at) > v_timeout_interval THEN
      -- Stale claim recovery: allow re-claiming
      UPDATE public.student_subject_alert_states
      SET last_state = 'CLAIMED',
          claimed_at = NOW(),
          updated_at = NOW()
      WHERE student_id = p_student_id AND subject_id = p_subject_id;
      
      RETURN QUERY SELECT true, 'RECLAIMED_STALE_CLAIM';
      RETURN;
    ELSE
      -- Active claim in progress (< 10 minutes)
      RETURN QUERY SELECT false, 'ACTIVE_CLAIM_IN_PROGRESS';
      RETURN;
    END IF;

  ELSE
    -- Already BELOW_THRESHOLD (email was sent successfully previously)
    RETURN QUERY SELECT false, 'ALREADY_ALERTED';
    RETURN;
  END IF;
END;
$$;

-- 6. Confirm Alert Sent Function
CREATE OR REPLACE FUNCTION public.confirm_attendance_alert_sent(
  p_student_id UUID,
  p_subject_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.student_subject_alert_states
  SET last_state = 'BELOW_THRESHOLD',
      claimed_at = NULL,
      last_alerted_at = NOW(),
      updated_at = NOW()
  WHERE student_id = p_student_id AND subject_id = p_subject_id;
END;
$$;

-- 7. Rollback Alert Claim Function (if Resend API fails)
CREATE OR REPLACE FUNCTION public.rollback_attendance_alert_claim(
  p_student_id UUID,
  p_subject_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.student_subject_alert_states
  SET last_state = 'ABOVE_THRESHOLD',
      claimed_at = NULL,
      updated_at = NOW()
  WHERE student_id = p_student_id AND subject_id = p_subject_id;
END;
$$;

-- 8. Function Access Security Restrictions
REVOKE EXECUTE ON FUNCTION public.claim_attendance_alert(UUID, UUID, NUMERIC) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.confirm_attendance_alert_sent(UUID, UUID) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.rollback_attendance_alert_claim(UUID, UUID) FROM PUBLIC, authenticated, anon;

GRANT EXECUTE ON FUNCTION public.claim_attendance_alert(UUID, UUID, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_attendance_alert_sent(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.rollback_attendance_alert_claim(UUID, UUID) TO service_role;

-- 9. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
