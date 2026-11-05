(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let C = {};
  const read = () => { const g = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(); C = { ink: g('--ink'), muted: g('--muted'), rule: g('--rule'), paper: g('--paper'), panel: g('--panel'), blue: g('--blue'), mint: g('--mint'), yellow: g('--yellow'), pink: g('--pink') }; };
  read(); new MutationObserver(read).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', read);

  /* ---------- tiny live previews in each project card ---------- */
  const P = {
    drigil(ctx, w, h, t) {
      ctx.fillStyle = '#16130F'; ctx.fillRect(0, 0, w, h);
      const steps = 5, k = Math.floor(t / 0.9) % (steps + 2);
      for (let i = 0; i < steps; i++) {
        const x = 18 + i * ((w - 140) / (steps - 1)), y = h / 2;
        ctx.strokeStyle = i < k ? '#6FCF97' : '#4A4560'; ctx.lineWidth = 2;
        if (i < steps - 1) { ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x + (w - 140) / (steps - 1) - 8, y); ctx.stroke(); }
        ctx.fillStyle = i < k ? '#6FCF97' : i === k ? '#FFD45C' : '#2E2A3E';
        ctx.beginPath(); ctx.arc(x, y, i === k ? 7 + Math.sin(t * 8) : 6, 0, Math.PI * 2); ctx.fill();
      }
      const sx = ((t * 90) % (w + 60)) - 30; const g = ctx.createLinearGradient(sx - 30, 0, sx + 30, 0);
      g.addColorStop(0, 'rgba(111,207,151,0)'); g.addColorStop(.5, 'rgba(111,207,151,.22)'); g.addColorStop(1, 'rgba(111,207,151,0)');
      ctx.fillStyle = g; ctx.fillRect(sx - 30, 0, 60, h);
      ctx.fillStyle = '#EFE9DE'; ctx.font = '11px Geist Mono, monospace'; ctx.textAlign = 'right';
      const conf = k >= steps ? 'all steps ✓' : `step ${Math.min(k + 1, steps)} · conf ${(0.62 + ((k * 37) % 30) / 100).toFixed(2)}`;
      ctx.fillText(conf, w - 12, h / 2 + 4); ctx.textAlign = 'left';
      ctx.strokeStyle = '#E0566B'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6, 16); ctx.lineTo(6, 6); ctx.lineTo(16, 6); ctx.moveTo(w - 6, h - 16); ctx.lineTo(w - 6, h - 6); ctx.lineTo(w - 16, h - 6); ctx.stroke();
    },
    reglens(ctx, w, h, t) {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.max(6, Math.floor((w * 0.55) / 22)), rows = Math.max(2, Math.floor((h - 12) / 18));
      const hit = Math.floor(t / 1.4);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const id = r * cols + c, lit = (id * 7 + hit * 5) % (cols * rows) < 3;
        ctx.fillStyle = lit ? C.blue : C.rule; ctx.globalAlpha = lit ? 1 : .7;
        ctx.fillRect(10 + c * 22, 8 + r * 18, 16, 12); ctx.globalAlpha = 1;
      }
      const ax = w * 0.62, bw = w - ax - 10;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(ax, 8, bw, h - 16);
      const lines = Math.max(2, Math.floor((h - 26) / 12));
      for (let i = 0; i < lines; i++) { const len = (bw - 20) * (0.5 + 0.5 * Math.abs(Math.sin(i * 1.7 + hit))); ctx.fillStyle = C.muted; ctx.globalAlpha = .45; ctx.fillRect(ax + 8, 16 + i * 12, len * Math.min(1, ((t % 1.4) / 1.4) * 1.6), 5); }
      ctx.globalAlpha = 1;
      const k = (t % 1.4) / 1.4, cx = 10 + cols * 22 + (ax - (10 + cols * 22)) * k;
      ctx.fillStyle = C.mint; ctx.beginPath(); ctx.roundRect(cx - 12, h / 2 - 7, 24, 14, 6); ctx.fill();
      ctx.fillStyle = '#1B1A2E'; ctx.font = '9px Geist Mono, monospace'; ctx.textAlign = 'center'; ctx.fillText(`[${(hit % 9) + 1}]`, cx, h / 2 + 3); ctx.textAlign = 'left';
    },
    nft(ctx, w, h, t) {
      const cell = 9, cols = Math.ceil(w / cell), rows = Math.ceil(h / cell), sweep = ((t * 40) % (cols + 12)) - 6;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const v = 0.5 + 0.5 * Math.sin(x * 0.35 + t * 0.8) * Math.cos(y * 0.5 - t * 0.5);
        ctx.fillStyle = `hsl(${(190 + v * 120) % 360} 70% ${30 + v * 30}%)`;
        ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
        const sig = ((x * 13 + y * 7) % 11 === 0);
        if (sig && x < sweep && x > sweep - 14) { ctx.fillStyle = C.yellow; ctx.fillRect(x * cell + 1, y * cell + 1, cell - 3, cell - 3); }
      }
      ctx.fillStyle = C.yellow; ctx.fillRect(sweep * cell, 0, 2, h);
    },
    kafka(ctx, w, h, t, st) {
      ctx.clearRect(0, 0, w, h);
      const lanes = 3, lh = h / lanes;
      st.d = st.d || [];
      if (Math.random() < 0.5) st.d.push({ l: (Math.random() * lanes) | 0, x: 0, v: 60 + Math.random() * 60, c: Math.random() < .5 ? C.blue : C.ink });
      for (let i = 0; i < lanes; i++) { ctx.strokeStyle = C.rule; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(0, lh * i + lh / 2); ctx.lineTo(w, lh * i + lh / 2); ctx.stroke(); }
      ctx.setLineDash([]);
      st.d.forEach((d) => { d.x += d.v / 60; ctx.fillStyle = d.c; ctx.fillRect(d.x, d.l * lh + lh / 2 - 3, 9, 6); });
      st.d = st.d.filter((d) => d.x < w).slice(-160);
    },
    mend(ctx, w, h, t) {
      ctx.clearRect(0, 0, w, h);
      const R = 13, W = Math.sqrt(3) * R, cols = Math.ceil(w / W) + 1, rows = Math.max(2, Math.floor((h - 6) / (R * 1.5)));
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const cx = c * W + (r % 2 ? W / 2 : 0), cy = R + 2 + r * R * 1.5;
        const heat = 0.5 + 0.5 * Math.sin(t * 1.2 - c * 0.45 + r * 0.9);
        ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); } ctx.closePath();
        ctx.fillStyle = C.yellow; ctx.globalAlpha = 0.15 + heat * 0.7; ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.stroke();
        if (heat > 0.93) { ctx.fillStyle = '#1B1A2E'; ctx.font = '9px Geist Mono, monospace'; ctx.textAlign = 'center'; ctx.fillText(`${(1 + heat * 4).toFixed(1)}×`, cx, cy + 3); ctx.textAlign = 'left'; }
      }
    },
  };
  const items = $$('canvas[data-peek]').map((cv) => ({ cv, ctx: cv.getContext('2d'), fn: P[cv.dataset.peek], vis: false, st: {} }));
  const io = new IntersectionObserver((es) => es.forEach((e) => { const it = items.find((i) => i.cv === e.target); if (it) it.vis = e.isIntersecting; }));
  items.forEach((it) => io.observe(it.cv));
  function size(it) { const dpr = Math.min(2, devicePixelRatio || 1), w = it.cv.clientWidth, h = it.cv.clientHeight; if (it.w !== w || it.h !== h) { it.w = w; it.h = h; it.cv.width = w * dpr; it.cv.height = h * dpr; it.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); } }
  const t0 = performance.now();
  function frame(now) {
    const t = (now - t0) / 1000;
    items.forEach((it) => { if (!it.vis && !reduce) return; if (!it.cv.clientWidth) return; size(it); it.fn(it.ctx, it.w, it.h, t, it.st); });
    if (!reduce) requestAnimationFrame(frame);
  }
  if (reduce) { items.forEach((it) => { size(it); it.fn(it.ctx, it.w, it.h, 3.2, it.st); }); } else requestAnimationFrame(frame);
  new ResizeObserver(() => reduce && items.forEach((it) => { size(it); it.fn(it.ctx, it.w, it.h, 3.2, it.st); })).observe(document.body);

  /* ---------- next achievement → contact ---------- */
  $$('.next-award').forEach((b) => b.addEventListener('click', () => window.__mock?.goTo?.('#contactForm')));

  /* ---------- live Los Angeles clock ---------- */
  const clock = document.getElementById('laClock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });
    const tick = () => (clock.textContent = `It's ${fmt.format(new Date())}`);
    tick(); setInterval(tick, 20000);
  }
})();
