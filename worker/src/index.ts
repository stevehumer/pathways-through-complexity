import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './systemPrompt';
import { checkRateLimit } from './rateLimit';
import {
  alertNewSession,
  alertRateLimited,
  logExchange,
  resolveSessionId,
  type SessionMeta,
  type LoggedMessage,
} from './chatLog';
import { handleAdmin } from './admin';

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGINS: string; // comma-separated
  MODEL?: string; // set in wrangler.toml [vars]; falls back to DEFAULT_MODEL
  ADMIN_TOKEN?: string; // secret: Basic-auth password for /admin
  NTFY_TOPIC?: string; // secret: ntfy.sh topic for admin alerts; unset = no alerts
  NTFY_TOKEN?: string; // secret: ntfy.sh access token (see chatLog.ts NtfyConfig)
  RATE_LIMIT: KVNamespace;
  DB: D1Database;
}

const DEFAULT_MODEL = 'claude-sonnet-5';
const MAX_INPUT_CHARS = 500;
const MAX_RESPONSE_TOKENS = 600;

// Recent conversation turns the client may replay for context. Ari's replies
// cap at 600 tokens (~2,400 chars), so the per-message cap fits a full reply;
// 12 messages keeps the worst-case prompt around 8K tokens on top of the
// cached system prompt.
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_MESSAGE_CHARS = 2400;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * History arrives from the browser and is untrusted: unknown shape, unknown
 * roles, unbounded length. Keep only well-formed recent entries, then merge
 * consecutive same-role turns and drop leading assistant turns so the result
 * strictly alternates starting with a user message (what the API expects).
 */
function sanitizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];

  const entries: ChatMessage[] = [];
  for (const item of raw.slice(-MAX_HISTORY_MESSAGES)) {
    if (typeof item !== 'object' || item === null) continue;
    const { role, text } = item as { role?: unknown; text?: unknown };
    if ((role !== 'user' && role !== 'ari') || typeof text !== 'string') continue;
    const content = text.trim().slice(0, MAX_HISTORY_MESSAGE_CHARS);
    if (!content) continue;
    entries.push({ role: role === 'ari' ? 'assistant' : 'user', content });
  }
  return entries;
}

function buildMessages(history: ChatMessage[], newMessage: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  for (const entry of [...history, { role: 'user' as const, content: newMessage }]) {
    if (messages.length === 0 && entry.role === 'assistant') continue;
    const last = messages[messages.length - 1];
    if (last && last.role === entry.role) {
      last.content += `\n${entry.content}`;
    } else {
      messages.push({ ...entry });
    }
  }
  return messages;
}

function corsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

/**
 * Transcript logging + alerting, run via ctx.waitUntil after the response is
 * already on its way. Failures are logged and swallowed: capture must never
 * break the chat.
 */
async function captureExchange(
  env: Env,
  adminOrigin: string,
  sessionId: string,
  meta: SessionMeta,
  rows: LoggedMessage[],
): Promise<void> {
  try {
    const { isNewSession } = await logExchange(env.DB, sessionId, meta, rows);
    if (env.NTFY_TOPIC) {
      const ntfy = { topic: env.NTFY_TOPIC, token: env.NTFY_TOKEN };
      if (isNewSession) {
        await alertNewSession(ntfy, sessionId, meta, rows[0].content, adminOrigin);
      }
      if (rows.some((row) => row.status === 'rate_limited')) {
        await alertRateLimited(ntfy, env.RATE_LIMIT, meta, adminOrigin);
      }
    }
  } catch (err) {
    console.error('Transcript capture failed:', err);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      return handleAdmin(request, env.DB, env.ADMIN_TOKEN);
    }

    const origin = request.headers.get('Origin');
    const headers = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, headers);
    }

    // CORS only stops the browser from *reading* the response; the request
    // (and its API spend) would still go through. Reject browser requests
    // from unknown origins outright so other sites can't burn the quota.
    // Requests without an Origin header (curl etc.) are covered by the rate
    // limits below.
    if (origin !== null) {
      const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
      if (!allowed.includes(origin)) {
        return json({ error: 'Forbidden' }, 403, headers);
      }
    }

    let message: unknown;
    let rawHistory: unknown;
    let rawSessionId: unknown;
    try {
      const bodyData = (await request.json()) as {
        message?: unknown;
        history?: unknown;
        sessionId?: unknown;
      };
      message = bodyData.message;
      rawHistory = bodyData.history;
      rawSessionId = bodyData.sessionId;
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, headers);
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return json({ error: 'Message is required' }, 400, headers);
    }
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > MAX_INPUT_CHARS) {
      return json(
        { error: `Message is too long (max ${MAX_INPUT_CHARS} characters)` },
        400,
        headers,
      );
    }

    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const sessionId = resolveSessionId(rawSessionId);
    const meta: SessionMeta = {
      clientIp,
      country: (request.cf?.country as string | undefined) ?? null,
      userAgent: request.headers.get('User-Agent'),
    };
    const adminOrigin = url.origin;

    const rateLimit = await checkRateLimit(env.RATE_LIMIT, clientIp);
    if (!rateLimit.allowed) {
      if (rateLimit.logSample) {
        ctx.waitUntil(
          captureExchange(env, adminOrigin, sessionId, meta, [
            { role: 'user', content: trimmedMessage, status: 'rate_limited' },
          ]),
        );
      }
      const reply =
        rateLimit.reason === 'global'
          ? "Whoa, Ari's gotten a lot of mail today — try again tomorrow!"
          : "Ari's taking a quick break from all your great questions — try again in a few minutes!";
      return json({ error: reply }, 429, headers);
    }

    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      timeout: 30_000,
      maxRetries: 1,
    });

    try {
      const response = await anthropic.messages.create({
        model: env.MODEL?.trim() || DEFAULT_MODEL,
        max_tokens: MAX_RESPONSE_TOKENS,
        system: [
          {
            type: 'text',
            text: buildSystemPrompt(),
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: buildMessages(sanitizeHistory(rawHistory), trimmedMessage),
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const reply = textBlock?.type === 'text' ? textBlock.text : '';

      ctx.waitUntil(
        captureExchange(env, adminOrigin, sessionId, meta, [
          { role: 'user', content: trimmedMessage, status: 'ok' },
          { role: 'ari', content: reply, status: 'ok' },
        ]),
      );

      return json({ reply }, 200, headers);
    } catch (err) {
      console.error('Anthropic API error:', err);
      ctx.waitUntil(
        captureExchange(env, adminOrigin, sessionId, meta, [
          { role: 'user', content: trimmedMessage, status: 'upstream_error' },
        ]),
      );
      return json(
        { error: "Ari's having a moment — please try again shortly." },
        502,
        headers,
      );
    }
  },
};
