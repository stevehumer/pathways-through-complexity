/**
 * Chat transcript logging + admin alerting. Everything here runs inside
 * ctx.waitUntil() after the visitor's reply is already on its way, and every
 * entry point swallows its own failures: transcript capture must never break
 * or slow down the chat itself.
 */

export interface SessionMeta {
  clientIp: string;
  country: string | null;
  userAgent: string | null;
}

export interface LoggedMessage {
  role: 'user' | 'ari';
  content: string;
  status: 'ok' | 'rate_limited' | 'upstream_error';
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The widget sends a per-page-visit UUID. Treat it as untrusted: anything
 * that isn't a plain UUID (including requests from cached old frontends that
 * send nothing) gets a server-generated ID so the message is still captured.
 */
export function resolveSessionId(raw: unknown): string {
  if (typeof raw === 'string' && UUID_PATTERN.test(raw)) {
    return raw.toLowerCase();
  }
  return `anon-${crypto.randomUUID()}`;
}

/**
 * Record one exchange (user message, and Ari's reply when there is one).
 * Returns whether this created a brand-new session, so the caller can alert.
 */
export async function logExchange(
  db: D1Database,
  sessionId: string,
  meta: SessionMeta,
  rows: LoggedMessage[],
): Promise<{ isNewSession: boolean }> {
  const now = new Date().toISOString();

  const inserted = await db
    .prepare(
      `INSERT OR IGNORE INTO sessions
         (id, started_at, last_active_at, message_count, client_ip, country, user_agent)
       VALUES (?, ?, ?, 0, ?, ?, ?)`,
    )
    .bind(sessionId, now, now, meta.clientIp, meta.country, meta.userAgent)
    .run();
  const isNewSession = (inserted.meta.changes ?? 0) === 1;

  const statements = [
    db
      .prepare(
        `UPDATE sessions
           SET last_active_at = ?, message_count = message_count + ?
         WHERE id = ?`,
      )
      .bind(now, rows.length, sessionId),
    ...rows.map((row) =>
      db
        .prepare(
          `INSERT INTO messages (session_id, role, content, status, created_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(sessionId, row.role, row.content, row.status, now),
    ),
  ];
  await db.batch(statements);

  return { isNewSession };
}

export interface NtfyConfig {
  topic: string;
  /**
   * ntfy.sh access token (free account). Required in practice: anonymous
   * publish quotas are per source IP, and Workers egress from shared IPs
   * whose quota other people's Workers have usually already exhausted.
   * With a token the quota is attributed to the account instead.
   */
  token?: string;
}

/** Push notification via ntfy.sh. */
async function publishNtfy(
  ntfy: NtfyConfig,
  title: string,
  body: string,
  clickUrl?: string,
): Promise<void> {
  const headers: Record<string, string> = {
    Title: title,
    Tags: 'speech_balloon',
  };
  if (clickUrl) headers.Click = clickUrl;
  if (ntfy.token) headers.Authorization = `Bearer ${ntfy.token}`;
  const res = await fetch(`https://ntfy.sh/${ntfy.topic}`, { method: 'POST', headers, body });
  if (!res.ok) {
    console.error(`ntfy publish failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }
}

export async function alertNewSession(
  ntfy: NtfyConfig,
  sessionId: string,
  meta: SessionMeta,
  firstQuestion: string,
  adminOrigin: string,
): Promise<void> {
  await publishNtfy(
    ntfy,
    `New Ask Ari chat${meta.country ? ` (${meta.country})` : ''}`,
    `"${firstQuestion.slice(0, 300)}"`,
    `${adminOrigin}/admin/session/${sessionId}`,
  );
}

/**
 * Rate-limit trips are the bot-spam tripwire. Alert at most once per IP per
 * UTC day (deduped through the existing rate-limit KV namespace) so a bot
 * hammering the endpoint produces one ping, not hundreds.
 */
export async function alertRateLimited(
  ntfy: NtfyConfig,
  kv: KVNamespace,
  meta: SessionMeta,
  adminOrigin: string,
): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  const dedupeKey = `alerted:ratelimit:${meta.clientIp}:${day}`;
  if (await kv.get(dedupeKey)) return;
  await kv.put(dedupeKey, '1', { expirationTtl: 60 * 60 * 24 });

  await publishNtfy(
    ntfy,
    'Ask Ari rate limit tripped',
    `IP ${meta.clientIp}${meta.country ? ` (${meta.country})` : ''} hit the rate limit. Possible bot traffic.`,
    `${adminOrigin}/admin`,
  );
}
