/**
 * Minimal admin dashboard for reviewing chat transcripts, served by the same
 * Worker at /admin (session list) and /admin/session/:id (one thread).
 * Protected by HTTP Basic auth: username "admin", password = ADMIN_TOKEN
 * secret. Browsers prompt once and remember for the session.
 */

interface SessionRow {
  id: string;
  started_at: string;
  last_active_at: string;
  message_count: number;
  client_ip: string | null;
  country: string | null;
  user_agent: string | null;
  first_question: string | null;
  rate_limited_count: number;
}

interface MessageRow {
  role: string;
  content: string;
  status: string;
  created_at: string;
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}

function isAuthorized(request: Request, adminToken: string): boolean {
  const header = request.headers.get('Authorization') ?? '';
  if (!header.startsWith('Basic ')) return false;
  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return false;
  }
  const colon = decoded.indexOf(':');
  if (colon === -1) return false;
  return timingSafeEqual(decoded.slice(colon + 1), adminToken);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function formatWhen(iso: string): string {
  return iso.replace('T', ' ').slice(0, 16) + ' UTC';
}

function minutesAgo(iso: string): number {
  return (Date.now() - Date.parse(iso)) / 60_000;
}

const PAGE_STYLE = `
  body { font-family: ui-sans-serif, system-ui, sans-serif; background: #faf6ee; color: #2b2620; margin: 0; padding: 24px; }
  a { color: #2b2620; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #2b262099; font-size: 13px; margin-bottom: 20px; }
  table { border-collapse: collapse; width: 100%; background: #fff; border: 1px solid #2b26201a; border-radius: 8px; overflow: hidden; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #2b262014; vertical-align: top; }
  th { background: #f2ecdd; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px; }
  .live { background: #e8f140; }
  .spam { background: #c8842c; color: #fff; }
  .muted { color: #2b262080; }
  .bubble { max-width: 640px; padding: 10px 14px; border-radius: 10px; margin: 6px 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
  .user { background: #2b2620; color: #fff; margin-left: auto; }
  .ari { background: #e8f140; }
  .thread { display: flex; flex-direction: column; max-width: 720px; }
  .stamp { font-size: 11px; color: #2b262066; margin: 2px 4px; }
  .user + .stamp, .row-user .stamp { text-align: right; }
`;

function page(title: string, body: string): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title><style>${PAGE_STYLE}</style></head>
<body>${body}</body></html>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

async function renderSessionList(db: D1Database): Promise<Response> {
  const { results } = await db
    .prepare(
      `SELECT s.*,
              (SELECT content FROM messages m
                WHERE m.session_id = s.id AND m.role = 'user'
                ORDER BY m.id LIMIT 1) AS first_question,
              (SELECT COUNT(*) FROM messages m
                WHERE m.session_id = s.id AND m.status = 'rate_limited') AS rate_limited_count
         FROM sessions s
        ORDER BY s.last_active_at DESC
        LIMIT 200`,
    )
    .all<SessionRow>();

  const rows = results
    .map((s) => {
      const live = minutesAgo(s.last_active_at) < 10 ? ' <span class="badge live">active</span>' : '';
      const spam = s.rate_limited_count > 0 ? ` <span class="badge spam">${s.rate_limited_count} rate-limited</span>` : '';
      const preview = s.first_question ? escapeHtml(s.first_question.slice(0, 90)) : '<span class="muted">—</span>';
      const ua = s.user_agent ? escapeHtml(s.user_agent.slice(0, 60)) : '—';
      return `<tr>
        <td><a href="/admin/session/${escapeHtml(s.id)}">${formatWhen(s.started_at)}</a>${live}${spam}</td>
        <td>${s.message_count}</td>
        <td>${preview}</td>
        <td>${escapeHtml(s.country ?? '—')}<br><span class="muted">${escapeHtml(s.client_ip ?? '—')}</span></td>
        <td class="muted">${ua}</td>
      </tr>`;
    })
    .join('');

  return page(
    'Ask Ari — sessions',
    `<h1>Ask Ari — conversations</h1>
     <div class="sub">${results.length} session(s), newest activity first. Click a session to read the thread.</div>
     <table>
       <tr><th>Started</th><th>Msgs</th><th>First question</th><th>Where</th><th>User agent</th></tr>
       ${rows || '<tr><td colspan="5" class="muted">No conversations yet.</td></tr>'}
     </table>`,
  );
}

async function renderSession(db: D1Database, sessionId: string): Promise<Response> {
  const session = await db
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .bind(sessionId)
    .first<SessionRow>();
  if (!session) {
    return page('Not found', '<h1>Session not found</h1><p><a href="/admin">Back to all sessions</a></p>');
  }

  const { results: messages } = await db
    .prepare('SELECT role, content, status, created_at FROM messages WHERE session_id = ? ORDER BY id')
    .bind(sessionId)
    .all<MessageRow>();

  const thread = messages
    .map((m) => {
      const cls = m.role === 'user' ? 'user' : 'ari';
      const flag = m.status !== 'ok' ? ` · <span class="badge spam">${escapeHtml(m.status)}</span>` : '';
      return `<div class="bubble ${cls}">${escapeHtml(m.content)}</div>
        <div class="stamp" style="text-align:${m.role === 'user' ? 'right' : 'left'}">${formatWhen(m.created_at)}${flag}</div>`;
    })
    .join('');

  return page(
    'Ask Ari — session',
    `<h1>Conversation</h1>
     <div class="sub">
       <a href="/admin">← All sessions</a> ·
       started ${formatWhen(session.started_at)} · last activity ${formatWhen(session.last_active_at)} ·
       ${escapeHtml(session.country ?? '—')} / ${escapeHtml(session.client_ip ?? '—')}<br>
       <span class="muted">${escapeHtml(session.user_agent ?? '')}</span>
     </div>
     <div class="thread">${thread || '<p class="muted">No messages.</p>'}</div>`,
  );
}

export async function handleAdmin(
  request: Request,
  db: D1Database,
  adminToken: string | undefined,
): Promise<Response> {
  if (!adminToken) {
    return new Response('Admin dashboard is not configured (missing ADMIN_TOKEN secret).', { status: 503 });
  }
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (!isAuthorized(request, adminToken)) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Ask Ari Admin", charset="UTF-8"' },
    });
  }

  const path = new URL(request.url).pathname;
  const sessionMatch = path.match(/^\/admin\/session\/([0-9a-z-]+)$/i);
  if (sessionMatch) {
    return renderSession(db, sessionMatch[1].toLowerCase());
  }
  if (path === '/admin' || path === '/admin/') {
    return renderSessionList(db);
  }
  return new Response('Not found', { status: 404 });
}
