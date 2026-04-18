import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    // TODO: Implement proper auth check
    // For now, check if user has admin token in cookies
    const token = request.cookies.get('auth_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    // If no token or not admin, redirect to login
    if (!token || userRole !== 'admin') {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
