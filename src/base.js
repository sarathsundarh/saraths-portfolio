(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroSvg = $('#banner svg');
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));

  /* ---------------- reveal on scroll ---------------- */
  const revealEls = $$('h2.sec, .proj, .tl-item, .stack, .ach, .pub, .bio, .contact');
  
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => io.observe(el));

  /* ---------------- avatar: agents spawning sub-agents, in parallel ---------------- */
  const swarm = (() => {
    const cv = $('#swarm'); if (!cv) return { burst() {} };
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    function size() {
      dpr = Math.min(3, window.devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size(); new ResizeObserver(size).observe(cv);
    const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    let C = {};
    const readColors = () => (C = { ink: css('--ink'), accent: css('--accent'), gold: css('--gold'), rule: css('--rule'), panel: css('--panel'), muted: css('--muted') });
    readColors(); new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);

    const rand = (a, b) => a + Math.random() * (b - a);
    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    let nodes, parts, t0, speed = 1, end;
    function plan(fast) {
      speed = fast ? 1.8 : 1;
      nodes = [{ id: 0, parent: null, depth: 0, a: 0, d: 0, born: 0, start: 0.15, kids: [] }];
      const n1 = Math.random() < 0.5 ? 3 : 4, rot = rand(0, Math.PI * 2);
      for (let i = 0; i < n1; i++) {
        const a = rot + (i / n1) * Math.PI * 2;
        const c = { id: nodes.length, parent: 0, depth: 1, a, d: 0.5, born: 0.35 + i * 0.12, kids: [] };
        c.start = c.born + 0.3; nodes.push(c); nodes[0].kids.push(c.id);
        const n2 = 1 + Math.floor(rand(1, 3.99));          // 2-3 workers each
        for (let j = 0; j < n2; j++) {
          const spread = 0.5, aj = a + (n2 === 1 ? 0 : (j / (n2 - 1) - 0.5) * spread * 2);
          const g = { id: nodes.length, parent: c.id, depth: 2, a: aj, d: 0.86, born: c.start + 0.25 + j * 0.1, kids: [] };
          g.start = g.born + 0.25; g.done = g.start + rand(0.9, 2.4);
          nodes.push(g); c.kids.push(g.id);
        }
      }
      // parents finish once every child has reported back (result dot travel = 0.4s)
      for (const depth of [1, 0]) nodes.filter((n) => n.depth === depth).forEach((n) => (n.done = Math.max(...n.kids.map((k) => nodes[k].done)) + 0.45));
      end = nodes[0].done + 1.4;
      parts = nodes.filter((n) => n.parent !== null).map((n) => ({ from: n.id, to: n.parent, at: n.done }));
      t0 = performance.now();
    }
    function pos(n, t) {
      if (n.parent === null) return [W / 2, H / 2];
      const [px, py] = pos(nodes[n.parent], t);
      const R = Math.min(W, H) / 2 - 7;
      const grow = ease((t - n.born) / 0.4);
      const tx = W / 2 + Math.cos(n.a) * n.d * R, ty = H / 2 + Math.sin(n.a) * n.d * R;
      return [px + (tx - px) * grow, py + (ty - py) * grow];
    }
    function bot(x, y, s, done, t) {
      ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.fillStyle = done ? C.gold : C.panel;
      const w = s * 2.2, h = s * 1.8, r = s * 0.55;
      ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2 + 2, w, h, r); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - h / 2 + 2); ctx.lineTo(x, y - h / 2 - 3); ctx.stroke();
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(x, y - h / 2 - 5, 2.2 + Math.sin(t * 6) * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink;
      const blink = (t % 3.1) < 0.12 ? 0.25 : 1;
      [-1, 1].forEach((k) => { ctx.beginPath(); ctx.ellipse(x + k * s * 0.45, y + 1, 1.8, 1.8 * blink, 0, 0, Math.PI * 2); ctx.fill(); });
    }
    function frame(now) {
      if (!nodes) plan(false);
      const t = ((now - t0) / 1000) * speed;
      ctx.clearRect(0, 0, W, H);
      const fadeOut = 1 - ease((t - (end - 0.5)) / 0.5);
      ctx.globalAlpha = Math.max(0, fadeOut);
      // edges
      nodes.forEach((n) => {
        if (n.parent === null || t < n.born) return;
        const [x, y] = pos(n, t), [px, py] = pos(nodes[n.parent], t);
        ctx.strokeStyle = t > n.done ? C.ink : C.muted; ctx.lineWidth = 1.2; ctx.setLineDash(t > n.done ? [] : [2, 2.5]);
        ctx.lineDashOffset = -t * 12;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      });
      ctx.setLineDash([]);
      // result dots flowing back to parents
      parts.forEach((p) => {
        const k = (t - p.at) / 0.4; if (k < 0 || k > 1) return;
        const [x1, y1] = pos(nodes[p.from], t), [x2, y2] = pos(nodes[p.to], t), e = ease(k);
        ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(x1 + (x2 - x1) * e, y1 + (y2 - y1) * e, 2.2, 0, Math.PI * 2); ctx.fill();
      });
      // nodes, deepest first so parents sit on top
      [...nodes].reverse().forEach((n) => {
        if (t < n.born) return;
        const [x, y] = pos(n, t);
        const sc = ease((t - n.born) / 0.35);
        const done = t >= n.done;
        if (n.depth === 0) {
          if (done) { const g = ease((t - n.done) / 0.5); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.globalAlpha = Math.max(0, fadeOut) * (1 - g); ctx.beginPath(); ctx.arc(x, y, 12 + g * 22, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = Math.max(0, fadeOut); }
          bot(x, y, 8.5 * (0.6 + 0.4 * sc), done, t);
          return;
        }
        const r = (n.depth === 1 ? 5 : 3.6) * sc;
        ctx.fillStyle = done ? C.ink : C.panel; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (!done && t > n.start) {
          // progress ring: workers fill by time, parents by children reporting back
          const prog = n.kids.length ? n.kids.filter((k) => t >= nodes[k].done + 0.4).length / n.kids.length : (t - n.start) / (n.done - n.start);
          ctx.strokeStyle = C.accent; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(x, y, r + 2.6, -Math.PI / 2 + t * 2, -Math.PI / 2 + t * 2 + Math.max(0.35, prog * Math.PI * 2)); ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      if (t > end) plan(false);
      if (!reduceMotion) requestAnimationFrame(frame);
    }
    if (reduceMotion) { plan(false); t0 = performance.now() - (nodes[0].done - 0.2) * 1000; frame(performance.now()); }
    else requestAnimationFrame(frame);
    return { burst() { if (!reduceMotion) plan(true); } };
  })();

  /* ---------------- marker circle (hand-drawn ink loop) ---------------- */
  const marker = $('#marker'), markerPath = $('#marker path');
  let markerTimer;
  function circle(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pad = 10, w = Math.min(r.width + pad * 2, document.documentElement.clientWidth - 8), h = r.height + pad * 2;
    marker.style.left = `${Math.max(4, r.left + window.scrollX - pad)}px`;
    marker.style.top = `${r.top + window.scrollY - pad}px`;
    marker.setAttribute('width', w); marker.setAttribute('height', h);
    marker.style.width = `${w}px`; marker.style.height = `${h}px`;
    const cx = w / 2, cy = h / 2, rx = w / 2 - 2, ry = h / 2 - 2;
    let d = '';
    const turns = 1.12, steps = 64, a0 = -2.2;
    for (let i = 0; i <= steps; i++) {
      const t = a0 + (i / steps) * Math.PI * 2 * turns;
      const wob = 1 + Math.sin(i * 0.9) * 0.012 + (i / steps) * 0.03;
      const c = Math.cos(t), sn = Math.sin(t), e = 0.55; // superellipse hugs wide or tall boxes
      const x = cx + Math.sign(c) * Math.abs(c) ** e * rx * wob, y = cy + Math.sign(sn) * Math.abs(sn) ** e * ry * wob;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    markerPath.setAttribute('d', d);
    marker.classList.remove('on', 'off'); void marker.getBoundingClientRect(); marker.classList.add('on');
    const fl = el.closest('.proj') || el; fl.classList.remove('flash'); void fl.offsetWidth; fl.classList.add('flash');
    clearTimeout(markerTimer);
    markerTimer = setTimeout(() => marker.classList.replace('on', 'off'), 4200);
  }
  function goTo(sel) {
    if (sel === '#ask') return window.__chat?.open(); // the chat floats; nothing to scroll to
    let el = $(sel); if (!el) return;
    const ring = el.classList.contains('proj') ? $('.proj-top h3', el) : el;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    // wait for the scroll to settle before drawing
    let last = -1, still = 0;
    const tick = () => { const y = window.scrollY; still = y === last ? still + 1 : 0; last = y; if (still > 6) circle(ring); else requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* ---------------- Ask AI Sarath: scripted demo ---------------- */
  const SCRIPT = [
    {
      a: 'At IDFC FIRST Bank I built a Go MCP server with the engineering team: a shared tool layer that lets AI agents query CRM and asset-management systems. It cut those lookups from minutes to under 5 seconds. I also tuned SQL over 50M+ records (42% faster APIs) and set up observability that helped cut incident resolution time by 35%.',
      cites: [['IDFC · MCP server', '#x-mcp'], ['IDFC · SQL tuning', '#x-sql'], ['IDFC · observability', '#x-obs']],
      tool: ['scroll_to_section', '"experience"', '#x-mcp'],
    },
    {
      a: "Drigil is smart-glasses job coaching for people with intellectual and developmental disabilities. My three-person team built it in 36 hours at Cal Hacks 13.0. It turns a supervisor's narrated demo into a step-by-step task spec with Claude, checks each step through the camera, and coaches in the supervisor's own cloned voice. It placed 2nd in Anthropic's Claude for Public Benefit track.",
      cites: [['Drigil · project', '#p-drigil'], ['Drigil · Devpost', 'https://devpost.com/software/drigil']],
      tool: ['show_project', '"drigil"', '#p-drigil'],
    },
    {
      a: "Not overall, and I'd rather be precise: my team placed 2nd in Anthropic's Claude for Public Benefit track at Cal Hacks 13.0.",
      cites: [['Achievements', '#a-calhacks']],
      tool: ['scroll_to_section', '"achievements"', '#a-calhacks'],
    },
    {
      a: "Yes! I'm looking for Summer 2027 internships in software engineering and applied AI. The quickest way to reach me is the contact form below, or harisara@usc.edu.",
      cites: [['Contact', '#contactForm']],
      tool: ['scroll_to_section', '"contact"', '#contactForm'],
    },
  ];
  const FALLBACK = "The live chat isn't available right now, so I can only answer the suggested questions here. For anything else, email harisara@usc.edu and the real Sarath will reply.";
  // live mode: the Vercel function answers with Gemini, grounded in my resume
  const history = [];
  let live = false;
  const modeTag = document.getElementById('chatMode');
  fetch('/api/chat', { method: 'GET' }).then((r) => (r.ok ? r.json() : null)).then((j) => {
    live = Boolean(j && j.live);
    if (modeTag) modeTag.textContent = live ? 'live · grounded in my resume' : 'preview · scripted answers';
    if (modeTag) modeTag.classList.toggle('is-live', live);
  }).catch(() => {});
  async function askLive(text) {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
        body: JSON.stringify({ messages: [...history, { role: 'user', content: text }].slice(-12) }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 429) return { answer: j.message || "That's a lot of questions at once. Give it a minute.", citations: [], action: null };
      if (!r.ok || !j.answer) return null;
      return j;
    } catch { return null; } finally { clearTimeout(t); }
  }
  const chat = $('#chat'), suggest = $('#suggest');
  let busy = false;
  const heroCls = (add, ...c) => heroSvg && c.forEach((x) => heroSvg.classList.toggle(x, add));

  function addMsg(who, html) {
    const m = document.createElement('div');
    m.className = `msg ${who}`;
    m.innerHTML = (who === 'ai' ? '<span class="av" aria-hidden="true"></span>' : '') + `<div class="bubble-t">${html}</div>`;
    chat.appendChild(m); chat.scrollTop = chat.scrollHeight;
    return m.querySelector('.bubble-t');
  }
  async function stream(el, text) {
    el.textContent = '';
    const words = text.split(/(\s+)/);
    for (const w of words) {
      if (!w) continue;
      const s = document.createElement('span'); s.className = 'tok'; s.textContent = w; el.appendChild(s);
      chat.scrollTop = chat.scrollHeight;
      if (w.trim()) await wait(28 + Math.random() * 30);
    }
  }
  async function ask(text, i) {
    if (busy) return; busy = true;
    $$('button', suggest).forEach((b) => (b.disabled = true));
    addMsg('me', text.replace(/</g, '&lt;'));
    const bubble = addMsg('ai', '<span class="typing-dots"><i></i><i></i><i></i></span>');
    swarm.burst(); heroCls(true, 'chat-think');
    const t0 = performance.now();
    let res = live ? await askLive(text) : null;
    let item = SCRIPT[i];
    if (res) {
      // turn the live answer into the same shape the UI already renders
      item = {
        a: res.answer,
        cites: (res.citations || []).map((c) => [c.label, c.target]).concat([...new Map((res.citations || []).filter((c) => c.href).map((c) => [c.href, [c.label.split(' · ')[0] + ' ↗', c.href]])).values()]),
        tool: res.action ? ['scroll_to_section', `"${res.action.target.replace('#', '')}"`, res.action.target] : null,
      };
    }
    await wait(Math.max(0, 900 - (performance.now() - t0)));
    heroCls(false, 'chat-think'); heroCls(true, 'chat-answer');
    setTimeout(() => heroCls(false, 'chat-answer'), 1800);
    await stream(bubble, item ? item.a : FALLBACK);
    history.push({ role: 'user', content: text }, { role: 'assistant', content: item ? item.a : FALLBACK });
    if (item) {
      const cites = document.createElement('div'); cites.className = 'cites';
      item.cites.forEach(([label, target], k) => {
        const ext = target.startsWith('http');
        const b = document.createElement(ext ? 'a' : 'button'); b.className = 'cite'; b.textContent = label; b.style.animationDelay = `${k * 0.12}s`;
        if (ext) { b.href = target; b.target = '_blank'; b.rel = 'noreferrer'; } else b.onclick = () => goTo(target);
        cites.appendChild(b);
      });
      if (item.cites.length) bubble.appendChild(cites);
      if (!item.tool) { busy = false; $$('button', suggest).forEach((b) => (b.disabled = false)); return; }
      await wait(700);
      const ev = document.createElement('div'); ev.className = 'toolev';
      ev.innerHTML = `↳ <code>${item.tool[0]}(${item.tool[1]})</code> moving the page…`;
      bubble.appendChild(ev); chat.scrollTop = chat.scrollHeight;
      await wait(500);
      goTo(item.tool[2]);
      showBack();
    }
    busy = false;
    $$('button', suggest).forEach((b) => (b.disabled = false));
  }
  $$('button', suggest).forEach((b) => (b.onclick = () => ask(b.textContent, +b.dataset.q)));
  $('#askForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#askBox').value.trim(); if (!v) return;
    $('#askBox').value = '';
    const idx = SCRIPT.findIndex((_, k) => $$('button', suggest)[k].textContent.toLowerCase() === v.toLowerCase());
    ask(v, idx);
  });
  // "back to chat" pill after the chat moves the page
  function showBack() { window.__chat?.afterMove(); }

  /* ---------------- project case-study morph ---------------- */
  const overlay = $('#overlay'), caseBody = $('#caseBody');
  let openCard = null;
  function fillCase(card) {
    const h3 = $('h3', card).cloneNode(true);
    const title = h3.firstChild.textContent.trim();
    const badges = [...h3.children].map((c) => c.outerHTML).join(' ');
    const bullets = [...$$(':scope > ul li', card), ...$$('.case li', card)].map((li) => `<li>${li.innerHTML}</li>`).join('');
    caseBody.innerHTML = `${$('.doodle', card).outerHTML}<h3 id="case-title">${title}</h3><div style="display:flex;gap:8px;flex-wrap:wrap">${badges}</div>
      <p class="tagline">${$('.tagline', card).textContent}</p>${bullets ? `<ul>${bullets}</ul>` : ''}
      ${$('.tags', card) ? $('.tags', card).outerHTML : ''}${$$('.case .link', card).map((l) => l.outerHTML).join(' ')}`;
  }
  const vt = (fn) => (document.startViewTransition && !reduceMotion ? document.startViewTransition(fn) : (fn(), null));
  function openCase(card) {
    openCard = card;
    card.style.viewTransitionName = 'case';
    vt(() => {
      card.style.viewTransitionName = '';
      fillCase(card); overlay.hidden = false;
      $('.case-panel').style.viewTransitionName = 'case';
    });
    setTimeout(() => $('#caseClose').focus(), 50);
  }
  function closeCase() {
    if (!openCard) return;
    const card = openCard; openCard = null;
    const t = vt(() => { $('.case-panel').style.viewTransitionName = ''; overlay.hidden = true; card.style.viewTransitionName = 'case'; });
    const done = () => { card.style.viewTransitionName = ''; card.focus({ preventScroll: true }); };
    t ? t.finished.then(done) : done();
  }
  $$('.proj').forEach((card) => {
    card.addEventListener('click', (e) => { if (!e.target.closest('a')) openCase(card); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCase(card); } });
  });
  $('#caseClose').onclick = closeCase;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCase(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCase(); clearSpot(); } });

  /* ---------------- skills light up your work ---------------- */
  const norm = (s) => ' ' + s.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  const pop = document.createElement('div'); pop.className = 'spot-count'; document.body.appendChild(pop);
  let pinned = null;
  function labelOf(el) {
    if (el.classList.contains('proj')) return $('h3', el).firstChild.textContent.trim();
    const org = $('.org', el.closest('.tl-item'));
    return org ? org.textContent.split('·')[0].trim() : 'Experience';
  }
  function spot(btn) {
    const skill = norm(btn.dataset.skill);
    const matches = $$('[data-skills]').filter((el) => norm(el.dataset.skills).includes(skill));
    $$('[data-skills]').forEach((el) => el.classList.toggle('match', matches.includes(el)));
    document.body.classList.add('spotlight');
    $$('.stack button').forEach((b) => b.classList.toggle('on', b === btn));
    const counts = {}; matches.forEach((m) => { const l = labelOf(m); counts[l] = (counts[l] || 0) + 1; });
    const list = Object.entries(counts).map(([l, n]) => (n > 1 ? `${l} ×${n}` : l)).join(' · ');
    pop.textContent = matches.length ? `${btn.textContent} → ${list}` : `${btn.textContent} → see the resume`;
    pop.classList.toggle('pinned', pinned === btn);
    if (pinned === btn) { pop.textContent += '  ·  esc to clear'; pop.style.left = '50%'; pop.style.top = ''; }
    else { const r = btn.getBoundingClientRect(); pop.style.left = `${Math.min(window.innerWidth - 20 - pop.offsetWidth, Math.max(12, r.left))}px`; pop.style.top = `${r.bottom + 8}px`; }
    pop.classList.add('on');
  }
  function clearSpot() {
    pinned = null; document.body.classList.remove('spotlight'); pop.classList.remove('on');
    $$('[data-skills].match').forEach((el) => el.classList.remove('match'));
    $$('.stack button.on').forEach((b) => b.classList.remove('on'));
  }
  $$('.stack button').forEach((b) => {
    b.addEventListener('mouseenter', () => !pinned && spot(b));
    b.addEventListener('focus', () => !pinned && spot(b));
    b.addEventListener('mouseleave', () => !pinned && clearSpot());
    b.addEventListener('blur', () => !pinned && clearSpot());
    b.addEventListener('click', () => {
      if (pinned === b) return clearSpot();
      pinned = b; spot(b);
      const first = $('[data-skills].match'); if (first) setTimeout(() => goTo(first.classList.contains('proj') ? '#' + first.id : '#' + (first.id || first.closest('.tl-item').id)), 350);
    });
  });
  document.addEventListener('click', (e) => { if (pinned && !e.target.closest('.stack') && !e.target.closest('[data-skills]')) clearSpot(); });
  window.addEventListener('scroll', () => { if (!pinned) pop.classList.remove('on'); }, { passive: true });

  /* ---------------- paper-plane contact form ---------------- */
  const form = $('#contactForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.classList.contains('folding')) return;
    form.classList.add('folding'); await wait(550);
    form.classList.add('flying'); await wait(1300);
    form.classList.add('sent'); await wait(2600);
    form.reset(); form.classList.remove('folding', 'flying', 'sent');
  });

  /* ---------------- dock + fabs ---------------- */
  const links = $$('.dock a');
  const secIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach((s) => secIO.observe(s));
  const openChat = (e) => window.__chat?.toggle(e && e.currentTarget);
  $('#chatFab').onclick = openChat;
  if ($('#dockChat')) $('#dockChat').onclick = openChat;
  if ($('#dockUp')) $('#dockUp').onclick = () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  const up = $('#upFab');
  $('#upFab').onclick = () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  window.addEventListener('scroll', () => up.classList.toggle('on', window.scrollY > 700), { passive: true });
  window.__mock = { goTo, ask, circle, swarm, SCRIPT };
})();
