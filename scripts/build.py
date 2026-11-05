#!/usr/bin/env python3
"""Build index.html from src/.

  python3 scripts/build.py

src/hero.html   animated hero scene (its <style>, <template> and <script> are lifted out)
src/body.html   page markup
src/base.css    base styles        src/base.js   base behavior (chat, overlay, spotlight, …)
src/modules/    x-*.css / x-*.js feature modules, applied in name order
"""
import glob, os, re

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
DESC = ("Sarath Sundar Harisaravanan: USC MS CS student building backend systems and AI agents. Two years at IDFC FIRST Bank; "
        "2nd place in Anthropic's Claude for Public Benefit track at Cal Hacks 13.0.")
page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sarath Sundar Harisaravanan</title>
<meta name="description" content="{DESC}" />
<meta property="og:title" content="Sarath Sundar Harisaravanan" />
<meta property="og:description" content="Backend systems and AI agents. Ask AI Sarath, try the live project demos, and see the work." />
<meta property="og:type" content="website" />
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
