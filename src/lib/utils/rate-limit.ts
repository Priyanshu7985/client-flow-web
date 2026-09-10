/**
 * In-memory token-bucket rate limiter, keyed by an arbitrary identifier
 * (usually a hashed IP). Fine for a single instance / MVP. For multi-instance
 * deployments swap the store for Upstash Redis — the `check` signature stays.
 */

type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const refillRate = options.limit / options.windowMs;
  const existing = buckets.get(key);

  let tokens = options.limit;
  if (existing) {
    const elapsed = now - existing.updatedAt;
    tokens = Math.min(options.limit, existing.tokens + elapsed * refillRate);
  }

  if (tokens < 1) {
    buckets.set(key, { tokens, updatedAt: now });
    return { success: false, remaining: 0, resetMs: Math.ceil((1 - tokens) / refillRate) };
  }

  tokens -= 1;
  buckets.set(key, { tokens, updatedAt: now });
  return { success: true, remaining: Math.floor(tokens), resetMs: 0 };
}

/** Best-effort client IP from request headers. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Non-reversible hash for storing an approval IP without keeping the raw value. */
export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.APP_HASH_SALT ?? "clientflow-dev-salt";
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
