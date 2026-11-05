#!/usr/bin/env python3
"""Build index.html from src/.

  python3 scripts/build.py

src/hero.html   animated hero scene (its <style>, <template> and <script> are lifted out)
src/body.html   page markup
src/base.css    base styles        src/base.js   base behavior (chat, overlay, spotlight, …)
src/modules/    x-*.css / x-*.js feature modules, applied in name order
"""
import glob, json, os, re, shutil, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
read = lambda *p: open(os.path.join(*p), encoding='utf-8').read()

hero = read(SRC, 'hero.html')
hero_css = re.search(r'<style>(.*?)</style>', hero, re.S).group(1)
hero_tpl = re.search(r'<template id="scene-tpl">(.*?)</template>', hero, re.S).group(1)
hero_js = re.search(r'<script>(.*?)</script>', hero, re.S).group(1)

body = read(SRC, 'body.html').replace(
    '<div class="banner" id="banner"></div>',
    '<div class="banner" id="banner"></div>\n  <template id="scene-tpl">' + hero_tpl + '</template>', 1)
mods = sorted(glob.glob(os.path.join(SRC, 'modules', 'x-*')))
css = read(SRC, 'base.css') + ''.join(open(p, encoding='utf-8').read() for p in mods if p.endswith('.css'))
js = read(SRC, 'base.js') + ''.join('\n;' + open(p, encoding='utf-8').read() for p in mods if p.endswith('.js'))

ICON = ("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%23FFC93C%22/%3E"
        "%3Cg fill=%22none%22 stroke=%22%231B1A2E%22 stroke-width=%225%22%3E%3Ccircle cx=%2221%22 cy=%2232%22 r=%2210%22/%3E%3Ccircle cx=%2243%22 cy=%2232%22 r=%2210%22/%3E%3Cpath d=%22M31 31q1-3 2 0%22/%3E%3C/g%3E%3C/svg%3E")
SITE = 'https://saraths-portfolio.vercel.app'
DESC = ("Sarath Sundar Harisaravanan: USC MS CS student building backend systems and AI agents. Two years at IDFC FIRST Bank; "
        "2nd place in Anthropic's Claude for Public Benefit track at Cal Hacks 13.0.")
PERSON = {
    "@context": "https://schema.org",
    "@graph": [
        {"@type": "ProfilePage", "@id": SITE + "/#page", "url": SITE + "/", "name": "Sarath Sundar Harisaravanan",
         "mainEntity": {"@id": SITE + "/#person"}, "dateModified": "2026-11-05"},
        {"@type": "Person", "@id": SITE + "/#person", "name": "Sarath Sundar Harisaravanan", "url": SITE + "/",
         "image": SITE + "/og.png", "email": "mailto:harisara@usc.edu",
         "jobTitle": "Software engineer, backend systems and applied AI",
         "description": "USC MS Computer Science student building backend systems and AI agents; two years as an Application Engineer at IDFC FIRST Bank.",
         "address": {"@type": "PostalAddress", "addressLocality": "Los Angeles", "addressRegion": "CA", "addressCountry": "US"},
         "affiliation": {"@type": "CollegeOrUniversity", "name": "University of Southern California"},
         "alumniOf": [{"@type": "CollegeOrUniversity", "name": "PES University"},
                      {"@type": "Organization", "name": "IDFC FIRST Bank"}, {"@type": "Organization", "name": "ElementalsAI"}],
         "hasCredential": [{"@type": "EducationalOccupationalCredential", "credentialCategory": "degree", "name": "MS Computer Science (expected May 2028)", "recognizedBy": {"@type": "CollegeOrUniversity", "name": "University of Southern California"}},
                           {"@type": "EducationalOccupationalCredential", "credentialCategory": "degree", "name": "B.Tech. Computer Science and Engineering (May 2024)", "recognizedBy": {"@type": "CollegeOrUniversity", "name": "PES University"}}],
         "knowsAbout": ["Backend engineering", "Go", "Python", "SQL", "Java", "TypeScript", "Microservices", "Kafka", "PostgreSQL",
                        "Model Context Protocol (MCP)", "AI agents", "LangGraph", "Retrieval-augmented generation", "LLM evaluation", "PyTorch"],
         "award": ["2nd place, Anthropic's Claude for Public Benefit track, Cal Hacks 13.0 (2026)",
                   "Finalist, Top 15 teams, USC Origin Hackathon (2026)", "1st place, Hackerspace Hackathon (2021)"],
         "sameAs": ["https://github.com/sarathsundarh", "https://linkedin.com/in/sarathsundarh"]},
        {"@type": "CreativeWork", "name": "Drigil", "url": "https://devpost.com/software/drigil", "creator": {"@id": SITE + "/#person"},
         "dateCreated": "2026-10", "description": "Smart-glasses job coaching in the supervisor's own voice; 2nd place in Anthropic's Claude for Public Benefit track at Cal Hacks 13.0 (three-person team)."},
        {"@type": "ScholarlyArticle", "name": "NFTGenesis: An NFT Generation and Authentication System with Market Intelligence Using Deep Learning Based Steganography",
         "url": "https://ieeexplore.ieee.org/document/10649392", "datePublished": "2024", "author": {"@id": SITE + "/#person"}, "publisher": {"@type": "Organization", "name": "IEEE InC4"}},
        {"@type": "SoftwareSourceCode", "name": "Yet Another Kafka", "codeRepository": "https://github.com/sarathsundarh/BD_yetanother_kafka", "programmingLanguage": "Java", "author": {"@id": SITE + "/#person"}},
        {"@type": "CreativeWork", "name": "Mend", "url": "https://devpost.com/software/mend-do4rht", "dateCreated": "2026-09",
         "description": "One photo becomes a verified street-repair report; finalist, Top 15 teams, USC Origin Hackathon. Sarath built the surge pricing and rewards engine (five-person team)."},
    ],
}
JSONLD = json.dumps(PERSON, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sarath Sundar Harisaravanan</title>
<meta name="description" content="{DESC}" />
<meta property="og:title" content="Sarath Sundar Harisaravanan" />
<meta property="og:description" content="Backend systems and AI agents. Ask AI Sarath, try the live project demos, and see the work." />
<meta property="og:type" content="profile" />
<meta property="og:url" content="{SITE}/" />
<meta property="og:image" content="{SITE}/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Illustration of Sarath coding at a laptop, with the Golden Gate Bridge behind him" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="{SITE}/" />
<link rel="alternate" type="text/plain" href="{SITE}/llms.txt" title="llms.txt" />
<link rel="sitemap" type="application/xml" href="{SITE}/sitemap.xml" />
<script type="application/ld+json">{JSONLD}</script>
<meta name="theme-color" content="#F6F1E7" />
<link rel="icon" href="{ICON}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
<style>{hero_css}
{css}</style>
</head>
<body>
{body}
<script>{hero_js}</script>
<script>{js}</script>
</body>
</html>
'''
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(page)
print(f'index.html: {len(page):,} bytes from {len(mods)} modules')

# llms-full.txt is generated from the chat's knowledge base so the two never drift apart
node = shutil.which('node')
if node:
    subprocess.run([node, os.path.join(ROOT, 'scripts', 'llms.mjs')], check=True)
else:
    print('node not found: skipped llms-full.txt')
