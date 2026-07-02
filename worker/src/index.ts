import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './systemPrompt';
import { checkRateLimit } from './rateLimit';

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGINS: string; // comma-separated
  MODEL?: string; // set in wrangler.toml [vars]; falls back to DEFAULT_MODEL
  RATE_LIMIT: KVNamespace;
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
    try {
      const bodyData = (await request.json()) as {
        message?: unknown;
        history?: unknown;
      };
      message = bodyData.message;
      rawHistory = bodyData.history;
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
    const rateLimit = await checkRateLimit(env.RATE_LIMIT, clientIp);
    if (!rateLimit.allowed) {
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

      return json({ reply }, 200, headers);
    } catch (err) {
      console.error('Anthropic API error:', err);
      return json(
        { error: "Ari's having a moment — please try again shortly." },
        502,
        headers,
      );
    }
  },
};
