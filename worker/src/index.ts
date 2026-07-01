import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './systemPrompt';
import { checkRateLimit } from './rateLimit';

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGINS: string; // comma-separated
  RATE_LIMIT: KVNamespace;
}

const MODEL = 'claude-haiku-4-5';
const MAX_INPUT_CHARS = 500;
const MAX_RESPONSE_TOKENS = 600;

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

    let message: unknown;
    try {
      const bodyData = (await request.json()) as { message?: unknown };
      message = bodyData.message;
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

    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_RESPONSE_TOKENS,
        system: [
          {
            type: 'text',
            text: buildSystemPrompt(),
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: trimmedMessage }],
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
