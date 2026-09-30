import { NextRequest } from "next/server";

// Simple in-memory rate limiter (for serverless, use Vercel KV or Redis in production)
// This works per-instance; for production scale, replace with Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5;

export function checkRateLimit(request: NextRequest): { success: boolean; remaining: number } {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: MAX_REQUESTS - entry.count };
}

// Login rate limiter: stricter
const loginRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_REQUESTS = 5;

export function checkLoginRateLimit(request: NextRequest): { success: boolean } {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const now = Date.now();
  const entry = loginRateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    loginRateLimitMap.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return { success: true };
  }

  if (entry.count >= LOGIN_MAX_REQUESTS) {
    return { success: false };
  }

  entry.count++;
  return { success: true };
}
