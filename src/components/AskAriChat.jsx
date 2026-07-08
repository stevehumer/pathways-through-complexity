import { useState, useRef, useEffect } from 'react';
import ReactGA from 'react-ga4';
import ariImage from '../assets/ari-transparent.png';

const WORKER_URL = import.meta.env.VITE_ASK_ARI_WORKER_URL;

const STARTER_MESSAGE = {
  role: 'ari',
  text: "Hi, I'm Ari! Ask me anything about the books — the characters, the plots, or what I learned along the way.",
};

// Recent turns replayed to the worker so Ari remembers the conversation.
// The worker enforces its own cap; this just keeps the payload small.
const HISTORY_MESSAGES_SENT = 12;

const FALLBACK_REPLY = "Ari's taking a quick break — please try again in a bit!";

// The conversation persists in localStorage so a returning visitor picks up
// where they left off (same browser/device only; no login involved). The
// session UUID is saved too, so the resumed chat stays one thread in the
// transcript log.
const STORAGE_KEY = 'ask-ari-chat';
const STORAGE_MAX_MESSAGES = 40;
const STORAGE_TTL_MS = 60 * 24 * 60 * 60 * 1000; // idle chats expire after 60 days

function loadSavedChat() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (
      typeof saved?.sessionId !== 'string' ||
      !Array.isArray(saved.messages) ||
      Date.now() - (saved.savedAt ?? 0) > STORAGE_TTL_MS
    ) {
      return null;
    }
    const messages = saved.messages.filter(
      (m) => (m?.role === 'user' || m?.role === 'ari') && typeof m?.text === 'string',
    );
    return messages.length > 1 ? { sessionId: saved.sessionId, messages } : null;
  } catch {
    return null; // storage unavailable or corrupted: start fresh, like before
  }
}

function saveChat(sessionId, messages) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessionId,
        messages: messages.slice(-STORAGE_MAX_MESSAGES),
        savedAt: Date.now(),
      }),
    );
  } catch {
    // Storage unavailable (private mode etc.): chat still works, just won't persist.
  }
}

function clearSavedChat() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex items-center gap-1 rounded-lg px-3 py-3 bg-bookYellow">
      <span className="w-1.5 h-1.5 rounded-full bg-ink/70 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink/70 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink/70 animate-bounce" />
    </div>
  </div>
);

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
    <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
  </svg>
);

const CollapseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
    <path d="M8 4v4H4M16 4v4h4M8 20v-4H4M16 20v-4h4" />
  </svg>
);

export const AskAriChat = () => {
  // Restored once on mount; null when there's no (valid) saved conversation.
  const [savedChat] = useState(loadSavedChat);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(savedChat?.messages ?? [STARTER_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  // Anonymous conversation ID, created lazily on the first message so merely
  // opening the widget doesn't mint one. Groups the thread in the transcript
  // log; contains no visitor identity. Restored on revisit so a resumed chat
  // stays one thread.
  const sessionIdRef = useRef(savedChat?.sessionId ?? null);

  useEffect(() => {
    if (sessionIdRef.current && messages.length > 1) {
      saveChat(sessionIdRef.current, messages);
    }
  }, [messages]);

  const startNewChat = () => {
    if (!window.confirm('Start a new chat? Your current conversation will be cleared.')) return;
    clearSavedChat();
    sessionIdRef.current = null;
    setMessages([STARTER_MESSAGE]);
    setInput('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen && !isLoading) {
      inputRef.current?.focus();
    }
  }, [isOpen, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    if (!sessionIdRef.current) {
      sessionIdRef.current = crypto.randomUUID();
    }

    // Replay the conversation so far so Ari can answer follow-ups in context.
    // The worker validates, caps, and drops any leading assistant greeting.
    const history = messages
      .slice(-HISTORY_MESSAGES_SENT)
      .map(({ role, text }) => ({ role, text }));

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setIsLoading(true);
    // Counts only, never message content
    ReactGA.event({ category: 'Ask Ari', action: 'message_sent' });

    let reply;
    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          history,
          sessionId: sessionIdRef.current,
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && typeof data?.reply === 'string') {
        reply = data.reply;
      } else if (typeof data?.error === 'string') {
        // Worker error messages (rate limits etc.) are already written in
        // Ari's voice; anything unexpected gets the generic fallback.
        reply = data.error;
      } else {
        reply = FALLBACK_REPLY;
      }
    } catch {
      reply = FALLBACK_REPLY;
    }

    setMessages((prev) => [...prev, { role: 'ari', text: reply }]);
    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => {
          if (!isOpen) {
            // Counts only, never message content
            ReactGA.event({ category: 'Ask Ari', action: 'open' });
          }
          setIsOpen((open) => !open);
        }}
        aria-label={isOpen ? 'Close chat with Ari' : 'Chat with Ari'}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-bookYellow text-ink rounded-full shadow-lg pl-2.5 pr-5 py-2.5 hover:brightness-95 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 transition ${
          isOpen ? '' : 'animate-ari-nudge'
        }`}
      >
        <img src={ariImage} alt="" className="w-14 h-14 rounded-full object-cover" />
        <span className="font-medium text-base">{isOpen ? 'Close' : 'Ask Ari'}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with Ari"
          className={`fixed z-50 bg-paper rounded-lg shadow-2xl border border-ink/10 flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'bottom-24 right-6 w-[90vw] max-w-2xl h-[75vh] max-h-[75vh]'
              : 'bottom-24 right-6 w-[90vw] max-w-sm h-[28rem] max-h-[70vh]'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-bookYellow">
            <div className="flex items-center gap-2">
              <img src={ariImage} alt="Ari" className="w-8 h-8 rounded-full object-cover" />
              <span className="font-display font-semibold text-ink">Chat with Ari</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={startNewChat}
                aria-label="Start a new chat"
                title="Start a new chat"
                className="text-ink/70 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded text-xs font-medium underline underline-offset-2"
              >
                New chat
              </button>
              <button
                onClick={() => setIsExpanded((expanded) => !expanded)}
                aria-label={isExpanded ? 'Collapse chat' : 'Expand chat'}
                className="text-ink/70 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
              >
                {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="text-ink/70 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded text-2xl leading-none"
              >
                &times;
              </button>
            </div>
          </div>

          <p className="px-4 pt-2 pb-1 text-xs text-ink/60 italic border-b border-ink/10">
            Ari&apos;s replies are AI-generated, inspired by the books&apos; characters and
            writing — not written by the author. Chats may be reviewed to improve Ari.
          </p>

          <div aria-live="polite" className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    isExpanded ? 'max-w-[70%]' : 'max-w-[80%]'
                  } ${
                    message.role === 'user'
                      ? 'bg-ink text-white'
                      : 'bg-bookYellow text-ink'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex border-t border-ink/10 p-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Ari a question!"
              maxLength={500}
              disabled={isLoading}
              className="flex-1 min-w-0 bg-white rounded border border-ink/15 focus:border-gold focus:ring-2 focus:ring-gold/30 text-sm outline-none text-ink py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="ml-2 text-paper bg-ink border-0 py-2 px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 hover:bg-gold disabled:opacity-50 disabled:hover:bg-ink transition-colors duration-200 rounded text-sm"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};
