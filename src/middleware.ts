import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options })
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. ADMIN PORTAL ROUTES (/admin/*)
  if (pathname.startsWith('/admin')) {
    // Exclude /admin/login from protection
    if (pathname === '/admin/login') {
      if (user) {
        const isSuperAdmin = user.email?.toLowerCase() === 'superclaim@globalbeli.com'
        let isAdmin = isSuperAdmin
        if (!isAdmin) {
          const { data: adminUser } = await supabase.from('admin_users').select('id').eq('id', user.id).maybeSingle()
          isAdmin = !!adminUser
        }
        if (isAdmin) {
          const url = request.nextUrl.clone()
          url.pathname = '/admin'
          return NextResponse.redirect(url)
        }
      }
      return response
    }

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    const isSuperAdminEmail = user.email?.toLowerCase() === 'superclaim@globalbeli.com'
    if (!isSuperAdminEmail) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!adminUser) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        url.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(url)
      }
    }
  }

  // 2. BRAND PARTNER PORTAL ROUTES (/partner/*)
  if (pathname.startsWith('/partner')) {
    // Exclude /partner/login from protection
    if (pathname === '/partner/login') {
      if (user) {
        const { data: partnerUser } = await supabase
          .from('brand_partner_users')
          .select('id')
          .eq('id', user.id)
          .eq('is_active', true)
          .maybeSingle()

        if (partnerUser) {
          const url = request.nextUrl.clone()
          url.pathname = '/partner'
          return NextResponse.redirect(url)
        }
      }
      return response
    }

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/partner/login'
      return NextResponse.redirect(url)
    }

    const { data: partnerUser } = await supabase
      .from('brand_partner_users')
      .select('id, brand_partner_id')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!partnerUser) {
      const url = request.nextUrl.clone()
      url.pathname = '/partner/login'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  // 3. MEMBER DASHBOARD ROUTES (/dashboard/*)
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (user.email?.toLowerCase() === 'superclaim@globalbeli.com') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    const { data: partnerUser } = await supabase
      .from('brand_partner_users')
      .select('id')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (partnerUser) {
      const url = request.nextUrl.clone()
      url.pathname = '/partner'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/partner/:path*'],
}
