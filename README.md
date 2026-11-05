# saraths-portfolio

Personal portfolio of **Sarath Sundar Harisaravanan**: USC MS CS student building backend systems and AI agents.

Live: https://saraths-portfolio.vercel.app

## Layout

| Path | What it is |
|---|---|
| `index.html` | Built homepage (generated, don't edit by hand) |
| `src/` | Homepage sources: `hero.html` (animated hero), `body.html`, `base.css`, `base.js`, and feature modules in `src/modules/x-*.css/js` |
| `pages/` | Drigil case study and the "How I built AI Sarath" note |
| `api/chat.js` | Vercel serverless function behind **Ask AI Sarath** (Gemini) |
| `api/_kb.js` | The knowledge base: the only facts AI Sarath may use |
| `scripts/build.py` | Builds `index.html` from `src/` |
| `scripts/eval.mjs` | Grounding checks against the deployed chat |

## Edit and rebuild

```bash
python3 scripts/build.py
```

Commit `index.html` along with your `src/` changes; Vercel serves the files as they are.

## AI Sarath (live chat)

`POST /api/chat` retrieves the most relevant facts from `api/_kb.js` with BM25, asks Gemini for a JSON answer (`answer`, `citations`, `action`), keeps only citations that were actually retrieved, and returns them to the page, which renders citation chips and scrolls to the cited item. `GET /api/chat` reports whether a key is configured.

Set these in Vercel → Project → Settings → Environment Variables, then redeploy:

| Variable | Required | Value |
|---|---|---|
| `GEMINI_API_KEY` | yes | Key from Google AI Studio |
| `GEMINI_MODEL` | no | Defaults to `gemini-3.1-flash-lite`; if a model is unavailable the function falls back to the cheapest Flash-Lite your key can use (`GET /api/chat?models` lists them) |

Without a key the chat falls back to scripted answers for the suggested questions. Guardrails: 1,000-character inputs, 12-turn history, best-effort per-IP rate limit (8/min, 60/hour), 15 s upstream timeout, answers only from the knowledge base.

Run the grounding checks after deploying:

```bash
node scripts/eval.mjs
```

## Notes

- The contact form is a front-end preview and doesn't send messages yet. Email: harisara@usc.edu.
- The project demos are labeled simulations that show how each system works, not benchmarks.
