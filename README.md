# saraths-portfolio

Personal portfolio of **Sarath Sundar Harisaravanan**: USC MS CS student building backend systems and AI agents.

Live site: https://sarathsundarh.github.io/saraths-portfolio/

## What's here

| Path | Page |
|---|---|
| `index.html` | Homepage: animated hero, Ask AI Sarath (scripted preview), projects with live demos, experience, skills, achievements, contact |
| `pages/drigil.html` | Drigil case study (2nd place, Anthropic's Claude for Public Benefit track, Cal Hacks 13.0) |
| `pages/ai-sarath.html` | Notes: how the AI Sarath chat is designed (draft) |

The site is plain static HTML, CSS and JavaScript with no build step. Fonts load from Google Fonts.

## Hosting

The site is served by GitHub Pages from the `main` branch root (`.nojekyll` disables Jekyll processing).

## Notes

- The chat on the homepage currently plays scripted answers for the suggested questions. The live version (Claude with retrieval, citations and page-control tools) needs a serverless backend, planned for Vercel.
- The contact form is a front-end preview and doesn't send messages yet. Email: harisara@usc.edu.
- The project demos are labeled simulations that show how each system works, not benchmarks.
