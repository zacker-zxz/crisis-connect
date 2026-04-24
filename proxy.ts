import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthTokenEdge } from '@/lib/auth';

const PUBLIC_PATHS = [
  '/',
  '/signin',
  '/signup',
  '/api/auth/login',
  '/api/auth/register',
  '/favicon.ico'
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public paths
  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/images')) {
    return NextResponse.next();
  }

  // 2. Extract token from cookie or Authorization header
  let token = request.cookies.get('token')?.value;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  // 3. Handle unauthenticated users
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    // 4. Verify token cryptographically
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const decoded = await verifyAuthTokenEdge(token, secret);

    // 5. Enforce Role-Based Access Control (RBAC) for dashboards
    if (pathname.startsWith('/ngo-dashboard') && decoded.role !== 'ngo') {
      return NextResponse.redirect(new URL('/volunteer-dashboard', request.url));
    }
    if (pathname.startsWith('/volunteer-dashboard') && decoded.role !== 'volunteer') {
      return NextResponse.redirect(new URL('/ngo-dashboard', request.url));
    }

    // 6. Inject secure headers for downstream API routes to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-role', decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Token is invalid or expired
    console.error('Middleware JWT verification failed:', error);
    
    // Clear the invalid cookie
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      : NextResponse.redirect(new URL('/signin', request.url));
      
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
