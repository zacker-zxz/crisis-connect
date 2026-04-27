import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import jwt from 'jsonwebtoken';

/**
 * Extracts the JWT token from the Request cookies.
 */
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

/**
 * Sets an httpOnly, secure, sameSite=Strict cookie containing the JWT.
 */
export function setAuthCookie(response: NextResponse, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${isProd ? '; Secure' : ''}`;
  response.headers.append('Set-Cookie', cookie);
}

/**
 * Clears the auth cookie (e.g., on logout).
 */
export function clearAuthCookie(response: NextResponse) {
  const cookie = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict;`;
  response.headers.append('Set-Cookie', cookie);
}

/**
 * Verifies a JWT token string and returns the payload.
 * Throws if verification fails.
 */
export function verifyAuthToken(token: string, secret: string) {
  return jwt.verify(token, secret) as { userId: string; role: 'ngo' | 'volunteer' };
}

import { jwtVerify } from 'jose';

/**
 * Edge-compatible JWT verification using jose.
 */
export async function verifyAuthTokenEdge(token: string, secret: string) {
  const secretKey = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, secretKey);
  return payload as { userId: string; role: 'ngo' | 'volunteer' };
}
