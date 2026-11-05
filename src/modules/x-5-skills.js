(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const cv = $('#skillsCanvas'); if (!cv) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = cv.getContext('2d');
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const norm = (s) => ' ' + s.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim() + ' ';

  // ---- graph built from the page itself, so it always matches the content
  const nodes = [], edges = [];
  const work = [];
  $$('.proj').forEach((p) => work.push({ label: $('h3', p).firstChild.textContent.trim(), skills: norm(p.dataset.skills), target: '#' + p.id }));
  $$('.tl-item').forEach((it) => {
    const lis = $$('li[data-skills]', it); if (!lis.length) return;
    const org = $('.org', it).textContent.split('·')[0].trim();
    work.push({ label: org.replace(' FIRST Bank', ''), skills: norm(lis.map((l) => l.dataset.skills).join(' ')), target: '#' + it.id });
  });
  work.forEach((w) => nodes.push({ type: 'work', label: w.label, target: w.target, skills: w.skills }));
  const btns = $$('#stackList button[data-skill]');
  btns.forEach((b) => {
    const n = { type: 'skill', label: b.textContent.trim(), btn: b, key: norm(b.dataset.skill) };
    nodes.push(n);
  });
  nodes.forEach((n, i) => { if (n.type !== 'skill') return; nodes.forEach((w, j) => { if (w.type === 'work' && w.skills.includes(n.key)) edges.push([i, j]); }); });
  const deg = nodes.map((_, i) => edges.filter((e) => e[0] === i || e[1] === i).length);
  const nb = nodes.map((_, i) => new Set(edges.flatMap((e) => (e[0] === i ? [e[1]] : e[1] === i ? [e[0]] : []))));

  let W = 0, H = 0, dpr = 1;
  function size() { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size();
  nodes.forEach((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2;
    const r = n.type === 'work' ? 0.18 : 0.36;
    n.x = W / 2 + Math.cos(a) * W * r; n.y = H / 2 + Math.sin(a) * H * r * 0.9; n.vx = 0; n.vy = 0;
  });
  new ResizeObserver(() => { const ow = W, oh = H; size(); nodes.forEach((n) => { n.x *= W / (ow || W); n.y *= H / (oh || H); }); alpha = 0.6; if (typeof draw === 'function') draw(); }).observe(cv);

  // ---- tiny force simulation: repulsion + springs + centering
  let alpha = 1, hover = -1, drag = -1, moved = false;
  function tick() {
    const k = 0.9 * alpha;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]; let dx = b.x - a.x, dy = b.y - a.y; let d2 = dx * dx + dy * dy || 1;
      const f = (a.type === 'work' && b.type === 'work' ? 5600 : 2300) / d2;
      const d = Math.sqrt(d2); dx /= d; dy /= d;
      a.vx -= dx * f * k; a.vy -= dy * f * k; b.vx += dx * f * k; b.vy += dy * f * k;
    }
    edges.forEach(([i, j]) => {
      const a = nodes[i], b = nodes[j]; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
      const f = (d - 88) * 0.012 * k; a.vx += (dx / d) * f; a.vy += (dy / d) * f; b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
    });
    nodes.forEach((n, i) => {
      n.vx += (W / 2 - n.x) * 0.0016 * k; n.vy += (H / 2 - n.y) * 0.0022 * k;
      if (i === drag) { n.vx = n.vy = 0; return; }
      n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx; n.y += n.vy;
      const m = 34; n.x = Math.max(m, Math.min(W - m, n.x)); n.y = Math.max(18, Math.min(H - 34, n.y));
    });
    alpha = Math.max(0.02, alpha * 0.992);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const ink = css('--ink'), mut = css('--muted'), acc = css('--accent'), paper = css('--paper'), rule = css('--rule');
    const focus = hover >= 0 ? hover : drag;
    const on = (i) => focus < 0 || i === focus || nb[focus].has(i);
    edges.forEach(([i, j]) => {
      const hot = focus >= 0 && (i === focus || j === focus);
      ctx.strokeStyle = hot ? acc : rule; ctx.lineWidth = hot ? 1.8 : 1; ctx.globalAlpha = focus >= 0 && !hot ? 0.25 : 1;
      ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    nodes.forEach((n, i) => {
      ctx.globalAlpha = on(i) ? 1 : 0.22;
      if (n.type === 'work') {
        ctx.font = '500 11.5px Geist Mono, monospace';
        const w = ctx.measureText(n.label).width + 18;
        ctx.fillStyle = i === focus ? acc : ink;
        ctx.beginPath(); ctx.roundRect(n.x - w / 2, n.y - 12, w, 24, 8); ctx.fill();
        ctx.fillStyle = paper; ctx.fillText(n.label, n.x, n.y + 0.5);
      } else {
        const r = 4 + Math.min(4, deg[i]);
        ctx.fillStyle = paper; ctx.strokeStyle = i === focus ? acc : ink; ctx.lineWidth = i === focus ? 2.4 : 1.5;
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.font = '11px Geist Mono, monospace'; ctx.fillStyle = i === focus ? acc : mut;
        ctx.fillText(n.label, n.x, n.y - r - 8);
      }
    });
    ctx.globalAlpha = 1;
    if (focus >= 0 && nodes[focus].type === 'skill') {
      const n = nodes[focus], c = nb[focus].size;
      ctx.font = '11px Geist Mono, monospace'; ctx.fillStyle = acc; ctx.textAlign = 'left';
      ctx.fillText(c ? `${n.label}: used in ${c} place${c > 1 ? 's' : ''} · click to jump` : `${n.label}: on my resume`, 12, 14);
    }
  }
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(cv);
  function loop() { if (visible) { tick(); draw(); } if (!reduce) requestAnimationFrame(loop); }
  for (let s = 0; s < 320; s++) tick(); draw(); alpha = 0.25;
  if (!reduce) loop();

  const pick = (x, y) => { let best = -1, bd = 26; nodes.forEach((n, i) => { const d = Math.hypot(n.x - x, n.y - y); if (d < bd) { bd = d; best = i; } }); return best; };
  const pt = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointermove', (e) => {
    const [x, y] = pt(e);
    if (drag >= 0) { nodes[drag].x = x; nodes[drag].y = y; moved = true; alpha = Math.max(alpha, 0.4); if (reduce) draw(); return; }
    const h = pick(x, y); if (h !== hover) { hover = h; cv.style.cursor = h >= 0 ? 'pointer' : 'grab'; if (reduce) draw(); }
  });
  cv.addEventListener('pointerleave', () => { if (drag < 0) { hover = -1; if (reduce) draw(); } });
  cv.addEventListener('pointerdown', (e) => { const [x, y] = pt(e); drag = pick(x, y); moved = false; if (drag >= 0) { cv.setPointerCapture(e.pointerId); cv.classList.add('dragging'); } });
  cv.addEventListener('pointerup', (e) => {
    const was = drag; drag = -1; cv.classList.remove('dragging');
    if (was >= 0 && !moved) {
      const n = nodes[was];
      if (n.type === 'skill') n.btn.click();
      else window.__mock?.goTo?.(n.target);
    }
  });

  // list view toggle for keyboard and screen-reader users
  const tg = $('#listToggle'), list = $('#stackList');
  tg?.addEventListener('click', () => { const show = list.hidden; list.hidden = !show; tg.setAttribute('aria-expanded', show); tg.textContent = show ? 'Hide list' : 'List view'; });
})();
