(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const fmt = (m) => (Math.round(m * 100) / 100).toString().replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1');

  // open/close + keep clicks inside demos from opening the case-study overlay
  const built = {};
  $$('.try').forEach((b) => {
    const demo = document.getElementById(b.getAttribute('aria-controls'));
    const card = b.closest('.proj');
    [b, demo].forEach((el) => ['click', 'keydown', 'pointerdown'].forEach((ev) => el.addEventListener(ev, (e) => e.stopPropagation())));
    b.addEventListener('click', () => {
      const open = demo.hidden;
      demo.hidden = !open; b.setAttribute('aria-expanded', open);
      if (open && !built[demo.id]) { built[demo.id] = true; BUILD[demo.dataset.demo](demo); }
      if (open) card.style.transform = '';
    });
  });

  /* ================= Mend: surge hex map (formula from docs/surge-and-rewards.md) ================= */
  function mend(root) {
    const BASE = [0, 10, 25, 50, 80, 120], TIER = { surface: 1, utility: 1.25, structure: 1.5 };
    const COLS = 10, ROWS = 6, R = 19, W = Math.sqrt(3) * R;
    const cells = [];
    const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLS; col++) {
      const inBounty = col >= 1 && col <= 8 && row >= 1 && row <= 4;
      const corridor = inBounty && (col === 4 || col === 5);
      const danger = row === 3 && col === 7;
      cells.push({ row, col, demand: corridor ? 3 : inBounty ? 2 : 0, danger, r: Math.random() < 0.3 ? rnd(1, 4) : 0, days: Math.random() < 0.35 ? Infinity : rnd(0, 13) });
    }
    cells.forEach((c) => { if (c.r > 0) c.days = 0; });
    const price = (c) => {
      if (c.danger) return { m: 0, why: ['Danger zone: pays nothing, capture paused'] };
      if (!c.demand) return { m: 1, why: ['Outside every bounty: 1× (we only surge where someone pays)'] };
      const shortfall = Math.max(0, 1 - c.r / 3), stale = c.days === Infinity ? 1 : Math.min(1, c.days / 14);
      const need = 1 + 0.5 * (shortfall + stale) / 2, crowd = c.r > 3 ? Math.max(0.5, 3 / c.r) : 1;
      const m = Math.min(5, Math.max(1, Math.round(c.demand * need * crowd * 4) / 4));
      const why = [`${c.demand === 3 ? 'Figueroa corridor' : 'Campus bounty'}: ${c.demand}×`,
        `Needs coverage (${c.r}/3 today, ${c.days === Infinity ? 'never reported' : c.days === 0 ? 'reported today' : c.days + ' days stale'}): ×${fmt(need)}`];
      if (crowd < 1) why.push(`Crowded (${c.r} today): ×${fmt(crowd)}`);
      return { m, why };
    };
    root.innerHTML = `<div class="grid2"><div>
        <div class="ctl"><label>Severity <span class="seg" id="mSev">${[1, 2, 3, 4, 5].map((s) => `<button type="button" aria-pressed="${s === 3}" data-v="${s}">${s}</button>`).join('')}</span></label>
          <label>Asset <span class="seg" id="mTier"><button type="button" aria-pressed="true" data-v="surface">surface</button><button type="button" aria-pressed="false" data-v="utility">utility</button><button type="button" aria-pressed="false" data-v="structure">structure</button></span></label></div>
        <svg class="hexmap" viewBox="0 0 ${Math.ceil(W * COLS + W / 2 + 8)} ${Math.ceil(R * 1.5 * ROWS + R / 2 + 8)}" role="group" aria-label="Surge price map around USC"></svg>
        <div class="legend"><span><i style="background:var(--paper)"></i>no bounty 1×</span><span><i style="background:color-mix(in srgb,var(--gold) 45%,var(--paper))"></i>surging</span><span><i style="background:color-mix(in srgb,var(--accent) 22%,var(--paper));border-color:var(--accent)"></i>danger zone</span></div>
        <div class="ctl" style="margin-top:10px"><button type="button" class="dbtn" id="mDay">Next day ↻</button><button type="button" class="dbtn" id="mReset">Reset</button></div>
      </div>
      <div class="receipt" id="mRcpt" aria-live="polite"><h5>Tap a block to report damage there</h5><p style="margin:0;font-size:11.5px;color:var(--muted)">Each hexagon is about a city block near USC. Its price rises where coverage is thin or stale and cools as reports pile up. The report is priced before it's saved, so it can't cool its own block.</p></div></div>
      <p class="note">Simulation using the real pricing rules from Mend (base 10/25/50/80/120 × asset tier × first finder or 0.4 confirmation × zone 1–5× in 0.25 steps). The map and report counts are made up.</p>`;
    const svg = $('.hexmap', root);
    let sev = 3, tier = 'surface';
    const seg = (id, set) => $(id, root).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $$('button', $(id, root)).forEach((x) => x.setAttribute('aria-pressed', x === b)); set(b.dataset.v); });
    seg('#mSev', (v) => (sev = +v)); seg('#mTier', (v) => (tier = v));
    const poly = (cx, cy) => [...Array(6)].map((_, i) => { const a = Math.PI / 180 * (60 * i - 30); return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`; }).join(' ');
    const els = [];
    function build() {
      cells.forEach((c, i) => {
        const cx = 4 + W / 2 + c.col * W + (c.row % 2 ? W / 2 : 0), cy = 4 + R + c.row * R * 1.5;
        const p = document.createElementNS(NS, 'polygon');
        p.setAttribute('points', poly(cx, cy)); p.setAttribute('tabindex', '0'); p.setAttribute('role', 'button');
        p.setAttribute('class', 'hx' + (c.danger ? ' danger' : !c.demand ? ' out' : ''));
        p.addEventListener('click', () => report(i)); p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); report(i); } });
        p.addEventListener('pointerenter', () => peek(i)); p.addEventListener('focus', () => peek(i));
        const t = document.createElementNS(NS, 'text'); t.setAttribute('x', cx); t.setAttribute('y', cy - 2);
        const t2 = document.createElementNS(NS, 'text'); t2.setAttribute('x', cx); t2.setAttribute('y', cy + 9); t2.setAttribute('class', 'small');
        svg.append(p, t, t2); els.push({ p, t, t2, cx, cy });
      });
      const lb = document.createElementNS(NS, 'text'); lb.setAttribute('x', 6); lb.setAttribute('y', 10); lb.setAttribute('class', 'lbl'); lb.textContent = 'USC · Exposition Park'; svg.appendChild(lb);
    }
    function draw(pingIdx) {
      if (!els.length) build();
      cells.forEach((c, i) => {
        const { p, t, t2, cx, cy } = els[i], { m } = price(c);
        if (!c.danger && c.demand) p.style.fill = `color-mix(in srgb, var(--gold) ${Math.round(12 + (m - 1) / 4 * 70)}%, var(--paper))`;
        p.setAttribute('aria-label', c.danger ? 'Danger zone' : `Block, ${fmt(m)} times, ${c.r} reports today`);
        t.textContent = c.danger ? '⚠' : fmt(m) + '×';
        t2.textContent = c.r ? '●'.repeat(Math.min(c.r, 5)) : '';
        if (i === pingIdx && !reduce) { const ring = document.createElementNS(NS, 'circle'); ring.setAttribute('cx', cx); ring.setAttribute('cy', cy); ring.setAttribute('r', 6); ring.setAttribute('class', 'ping'); svg.appendChild(ring); ring.animate([{ r: 6, opacity: 1 }, { r: 30, opacity: 0 }], { duration: 700, easing: 'ease-out' }).onfinish = () => ring.remove(); }
      });
    }
    const rc = $('#mRcpt', root);
    function peek(i) {
      if (rc.dataset.locked) return;
      const c = cells[i], { m, why } = price(c);
      rc.innerHTML = `<h5>This block · ${c.danger ? 'no payout' : fmt(m) + '×'}</h5>` + why.map((w) => `<div class="rl"><span>${w}</span></div>`).join('') + `<p style="margin:8px 0 0;font-size:11px;color:var(--muted)">Tap to report damage here.</p>`;
    }
    function report(i) {
      const c = cells[i], { m, why } = price(c);
      rc.dataset.locked = '1'; setTimeout(() => delete rc.dataset.locked, 2500);
      if (c.danger) { rc.innerHTML = `<h5>Danger zone</h5><div class="rl"><span>No points, no XP, capture paused.</span></div><div class="rl"><span>We never pay anyone to walk into danger.</span></div>`; return; }
      const finder = c.r > 0 ? 0.4 : 1, tierM = TIER[tier];
      const pts = Math.round(BASE[sev] * tierM * finder * m);
      rc.innerHTML = `<h5>Receipt</h5>
        <div class="rl"><span>Severity ${sev} (${['', 'cosmetic', 'monitor', 'repair soon', 'urgent', 'hazard'][sev]})</span><span>${BASE[sev]} pts</span></div>
        <div class="rl"><span>${tier === 'surface' ? 'Surface' : tier === 'utility' ? 'Utility / safety device' : 'Structure at risk'}</span><span>×${fmt(tierM)}</span></div>
        <div class="rl"><span>${finder === 1 ? 'First finder: full points' : 'Confirmation of an existing report'}</span><span>×${fmt(finder)}</span></div>
        ${why.map((w) => `<div class="rl"><span>${w}</span></div>`).join('')}
        <div class="rl"><span>Zone</span><span>×${fmt(m)}</span></div>
        <div class="rl tot"><span>= ${pts} pts</span><span>$${(pts / 100).toFixed(2)}</span></div>`;
      c.r += 1; c.days = 0;
      draw(i);
    }
    $('#mDay', root).addEventListener('click', () => { cells.forEach((c) => { if (c.days !== Infinity) c.days = Math.min(14, c.days + 1); c.r = 0; }); draw(); });
    $('#mReset', root).addEventListener('click', () => { cells.forEach((c) => { c.r = 0; c.days = Infinity; }); draw(); });
    draw();
  }

  /* ================= Kafka: toy throughput playground ================= */
  function kafka(root) {
    const RATE = 4000, PART = 5000, CONS = 4500; // toy per-node rates (msgs/s), not benchmarks
    root.innerHTML = `<div class="ctl">
        <label>Producers <input type="range" id="kP" min="1" max="8" value="3"><output id="kPo">3</output></label>
        <label>Partitions <input type="range" id="kN" min="1" max="8" value="3"><output id="kNo">3</output></label>
        <label>Consumers <input type="range" id="kC" min="1" max="8" value="2"><output id="kCo">2</output></label></div>
      <canvas class="kcanvas" aria-label="Messages flowing from producers through partitions to consumers"></canvas>
      <div class="kstats"><div><b id="kIn">0</b><span>accepted / s</span></div><div><b id="kOut">0</b><span>consumed / s</span></div><div id="kLagBox"><b id="kLag">0</b><span>consumer lag</span></div><div><b id="kIdle">0</b><span>idle consumers</span></div></div>
      <p class="note">Toy model with made-up per-node rates (producer 4k/s, partition 5k/s, consumer 4.5k/s). It shows the shape of the trade-offs, not a benchmark of my broker. Notice: consumers beyond the partition count sit idle.</p>`;
    const cv = $('canvas', root), ctx = cv.getContext('2d');
    const P = $('#kP', root), N = $('#kN', root), C = $('#kC', root);
    let lag = 0, dots = [], last = performance.now(), acc = 0, visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(cv);
    [P, N, C].forEach((s) => s.addEventListener('input', () => { $('#' + s.id + 'o', root).textContent = s.value; }));
    const k = (v) => (v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + 'k' : Math.round(v).toString());
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const p = +P.value, n = +N.value, c = +C.value;
      const accepted = Math.min(p * RATE, n * PART), active = Math.min(c, n), consumed = Math.min(accepted + lag / 2, active * CONS);
      lag = Math.max(0, lag + (accepted - consumed) * dt);
      const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      const ink = css('--ink'), mut = css('--muted'), acc1 = css('--accent'), gold = css('--gold'), rule = css('--rule');
      const x0 = 58, x1 = w - 58, top = 14, lh = (h - 28) / n;
      ctx.font = '10px Geist Mono, monospace';
      for (let i = 0; i < n; i++) {
        const y = top + lh * i + lh / 2;
        ctx.strokeStyle = rule; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = mut; ctx.fillText('p' + i, x0 - 22, y + 3);
        const cons = i < c ? 'c' + i : '—'; ctx.fillStyle = i < c ? ink : mut; ctx.fillText(cons, x1 + 10, y + 3);
      }
      if (c > n) { ctx.fillStyle = acc1; ctx.textAlign = 'right'; ctx.fillText((c - n === 1 ? 'c' + n : 'c' + n + '–c' + (c - 1)) + ' idle', w - 6, h - 4); ctx.textAlign = 'left'; }
      ctx.fillStyle = mut; ctx.fillText(p + ' prod', 4, 12);
      // spawn dots proportional to accepted throughput (1 dot ≈ 400 msgs)
      acc += (accepted / 400) * dt;
      while (acc > 1) { acc--; dots.push({ lane: (Math.random() * n) | 0, x: x0, v: 90 + Math.random() * 60 }); }
      const drain = consumed / Math.max(1, accepted);
      dots = dots.filter((d) => d.lane < n);
      for (const d of dots) {
        const stop = x1 - 6 - (lag > 2000 ? Math.min(140, lag / 400) : 0);
        d.x = Math.min(stop, d.x + d.v * dt * (d.x > stop - 30 ? Math.min(1, drain) : 1));
        const y = top + lh * d.lane + lh / 2;
        ctx.fillStyle = d.x >= stop - 1 && lag > 2000 ? acc1 : d.lane % 2 ? gold : ink;
        ctx.fillRect(d.x, y - 3, 8, 6);
      }
      dots = dots.filter((d) => !(d.x >= x1 - 7 && Math.random() < 0.5 * drain + 0.02)).slice(-420);
      $('#kIn', root).textContent = k(accepted); $('#kOut', root).textContent = k(consumed);
      $('#kLag', root).textContent = k(lag) + (accepted > consumed + 1 ? ' ↑' : lag > 0 ? ' ↓' : '');
      $('#kLagBox', root).classList.toggle('warn', lag > 5000);
      $('#kIdle', root).textContent = Math.max(0, c - n);
      if (!reduce && visible && !root.hidden) requestAnimationFrame(frame); else setTimeout(() => requestAnimationFrame(frame), 300);
    }
    requestAnimationFrame(frame);
  }

  /* ================= Drigil: pipeline player ================= */
  function drigil(root) {
    const STEPS = [
      ['teach', 'Record a narrated demo', '<b>Supervisor:</b> “Lay the towel flat. Fold it in half, corners together. Smooth it out.”'],
      ['teach', 'Capture keyframes', 'Hands paused 3 times → 3 keyframes captured.'],
      ['teach', 'Align the transcript', 'Word-level transcript lined up with each keyframe.'],
      ['teach', 'Claude writes the task spec', '1. Lay towel flat<br>2. Fold in half, corners together<br>3. Smooth it out'],
      ['coach', 'Vision check, low confidence', 'Worker on step 2. Confidence <b>0.41</b>: below the bar, so Drigil keeps watching instead of interrupting.', 0.41],
      ['coach', 'Vision check passes', 'Confidence <b>0.91</b> → step 2 done. Coaching plays in the supervisor’s cloned voice (cached): “Nice. Now smooth it flat.”', 0.91],
      ['coach', 'Support fades with mastery', 'Third shift: prompts drop from every step to only step 3.'],
      ['fix', 'A step keeps failing', 'Step 3 missed 3 times this week.'],
      ['fix', 'Sandboxed agent drafts a rewrite', '<div class="diff"><del>3. Smooth it out</del><ins>3. Run both palms from the fold to the edges, twice</ins></div>'],
      ['fix', 'Supervisor review', 'Approve this rewrite before it goes live?', null, true],
      ['fix', 'Live', 'Approved. The new step 3 replaces the old one.'],
    ];
    root.innerHTML = `<div class="grid2"><ol class="dsteps">${STEPS.map((s, i) => `<li data-i="${i}"><span class="ph">${s[0]}</span><span>${s[1]}</span></li>`).join('')}</ol>
      <div><div class="gview" aria-live="polite"><div class="g-top"><span>DRIGIL · GLASSES VIEW</span><span id="dStep"></span></div><div class="g-main" id="dMain"></div><div class="g-actions" id="dAct"></div></div>
      <div class="ctl" style="margin-top:10px"><button type="button" class="dbtn primary" id="dPlay">▶ Play</button><button type="button" class="dbtn" id="dNext">Next step</button><button type="button" class="dbtn" id="dRestart">Restart</button></div></div></div>
      <p class="note">Simulation of Drigil's three loops with an example task. The confidence values are illustrative.</p>`;
    let i = -1, timer = null, draft = 1;
    const lis = $$('.dsteps li', root), main = $('#dMain', root), act = $('#dAct', root), playB = $('#dPlay', root);
    function show(n) {
      i = n; const s = STEPS[i];
      lis.forEach((li, k) => { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); });
      $('#dStep', root).textContent = `${i + 1}/${STEPS.length}`;
      main.innerHTML = s[2] + (s[3] != null ? `<div class="meter"><i class="${s[3] < 0.6 ? 'low' : ''}" style="width:${s[3] * 100}%"></i></div>` : '');
      act.innerHTML = '';
      if (s[4]) {
        stop();
        act.innerHTML = `<button type="button" class="dbtn primary" id="dYes">Approve</button><button type="button" class="dbtn" id="dNo">Ask for another draft</button>`;
        $('#dYes', root).onclick = () => { show(i + 1); };
        $('#dNo', root).onclick = () => { draft++; STEPS[8][2] = `<div class="diff"><del>3. Smooth it out</del><ins>3. ${draft % 2 ? 'Run both palms from the fold to the edges, twice' : 'Press flat from the center out, then check the corners line up'}</ins></div><span style="font-size:10.5px;color:#A39C90">draft ${draft}</span>`; show(8); };
      }
      if (i === STEPS.length - 1) { stop(); lis[i].classList.add('done'); }
    }
    function stop() { clearInterval(timer); timer = null; playB.textContent = '▶ Play'; }
    function play() { if (timer) return stop(); if (i >= STEPS.length - 1) show(-1 + 1); playB.textContent = '❚❚ Pause'; timer = setInterval(() => { if (i < STEPS.length - 1 && !STEPS[i]?.[4]) show(i + 1); else stop(); }, reduce ? 600 : 1500); if (i < 0) show(0); }
    playB.onclick = play; $('#dNext', root).onclick = () => { if (!STEPS[i]?.[4] && i < STEPS.length - 1) show(i + 1); };
    $('#dRestart', root).onclick = () => { stop(); draft = 1; show(0); };
    show(0);
  }

  /* ================= NFTGenesis: decode + tamper ================= */
  function nft(root) {
    const N = 24, SIG = ['0111001110', '1000010000', '0110001100', '0001000010', '1110011100'];
    root.innerHTML = `<div class="grid2"><canvas class="ncanvas" aria-label="Generated image with a hidden signature"></canvas>
      <div><div class="ctl" style="flex-direction:column;align-items:flex-start"><label>Decoder sweep <input type="range" id="nSweep" min="0" max="100" value="0" style="width:160px"></label>
        <label><input type="checkbox" id="nTamper"> Tamper with the image</label><button type="button" class="dbtn" id="nRegen">New image ↻</button></div>
        <p class="nstatus" id="nStatus" aria-live="polite">Drag the sweep to decode</p>
        <p style="font-size:11.5px;color:var(--muted);margin:0">An encoder hides a signature in the pixels. The decoder reads it back. Edit the image and the signature no longer checks out.</p></div></div>
      <p class="note">Illustration of the idea. The real system used paired encoder and decoder CNNs (98% verification accuracy, per the paper).</p>`;
    const cv = $('canvas', root), ctx = cv.getContext('2d'), sweep = $('#nSweep', root), tamper = $('#nTamper', root), st = $('#nStatus', root);
    let seed = Math.random() * 100;
    const isSig = (x, y) => { const sx = x - 7, sy = y - 10; return sy >= 0 && sy < SIG.length && sx >= 0 && sx < SIG[0].length && SIG[sy][sx] === '1'; };
    const tampered = (x, y) => tamper.checked && (x - 13) ** 2 + (y - 11) ** 2 < 13;
    function draw() {
      const size = cv.clientWidth, dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = size * dpr; cv.height = size * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cell = size / N, sw = (+sweep.value / 100) * N;
      let broken = 0, total = 0;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const v = Math.sin(x * 0.45 + seed) * Math.cos(y * 0.38 - seed * 0.7) * 0.5 + 0.5;
        ctx.fillStyle = tampered(x, y) ? `hsl(${(seed * 40) % 360} 15% ${30 + v * 20}%)` : `hsl(${(150 + v * 140 + seed * 10) % 360} 70% ${24 + v * 34}%)`;
        ctx.fillRect(x * cell, y * cell, cell - 0.6, cell - 0.6);
        if (isSig(x, y)) {
          total++;
          const bad = tampered(x, y); if (bad) broken++;
          if (x < sw) { ctx.fillStyle = bad ? css('--accent') : css('--gold'); ctx.globalAlpha = 0.95; ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2.6, cell - 2.6); ctx.globalAlpha = 1;
            if (bad) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x * cell + 3, y * cell + 3); ctx.lineTo(x * cell + cell - 4, y * cell + cell - 4); ctx.moveTo(x * cell + cell - 4, y * cell + 3); ctx.lineTo(x * cell + 3, y * cell + cell - 4); ctx.stroke(); } }
        }
      }
      if (sw > 0 && sw < N) { ctx.fillStyle = css('--accent'); ctx.fillRect(sw * cell, 0, 2, size); }
      const done = +sweep.value >= 100;
      st.className = 'nstatus' + (done ? (broken ? ' bad' : ' ok') : '');
      st.textContent = !done ? (+sweep.value ? `Decoding… ${sweep.value}%` : 'Drag the sweep to decode') : broken ? `✗ Signature broken in ${broken} of ${total} cells: tampered` : `✓ Signature verified (${total} of ${total} cells)`;
    }
    sweep.addEventListener('input', draw); tamper.addEventListener('change', draw);
    $('#nRegen', root).addEventListener('click', () => { seed = Math.random() * 100; draw(); });
    new ResizeObserver(draw).observe(cv);
    if (!reduce) { let v = 0; const iv = setInterval(() => { v += 4; sweep.value = v; draw(); if (v >= 100) clearInterval(iv); }, 40); }
  }

  const BUILD = { mend, kafka, drigil, nft };
  window.__demos = BUILD;
})();
