-- ==============================================================================
-- Migration: Beta Roles, Telemetry, Feedback, Feature Flags, Invites
-- Created: Phase 11
-- ==============================================================================

-- 1. Create User Role ENUM
CREATE TYPE public.user_role AS ENUM ('USER', 'ADMIN', 'EDITOR', 'REVIEWER');

-- We need to drop the old check constraint on profiles.role and convert the column
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles 
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE public.user_role USING role::public.user_role,
  ALTER COLUMN role SET DEFAULT 'USER'::public.user_role;

-- Update handle_new_user trigger to use ENUM casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'مستخدم أثر'),
    new.raw_user_meta_data->>'avatar_url',
    'USER'::public.user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update is_admin to handle ENUM
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'::public.user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function for role checks
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles public.user_role[]) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = ANY(allowed_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Create Telemetry Events Table
CREATE TABLE public.telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_telemetry_event ON public.telemetry_events(event_name);
CREATE INDEX idx_telemetry_user ON public.telemetry_events(user_id);
CREATE INDEX idx_telemetry_date ON public.telemetry_events(created_at);

ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;
-- Telemetry is insert-only from backend (service role) or users inserting their own.
CREATE POLICY "Allow service role full access on telemetry"
  ON public.telemetry_events FOR ALL USING (true);


-- 3. Create Feature Flags Table
CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on feature flags"
  ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage feature flags"
  ON public.feature_flags FOR ALL USING (public.is_admin());


-- 4. Create Lesson Feedback Table
CREATE TABLE public.lesson_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT rating_or_comment_required CHECK (rating IS NOT NULL OR comment IS NOT NULL)
);

CREATE INDEX idx_feedback_lesson ON public.lesson_feedback(lesson_id);
CREATE INDEX idx_feedback_user ON public.lesson_feedback(user_id);

ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own feedback"
  ON public.lesson_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read their own feedback"
  ON public.lesson_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all feedback"
  ON public.lesson_feedback FOR SELECT USING (public.is_admin());


-- 5. Create Beta Invites Table
CREATE TABLE public.beta_invites (
  code TEXT PRIMARY KEY,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_beta_invites_used ON public.beta_invites(used_by);

ALTER TABLE public.beta_invites ENABLE ROW LEVEL SECURITY;
-- Allow public to SELECT to verify codes during signup (only unused codes)
CREATE POLICY "Allow public read of unused beta invites"
  ON public.beta_invites FOR SELECT USING (used_by IS NULL);
CREATE POLICY "Allow users to read their used invite"
  ON public.beta_invites FOR SELECT USING (used_by = auth.uid());
CREATE POLICY "Allow admins to manage beta invites"
  ON public.beta_invites FOR ALL USING (public.is_admin());

-- Insert a default feature flag for public signup
INSERT INTO public.feature_flags (key, enabled, description) 
VALUES ('ENABLE_PUBLIC_SIGNUP', false, 'If false, requires a beta invite code to sign up')
ON CONFLICT (key) DO NOTHING;

-- Insert a few initial beta codes
INSERT INTO public.beta_invites (code) VALUES 
('ATHAR-BETA-2026'),
('EARLY-ACCESS-123'),
('TESTER-WELCOME')
ON CONFLICT (code) DO NOTHING;
