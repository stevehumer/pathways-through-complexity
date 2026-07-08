/**
 * Fixed-window KV counters: per-IP throttle (stop one visitor hammering
 * the endpoint) plus a global daily cap (hard spend circuit-breaker,
 * independent of how traffic is distributed across IPs).
 */

const PER_IP_WINDOW_SECONDS = 10 * 60; // 10 minutes
const PER_IP_LIMIT = 10;

const GLOBAL_DAILY_LIMIT = 200;

async function incrementCounter(
  kv: KVNamespace,
  key: string,
  ttlSeconds: number,
): Promise<number> {
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) + 1 : 1;
  await kv.put(key, String(count), { expirationTtl: ttlSeconds });
  return count;
}

// When blocked, we still transcript-log the first few over-limit attempts
// (useful spam samples) but not an unbounded stream of them, so a bot
// hammering the endpoint can't rack up database writes.
const BLOCKED_LOG_SAMPLE = 10;

export interface RateLimitResult {
  allowed: boolean;
  reason?: 'per_ip' | 'global';
  /** Whether this request should be written to the transcript log. */
  logSample: boolean;
}

export async function checkRateLimit(
  kv: KVNamespace,
  clientIp: string,
): Promise<RateLimitResult> {
  const windowBucket = Math.floor(Date.now() / 1000 / PER_IP_WINDOW_SECONDS);
  const perIpKey = `ip:${clientIp}:${windowBucket}`;
  const perIpCount = await incrementCounter(kv, perIpKey, PER_IP_WINDOW_SECONDS);
  if (perIpCount > PER_IP_LIMIT) {
    return {
      allowed: false,
      reason: 'per_ip',
      logSample: perIpCount <= PER_IP_LIMIT + BLOCKED_LOG_SAMPLE,
    };
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
  const globalKey = `global:${today}`;
  const globalCount = await incrementCounter(kv, globalKey, 60 * 60 * 24);
  if (globalCount > GLOBAL_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: 'global',
      logSample: globalCount <= GLOBAL_DAILY_LIMIT + BLOCKED_LOG_SAMPLE,
    };
  }

  return { allowed: true, logSample: true };
}
