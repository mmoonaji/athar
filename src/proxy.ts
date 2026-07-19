import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Global Edge Proxy (Middleware).
 * Refreshes auth sessions and protects authenticated routes.
 *
 * Onboarding optimization: uses the `athar_onboarded` HTTP-only cookie
 * to skip the DB check on every request. DB is queried only when the
 * cookie is absent (first visit after signup or new device).
 */
export async function proxy(request: NextRequest) {
  // 1. Refresh auth session dynamically
  const { updateSession } = await import('@/lib/supabase/middleware')
  const response = await updateSession(request)

  // 2. Route protection checks
  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/journey') || path.startsWith('/profile') || path.startsWith('/bookmarks')
  const isAdminRoute = path.startsWith('/admin')

  if (isProtected || isAdminRoute) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    // 3. Admin route guard
    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'ADMIN') {
        return new NextResponse(
          '<html><body style="font-family:sans-serif; text-align:center; padding-top:100px; direction:rtl;"><h1>٤٠٣ - غير مسموح بالدخول</h1><p>عذراً، هذه اللوحة مخصصة للمشرفين فقط.</p><a href="/">العودة للرئيسية</a></body></html>',
          {
            status: 403,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          }
        )
      }
    }

    // 4. Onboarding check — cookie-optimized, no DB call if cookie exists.
    //    Only applies to authenticated non-admin users visiting /journey or /learn.
    if (!isAdminRoute && (path === '/journey' || path.startsWith('/learn'))) {
      const onboardedCookie = request.cookies.get('athar_onboarded')

      if (!onboardedCookie) {
        // Cookie absent → single DB lookup to confirm onboarding state
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('onboarding_completed_at')
          .eq('user_id', user.id)
          .maybeSingle()

        const isOnboarded = !!prefs?.onboarding_completed_at

        if (!isOnboarded) {
          const onboardingUrl = request.nextUrl.clone()
          onboardingUrl.pathname = '/onboarding'
          return NextResponse.redirect(onboardingUrl)
        }

        // Onboarded but cookie missing (new device / cleared cookies) → set cookie
        const cookieRes = NextResponse.next()
        cookieRes.cookies.set('athar_onboarded', '1', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 365,
          path: '/',
          sameSite: 'lax',
        })
        return cookieRes
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
