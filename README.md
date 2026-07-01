# pathways-through-complexity

Author website for Ross R. Humer's "Pathways Through Complexity" and the "Bine Ari
Digit (BAD) Adventures" book series. Deployed to GitHub Pages at
[pathwaysthroughcomplexity.com](https://pathwaysthroughcomplexity.com).

## Dev commands

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # preview the production build
npm run lint      # ESLint across the project
```

Copy `.env.example` to `.env` and set `VITE_ASK_ARI_WORKER_URL` to the deployed Ask
Ari Cloudflare Worker URL (see `worker/README.md`) to test the chatbot locally.

## Structure

```
src/
├── components/
│   ├── Header.jsx           # Fixed top bar
│   ├── PathwaysHero.jsx      # "Pathways Through Complexity" hero + buy links
│   ├── VideoSection.jsx      # "Key Topics in Pathways" + slideshow video
│   ├── BadAdventures.jsx     # Three BAD Adventures book cards
│   ├── TrilogySection.jsx    # Bind-up trilogy paperback
│   ├── ContactSection.jsx    # "Contact the Author" Formspree form
│   ├── AskAriChat.jsx        # Floating Ask Ari chatbot widget
│   ├── ClickableImage.jsx    # Shared click-to-enlarge image lightbox
│   ├── Footer.jsx
│   └── PromoBanner.jsx       # Currently disabled; see comments in App.jsx to re-enable
├── hooks/
│   └── useInView.js          # IntersectionObserver hook for scroll-in fade animations
├── utils/
│   └── outboundLinkTracking.js # Shared GA4 outbound-link click handler
└── styles/
    └── buttons.js             # Shared button className constant
```

## Ask Ari chatbot

The floating "Ask Ari" widget calls a Cloudflare Worker (`worker/`) that proxies to
the Claude API, keeping the Anthropic key server-side. See `worker/README.md` for
setup/deploy instructions and `worker/ARI_PERSONA.md` for what's baked into Ari's
persona and knowledge base, and where that content comes from.

## Deployment

Pushing to `main` triggers `.github/workflows/vite-workflow.yaml`, which builds the
site and deploys it to GitHub Pages. The custom domain is configured via
`public/CNAME` (bundled into every build) and the GitHub repo's Pages settings.

The Worker deploys independently — see `worker/README.md`.

## Book content

The `books/` folder (source manuscript PDFs and any extracted text) is gitignored;
this repo is public, and the manuscripts stay local-only. Condensed, non-verbatim
summaries used to build Ari's knowledge base live in `worker/content-notes/` and
are safe to commit. See `scripts/extract-book-text.py` to regenerate the local
extracted text from the PDFs if needed.
