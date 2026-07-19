# Athar — Deployment Guide
*Last updated: Phase 10 Beta Release*

---

## Prerequisites

- Node.js 20+
- Supabase project (Pro or Free tier)
- Vercel account
- `.env.local` configured locally

---

## Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin/service key (NEVER expose publicly) | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | OpenAI API key for AI generation | platform.openai.com |
| `ANTHROPIC_API_KEY` | Claude API key | console.anthropic.com |
| `GOOGLE_AI_API_KEY` | Gemini API key | aistudio.google.com |
| `DEEPSEEK_API_KEY` | DeepSeek API key | platform.deepseek.com |
| `NEXT_PUBLIC_SITE_URL` | Full production URL (e.g., https://athar-app.vercel.app) | Your domain |

---

## Supabase Setup

### 1. Auth Settings
In Supabase Dashboard → Authentication → Settings:

```
Site URL:           https://your-domain.vercel.app
Redirect URLs:      https://your-domain.vercel.app/**
                    http://localhost:3000/**  (for development)

Email Confirmation: Enable (recommended for production)
```

### 2. Email Templates
Customize Arabic email templates in Dashboard → Auth → Email Templates:
- **Confirm Signup**: Translate subject and body to Arabic
- **Password Reset**: Translate subject and body to Arabic
- **Magic Link**: Translate subject and body to Arabic

### 3. Run Migrations

Apply all migrations in order:
```bash
# Apply migrations to remote Supabase project
npx supabase db push

# Verify migrations applied
npx supabase migration list
```

Expected migrations:
```
20260719000000_init_mvp_schema
20260719000001_user_lesson_progress
20260719000002_beta_readiness
```

### 4. Verify RLS
After migration, verify all tables have RLS enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```
All rows should show `rowsecurity = true`.

### 5. Create First Admin User
After deploying and creating an account:
```sql
UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE id = 'your-user-uuid-here';
```

---

## Vercel Deployment

### 1. Import Project
```bash
# Connect repository to Vercel
vercel --prod
```
Or via the Vercel Dashboard → New Project → Import Git Repository.

### 2. Configure Environment Variables
In Vercel Dashboard → Project → Settings → Environment Variables, add all variables from the table above.

### 3. Build Settings
```
Framework Preset: Next.js
Build Command:    npm run build
Output Directory: .next (auto-detected)
Install Command:  npm install
```

### 4. Recommended Regions
Select the region closest to your Supabase project:
- If Supabase is on `eu-central-1` → choose Vercel region `fra1`
- If Supabase is on `us-east-1` → choose Vercel region `iad1`

---

## Deployment Process

### Standard Deploy
```bash
# 1. Run validation locally
npx tsc --noEmit
npm run lint
npm run build

# 2. Push to main branch (triggers Vercel auto-deploy)
git push origin main
```

### Manual Migration Deploy
```bash
# Apply to production Supabase
npx supabase db push --linked

# Verify
npx supabase db diff
```

---

## Backup Strategy

### Supabase Auto-Backups
- Supabase Free: Point-in-time recovery for 7 days
- Supabase Pro: Point-in-time recovery for 30 days

### Manual Backup
```bash
# Export database snapshot
pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" \
  --format=custom \
  --file="athar_backup_$(date +%Y%m%d).dump"
```

### Restore from Backup
```bash
pg_restore \
  --dbname="postgresql://postgres:[password]@[host]:5432/postgres" \
  --clean \
  athar_backup_20260719.dump
```

---

## Rollback Plan

### Application Rollback (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find the last stable deployment
3. Click ⋯ → **Promote to Production**

### Migration Rollback
Each migration is additive (no destructive changes). To rollback:

```sql
-- Rollback 20260719000002_beta_readiness
ALTER TABLE public.lessons DROP COLUMN IF EXISTS status;
ALTER TABLE public.lessons DROP COLUMN IF EXISTS reviewer_notes;
DROP TABLE IF EXISTS public.user_achievements;
DROP TABLE IF EXISTS public.user_preferences;
-- Note: indexes dropped automatically with table drops
```

---

## Monitoring

### Vercel Logs
- Vercel Dashboard → Project → Logs → Real-time
- Filter by: Error, Warning
- Look for `[ERROR]` and `[WARN]` prefixes from the logger

### Supabase Logs
- Supabase Dashboard → Logs → API logs
- Filter for 4xx/5xx errors
- Check Auth logs for signup/login issues

### Client Errors
All client-side errors are captured by:
1. `ErrorBoundary` component → `logger.error()`  
2. `logger.error()` → `navigator.sendBeacon('/api/telemetry')`
3. `/api/telemetry` → structured console.log → Vercel logs

---

## Health Check

After every deploy, verify:
- [ ] Landing page loads: `https://your-domain.com`
- [ ] Signup flow works: `/signup`
- [ ] Login flow works: `/login`
- [ ] Onboarding redirects for new users: `/journey` → `/onboarding`
- [ ] Journey page loads after onboarding: `/journey`
- [ ] Admin dashboard: `/admin` (requires ADMIN role)
- [ ] Analytics dashboard: `/admin/analytics`
- [ ] A lesson page: `/lesson/[slug]`
