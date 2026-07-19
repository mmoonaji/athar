-- Create Profiles Table (1:1 with auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  last_active_date DATE,
  daily_goal_minutes INTEGER DEFAULT 15 CHECK (daily_goal_minutes > 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'مستخدم أثر'),
    new.raw_user_meta_data->>'avatar_url',
    'USER'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create Domains Table
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Paths Table
CREATE TABLE public.paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Modules Table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Lessons Table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  content JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  published BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Quizzes Table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID UNIQUE NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Questions Table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'MULTIPLE_CHOICE' CHECK (type IN ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'ORDERING', 'FILL_BLANK')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Question Options Table
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create User Progress Table
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(profile_id, lesson_id)
);

-- Create Bookmarks Table
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(profile_id, lesson_id)
);

-- Indexing Strategy for common retrieval queries
CREATE INDEX idx_paths_domain ON public.paths(domain_id);
CREATE INDEX idx_modules_path ON public.modules(path_id);
CREATE INDEX idx_lessons_module ON public.lessons(module_id);
CREATE INDEX idx_quizzes_lesson ON public.quizzes(lesson_id);
CREATE INDEX idx_questions_quiz ON public.questions(quiz_id);
CREATE INDEX idx_options_question ON public.question_options(question_id);
CREATE INDEX idx_progress_profile ON public.user_progress(profile_id);
CREATE INDEX idx_bookmarks_profile ON public.bookmarks(profile_id);

-- Enable Row Level Security (RLS) on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Helper security function to check if the caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Allow public read on profiles" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow user to update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Domains Policies
CREATE POLICY "Allow public read on domains" 
  ON public.domains FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage domains" 
  ON public.domains FOR ALL USING (public.is_admin());

-- 3. Paths Policies
CREATE POLICY "Allow public read on paths" 
  ON public.paths FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage paths" 
  ON public.paths FOR ALL USING (public.is_admin());

-- 4. Modules Policies
CREATE POLICY "Allow public read on modules" 
  ON public.modules FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage modules" 
  ON public.modules FOR ALL USING (public.is_admin());

-- 5. Lessons Policies
CREATE POLICY "Allow public read on published lessons" 
  ON public.lessons FOR SELECT USING (published = true OR public.is_admin());

CREATE POLICY "Allow admins to manage lessons" 
  ON public.lessons FOR ALL USING (public.is_admin());

-- 6. Quizzes Policies
CREATE POLICY "Allow read on quizzes" 
  ON public.quizzes FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage quizzes" 
  ON public.quizzes FOR ALL USING (public.is_admin());

-- 7. Questions Policies
CREATE POLICY "Allow read on questions" 
  ON public.questions FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage questions" 
  ON public.questions FOR ALL USING (public.is_admin());

-- 8. Question Options Policies
CREATE POLICY "Allow read on options" 
  ON public.question_options FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage options" 
  ON public.question_options FOR ALL USING (public.is_admin());

-- 9. User Progress Policies
CREATE POLICY "Allow authenticated user to manage own progress" 
  ON public.user_progress FOR ALL USING (auth.uid() = profile_id);

-- 10. Bookmarks Policies
CREATE POLICY "Allow authenticated user to manage own bookmarks" 
  ON public.bookmarks FOR ALL USING (auth.uid() = profile_id);
