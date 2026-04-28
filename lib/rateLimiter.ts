import type { NextRequest } from 'next/server';

// basic in-memory rate limiter (token bucket, keyed by IP)
// defaults to 10 req/min — tweak with RATE_LIMIT_* env vars

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000); // 1 minute
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 1000);

type Bucket = {
  lastReset: number;
  tokens: number;
};

const buckets = new Map<string, Bucket>();

// checks the IP against the bucket and returns { allowed: true/false }
export async function rateLimiter(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
  if (!ip) return { allowed: true }; // fallback – allow if we cannot identify IP

  const now = Date.now();
  const bucket = buckets.get(ip) ?? { lastReset: now, tokens: MAX_REQUESTS };

  // window expired, refill
  if (now - bucket.lastReset > WINDOW_MS) {
    bucket.tokens = MAX_REQUESTS;
    bucket.lastReset = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    buckets.set(ip, bucket);
    return { allowed: true };
  }

  // out of tokens
  buckets.set(ip, bucket);
  return { allowed: false };
}
