-- ================================================================
-- Migration: 20260719000002_beta_readiness
-- Phase 10 — Beta Release Production Readiness
-- ================================================================

-- ================================================================
-- TABLE: user_preferences
-- Stores personalization data collected during onboarding.
-- One row per user (UNIQUE on user_id).
-- ================================================================
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learning_goal TEXT NOT NULL DEFAULT 'aqeedah_basics'
    CHECK (learning_goal IN ('aqeedah_basics', 'review', 'daily_habit')),
  daily_goal_minutes INTEGER NOT NULL DEFAULT 10
    CHECK (daily_goal_minutes IN (5, 10, 15)),
  experience_level TEXT NOT NULL DEFAULT 'beginner'
    CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON public.user_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_preferences_user ON public.user_preferences(user_id);

-- ================================================================
-- TABLE: user_achievements
-- Stores unlocked achievement badges for gamification.
-- UNIQUE(user_id, achievement_key) prevents duplicate grants.
-- ================================================================
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL
    CHECK (achievement_key IN (
      'FIRST_LESSON',
      '7_DAY_STREAK',
      '10_LESSONS',
      'COMPLETE_PATH',
      'COMPLETE_DOMAIN'
    )),
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, achievement_key)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

-- ================================================================
-- LESSONS: Single source of truth for editorial workflow.
-- status column drives the full DRAFT → PUBLISHED lifecycle.
-- The `published` boolean is kept for backward compatibility
-- and is automatically synced via trigger.
-- ================================================================
ALTER TABLE public.lessons
  ADD COLUMN status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
  ADD COLUMN reviewer_notes TEXT;

-- Sync existing data: published → status
UPDATE public.lessons SET status = 'PUBLISHED' WHERE published = true;
UPDATE public.lessons SET status = 'DRAFT' WHERE published = false AND status = 'DRAFT';

-- Trigger function: keeps `published` in sync when status changes
CREATE OR REPLACE FUNCTION public.sync_lesson_published()
RETURNS TRIGGER AS $$
BEGIN
  NEW.published := (NEW.status = 'PUBLISHED');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lesson_status_sync
  BEFORE INSERT OR UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.sync_lesson_published();

-- Update RLS: allow SELECT only for PUBLISHED or admin
DROP POLICY IF EXISTS "Allow public read on published lessons" ON public.lessons;
CREATE POLICY "Allow public read on published lessons"
  ON public.lessons
  FOR SELECT
  USING (status = 'PUBLISHED' OR public.is_admin());

-- ================================================================
-- MISSING RLS: user_lesson_progress had no policies at all
-- ================================================================
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lesson progress"
  ON public.user_lesson_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- PERFORMANCE INDEXES
-- Covers the most common query patterns identified in audit.
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_lessons_status     ON public.lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_published  ON public.lessons(published);
CREATE INDEX IF NOT EXISTS idx_profiles_role      ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_ulp_user_id        ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ulp_lesson_id      ON public.user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_ulp_completed_at   ON public.user_lesson_progress(completed_at);

CREATE INDEX IF NOT EXISTS idx_user_progress_profile ON public.user_progress(profile_id);
