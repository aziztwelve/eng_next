import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    // Skip middleware for login page — but redirect to /admin if already logged in
    if (pathname === '/admin/login') {
      const token = request.cookies.get('auth_token')?.value;
      const userRole = request.cookies.get('user_role')?.value;
      if (token && userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // TODO: Implement proper auth check
    // For now, check if user has admin token in cookies
    const token = request.cookies.get('auth_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    // If no token or not admin, redirect to admin login
    if (!token || userRole !== 'admin') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
