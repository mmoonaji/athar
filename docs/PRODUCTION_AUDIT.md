# Production Audit — Athar Platform
*Generated: Phase 10 Beta Release*

---

## Summary

| Area | Status | Issues Found |
|------|--------|-------------|
| Authentication | ✅ Good | Minor: onboarding not gated |
| Database RLS | ⚠️ Partial | `user_lesson_progress` had no RLS at all |
| Indexes | ⚠️ Missing | 7 missing indexes identified |
| Code Bugs | ❌ Found | 3 active bugs |
| Error Monitoring | ❌ Missing | No logger, no error boundaries |

---

## Authentication

### Signup Flow
- **Status:** ✅ Working
- SignupForm → Supabase Auth → auto-creates profile via `handle_new_user()` trigger
- No email confirmation required in current config (check Supabase Auth settings for production)

### Login Flow
- **Status:** ✅ Working
- LoginForm → Supabase Auth → session cookie set via SSR client
- Session refreshed on every request via `updateSession()` in proxy middleware

### Session Persistence
- **Status:** ✅ Working
- HTTP-only cookies managed by `@supabase/ssr`
- Session refresh happens in middleware (`src/proxy.ts`)

### Protected Routes
- **Status:** ✅ Working
- `/journey`, `/profile`, `/bookmarks` → redirect to `/login` if no session
- `/admin/*` → redirect with 403 HTML if role !== 'ADMIN'

### Admin Permissions
- **Status:** ✅ Working
- `is_admin()` SQL function checks `profiles.role = 'ADMIN'`
- `assertAdmin()` server action used in all CMS server actions

---

## Database Audit

### RLS Policies

| Table | RLS Enabled | Policy Status |
|-------|------------|--------------|
| `profiles` | ✅ | Users read/update own row |
| `domains` | ✅ | Public read, admin write |
| `paths` | ✅ | Public read, admin write |
| `modules` | ✅ | Public read, admin write |
| `lessons` | ✅ | PUBLISHED or admin read |
| `user_progress` | ✅ | Users manage own rows |
| `bookmarks` | ✅ | Users manage own rows |
| `user_lesson_progress` | ❌ **MISSING** | No RLS policies existed |
| `user_preferences` | ✅ | Added in migration 2 |
| `user_achievements` | ✅ | Added in migration 2 |

> **Fix:** Migration `20260719000002_beta_readiness.sql` enables RLS and adds policies for `user_lesson_progress`.

### Foreign Keys & Cascades

| Relationship | Cascade |
|---|---|
| `user_preferences.user_id → profiles.id` | ON DELETE CASCADE ✅ |
| `user_achievements.user_id → profiles.id` | ON DELETE CASCADE ✅ |
| `user_lesson_progress.user_id → auth.users` | ON DELETE CASCADE ✅ |
| `user_progress.profile_id → profiles.id` | ON DELETE CASCADE ✅ |

### Missing Indexes

| Index | Table | Column | Priority |
|-------|-------|--------|----------|
| `idx_lessons_status` | `lessons` | `status` | 🔴 High |
| `idx_lessons_published` | `lessons` | `published` | 🟡 Medium |
| `idx_profiles_role` | `profiles` | `role` | 🔴 High (admin queries) |
| `idx_ulp_user_id` | `user_lesson_progress` | `user_id` | 🔴 High |
| `idx_ulp_lesson_id` | `user_lesson_progress` | `lesson_id` | 🟡 Medium |
| `idx_ulp_completed_at` | `user_lesson_progress` | `completed_at` | 🟡 Medium |
| `idx_user_progress_profile` | `user_progress` | `profile_id` | 🔴 High |

> **Fix:** All indexes added in migration `20260719000002_beta_readiness.sql`.

---

## Code Bugs Found

### Bug 1: Bookmark Revalidation — Wrong Path
- **Severity:** 🟡 Medium (bookmarks don't update on UI without refresh)
- **File:** `src/actions/learning.ts`
- **Root Cause:** `revalidatePath('/(app)/library', 'layout')` — but route is `/(app)/bookmarks`
- **Fix:** Changed to `revalidatePath('/(app)/bookmarks', 'layout')` ✅ Fixed

### Bug 2: Missing Telemetry Endpoint
- **Severity:** 🟡 Medium (silent 404 errors on analytics sendBeacon)
- **File:** `src/lib/analytics.ts`
- **Root Cause:** `navigator.sendBeacon('/api/telemetry', ...)` called but `/api/telemetry` route didn't exist
- **Fix:** Created `src/app/api/telemetry/route.ts` ✅ Fixed

### Bug 3: ReviewFlow Has No Database Persistence
- **Severity:** 🔴 High (editorial decisions lost on page refresh)
- **File:** `src/features/admin/components/ReviewFlow.tsx`
- **Root Cause:** `handleUpdateStatus` only updated React local state — no server action called
- **Fix:** Rewrote to call `updateLessonStatus()` server action, persists to DB ✅ Fixed

---

## Recommendations for Production

1. **Enable Email Confirmation** in Supabase Auth dashboard before public launch
2. **Set up Supabase custom SMTP** to avoid Supabase's rate-limited email sender
3. **Configure allowed redirect URLs** in Supabase Auth: `https://your-domain.com/**`
4. **Review Supabase project RLS** after migration: run `SELECT tablename FROM pg_tables WHERE schemaname='public'` and verify each has RLS enabled
5. **Set up Supabase daily backups** (enabled by default on Pro plan)
6. **Monitor Vercel Edge Function logs** via Vercel Dashboard → Functions → Real-time
