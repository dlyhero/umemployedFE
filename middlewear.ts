import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // If user is logged in
  if (token) {
    // Redirect to onboarding if role is 'none' or null/undefined
    if (
      (token.role === null || !token.role) && 
      !pathname.startsWith('/onboarding')
    ) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Prevent accessing auth pages when logged in
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Continue with the request if no redirect is needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}