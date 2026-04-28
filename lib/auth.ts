import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import jwt from 'jsonwebtoken';

// pulls the JWT from either the Authorization header or the cookie
export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const tokenCookie = cookies.find(c => c.startsWith('token='));
  
  if (!tokenCookie) return null;
  return tokenCookie.split('=')[1];
}

// sets an httpOnly cookie with the JWT so the browser sends it automatically
export function setAuthCookie(response: NextResponse, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${isProd ? '; Secure' : ''}`;
  response.headers.append('Set-Cookie', cookie);
}

// wipes the auth cookie on logout
export function clearAuthCookie(response: NextResponse) {
  const cookie = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`;
  response.headers.append('Set-Cookie', cookie);
}

// standard jsonwebtoken verify — throws if bad
export function verifyAuthToken(token: string, secret: string) {
  return jwt.verify(token, secret) as { userId: string; role: 'ngo' | 'volunteer' };
}

import { jwtVerify } from 'jose';

// same thing but using jose so it works on edge runtimes
export async function verifyAuthTokenEdge(token: string, secret: string) {
  const secretKey = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, secretKey);
  return payload as { userId: string; role: 'ngo' | 'volunteer' };
}
