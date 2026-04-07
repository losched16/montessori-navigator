import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Protect school admin routes (note: /school singular, not /schools)
  // Public routes: /schools, /guides, /assessment
  if (
    request.nextUrl.pathname === '/school' ||
    request.nextUrl.pathname.startsWith('/school/')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Allow invite and join pages for unauthenticated users (no redirect needed)

  // Redirect logged-in users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth')) {
    if (session) {
      // If there's a next param (e.g., from invite), redirect there instead
      const next = request.nextUrl.searchParams.get('next')
      if (next) {
        return NextResponse.redirect(new URL(next, request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
