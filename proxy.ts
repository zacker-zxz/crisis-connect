import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// These routes require authentication
const AUTH_ROUTES = ['/ngo-dashboard', '/volunteer-dashboard', '/api/tasks', '/api/notifications', '/api/volunteer'];

// These routes are restricted by role
const ROLE_ROUTES = {
  ngo: ['/ngo-dashboard', '/api/tasks/post'],
  volunteer: ['/volunteer-dashboard', '/api/tasks/accept'],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip middleware for static assets and auth public routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/api/auth') ||
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // 2. Check if the route needs protection
  const isProtected = AUTH_ROUTES.some(route => pathname.startsWith(route));
  
  if (!isProtected) {
    return NextResponse.next();
  }

  // 3. Extract Token from Cookies
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // If it's an API route, return 401. Otherwise, redirect to login.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    // 4. Verify Token (using jose for Edge compatibility)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as 'ngo' | 'volunteer';

    // 5. Role-Based Access Control
    if (pathname.startsWith('/ngo-dashboard') && role !== 'ngo') {
      return NextResponse.redirect(new URL('/volunteer-dashboard', request.url));
    }

    if (pathname.startsWith('/volunteer-dashboard') && role !== 'volunteer') {
      return NextResponse.redirect(new URL('/ngo-dashboard', request.url));
    }

    // 6. Inject role/userId headers for downstream API routes to trust
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId as string);
    response.headers.set('x-user-role', role);
    
    return response;
  } catch (error) {
    console.error('Middleware Auth Error:', error);
    // Token is invalid or expired
    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/ngo-dashboard/:path*',
    '/volunteer-dashboard/:path*',
    '/api/:path*',
  ],
};
