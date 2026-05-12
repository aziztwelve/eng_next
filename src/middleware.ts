import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified token validation - decode without signature verification for now
function isAdmin(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Decoded JWT payload:', payload);
      return payload.role === 'admin';
    }
  } catch (error) {
    console.error('JWT decode failed:', error);
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  console.log('Middleware - Pathname:', pathname);
  console.log('Middleware - Token exists:', !!token);

  // Allow access to login page without authentication
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    if (token && isAdmin(token)) {
      console.log('Middleware - Redirecting to /admin (already logged in)');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    console.log('Middleware - Allowing access to login page');
    return NextResponse.next();
  }

  // For all other admin routes, require authentication
  if (!token) {
    console.log('Middleware - No token found, redirecting to login');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Verify token and admin role
  if (!isAdmin(token)) {
    console.log('Middleware - Invalid token or not admin, redirecting to login');
    // Clear invalid token
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('user_role');
    return response;
  }

  console.log('Middleware - Access granted to admin route');
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
