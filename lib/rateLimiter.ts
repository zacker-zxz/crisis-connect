import type { NextRequest } from 'next/server';

// Simple in‑memory token bucket rate limiter (IP based)
// Limits to 10 requests per minute per IP by default – configurable via env vars.

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000); // 1 minute
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 10);

type Bucket = {
  lastReset: number;
  tokens: number;
};

const buckets = new Map<string, Bucket>();

/**
 * Checks the request's IP against a token‑bucket limiter.
 * Returns an object indicating whether the request is allowed.
 */
export async function rateLimiter(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
  if (!ip) return { allowed: true }; // fallback – allow if we cannot identify IP

  const now = Date.now();
  const bucket = buckets.get(ip) ?? { lastReset: now, tokens: MAX_REQUESTS };

  // Reset bucket if window elapsed
  if (now - bucket.lastReset > WINDOW_MS) {
    bucket.tokens = MAX_REQUESTS;
    bucket.lastReset = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    buckets.set(ip, bucket);
    return { allowed: true };
  }

  // No tokens left – reject
  buckets.set(ip, bucket);
  return { allowed: false };
}
