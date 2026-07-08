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

export interface AlertConfig {
  /** Discord incoming-webhook URL: the recommended transport. Free, and
   * authenticated by the URL itself, so it works from Workers' shared
   * egress IPs. */
  discordWebhookUrl?: string;
  /** ntfy.sh fallback. Only useful with a PAID ntfy account (or self-hosted
   * server): ntfy keys free-tier quotas to the source IP even for
   * authenticated publishes, and Workers egress IPs are shared and
   * exhausted, so free ntfy 429s from here. */
  ntfyTopic?: string;
  ntfyToken?: string;
}

interface Alert {
  title: string;
  body: string;
  linkUrl: string;
}

async function sendAlert(config: AlertConfig, alert: Alert): Promise<void> {
  if (config.discordWebhookUrl) {
    const res = await fetch(config.discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**${alert.title}**\n${alert.body}\n${alert.linkUrl}`,
      }),
    });
    if (!res.ok) {
      console.error(`Discord alert failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    }
    return;
  }

  if (config.ntfyTopic) {
    const headers: Record<string, string> = {
      Title: alert.title,
      Tags: 'speech_balloon',
      Click: alert.linkUrl,
    };
    if (config.ntfyToken) headers.Authorization = `Bearer ${config.ntfyToken}`;
    const res = await fetch(`https://ntfy.sh/${config.ntfyTopic}`, {
      method: 'POST',
      headers,
      body: alert.body,
    });
    if (!res.ok) {
      console.error(`ntfy alert failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    }
  }
}

export function alertConfigured(config: AlertConfig): boolean {
  return Boolean(config.discordWebhookUrl || config.ntfyTopic);
}

export async function alertNewSession(
  config: AlertConfig,
  sessionId: string,
  meta: SessionMeta,
  firstQuestion: string,
  adminOrigin: string,
): Promise<void> {
  await sendAlert(config, {
    title: `New Ask Ari chat${meta.country ? ` (${meta.country})` : ''}`,
    body: `"${firstQuestion.slice(0, 300)}"`,
    linkUrl: `${adminOrigin}/admin/session/${sessionId}`,
  });
}

/**
 * Rate-limit trips are the bot-spam tripwire. Alert at most once per IP per
 * UTC day (deduped through the existing rate-limit KV namespace) so a bot
 * hammering the endpoint produces one ping, not hundreds.
 */
export async function alertRateLimited(
  config: AlertConfig,
  kv: KVNamespace,
  meta: SessionMeta,
  adminOrigin: string,
): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  const dedupeKey = `alerted:ratelimit:${meta.clientIp}:${day}`;
  if (await kv.get(dedupeKey)) return;
  await kv.put(dedupeKey, '1', { expirationTtl: 60 * 60 * 24 });

  await sendAlert(config, {
    title: 'Ask Ari rate limit tripped',
    body: `IP ${meta.clientIp}${meta.country ? ` (${meta.country})` : ''} hit the rate limit. Possible bot traffic.`,
    linkUrl: `${adminOrigin}/admin`,
  });
}
