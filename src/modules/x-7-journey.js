(() => {
  // Experience journey: a dotted globe that flies between the places in Sarath's story.
  // Land dots: world-atlas land-110m, sampled every 2° (rows from 56°S to 80°N), one hex bitmask per row.
  const cv = document.getElementById('jGlobe'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const range = document.getElementById('jRange'), card = document.getElementById('jCard'), ticks = document.getElementById('jTicks');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RAD = Math.PI / 180;

  const LAND = ',000000018,00000000c,000000003,000000001c,000000000e00000000000000000000c,00000000038000000000000000000004,0000000001e0000000000000000000401,00000000007800000000000000000000008,00000000003f000000000000000000038008,00000000000fc00000000000000000003c01,000000000007f00000003000000000303f8,000000000003fc0000000f8000000003e7f8,000000000001ff00000007e000000000ffff,000000000000ffc0000003fc000000003fffe,0000000000007fe0000000ff000000000ffffc,0000000000003ff80000007fc300000003fffe,0000000000001fff0000003ff0c00000007fff808,0000000000000fffc000001ff8600000000fffc,0000000000000fffe000001ffe3800000000ffe,0000000000001ffff000000fffcc000000003f3,0000000000003ffff8000007ffe10000000001c8,0000000000003ffffc000001fff0000000000064,0000000000003ffffe000001fff00000000014004,0000000000003fffff000001fff000000001c0074,0000000000007fffff000000fff8000000020003ea,0000000000007ffffe000000fffc00000006100fc2,0000000000003ffff0000001fffe0000000c720b,0000000000003fff80000001fffe0000000c78,0000000000001fff80000001ffff8000001c38,0000000000001fff00000003ffffc000002c18,0000000000001ff800000fcfffffc000401011,0000000000003ff000001fffffffc000802007,0000000000031bc000007fffffff80020008,00000000000200000000fffffff8000600b8,00000000001e00000001fffffffe000c01f83,0000000000f000000001ffffff9f00380fe08,0000000007f090000003ffffff7f00f83f01,001000001e2080000007fffffdff01f8fc8,004000003c0a0000000ffffffbfe0ffbff,0000000178000000001fffffdff07fffff,00000002f8080000003fffff7f1ffffffe,00000007f8100000003ffffffbfffffff8,00000007fe200000003fffffffffffffe,0000001fffc0000000ffe61fffffffff,0000007fffc0000000fe007ffffffff06,000000ffffc00000007800ffffffffccc,000001ffff8000000e097fcffffffcc2,000007ffff8000003885ff7fffffec,000007ffff800000f3b919ffffffe1,00000fffff000000ebe19fffffff98,00001fffff400003ffae7ffffffc,00003ffffcc0001ffffffffffff,00007ffff900003ffffffffffe,0000fffdfc000b7ffffffffff,0001fffbf00028fffffffff81,0407ffc7800042ffffffff83,020ffe1e000213fffffff84,1f7ff8300003cffffffff4,1ffff081000efffffffff,0ffff48e1037fffffffe,200018c73e08,600a270ff06,1c9ee3e0301fffe8,00bb1f0008ff2,00807c0007,0041f0047,00bf,01bc41';
  const DOTS = [];
  LAND.split(',').forEach((row, r) => {
    const lat = -56 + 2 * r, n = Math.max(1, Math.round(360 * Math.cos(lat * RAD) / 2));
    for (let c = 0; c < row.length; c++) {
      const v = parseInt(row[c], 16);
      for (let b = 0; b < 4; b++) if (v & (8 >> b)) { const k = c * 4 + b; if (k < n) DOTS.push(vec(lat, -180 + (k + 0.5) * 360 / n)); }
    }
  });

  const CITY = {
    EWR: { name: 'New Jersey', lat: 40.06, lon: -74.41, dx: 8, dy: -8 },
    BLR: { name: 'Bangalore', lat: 12.97, lon: 77.59, dx: 8, dy: -8 },
    LAX: { name: 'Los Angeles', lat: 34.05, lon: -118.24, dx: 8, dy: 14 },
    SFO: { name: 'San Francisco', lat: 37.77, lon: -122.42, dx: -36, dy: -8 },
  };
  // facts from the resume (and middle school in New Jersey)
  const STOPS = [
    { c: 'EWR', tick: 'NJ', when: 'Middle school', what: 'Middle school', where: 'New Jersey', go: null },
    { c: 'BLR', tick: '2023', when: 'Jun – Aug 2023', what: 'AI Research Intern', where: 'ElementalsAI', go: '#x-elem' },
    { c: 'BLR', when: 'Jan – Jun 2024', what: 'Intern', where: 'IDFC FIRST Bank', go: '#x-idfc' },
    { c: 'BLR', when: 'May 2024', what: 'B.Tech., Computer Science', where: 'PES University', go: '#education' },
    { c: 'BLR', tick: '2024–26', when: 'Jul 2024 – Aug 2026', what: 'Application Engineer', where: 'IDFC FIRST Bank', go: '#x-idfc' },
    { c: 'LAX', tick: 'USC', when: 'Expected May 2028', what: 'MS, Computer Science', where: 'University of Southern California', go: '#education' },
    { c: 'SFO', tick: 'Oct 26', when: 'Oct 2026', what: "Drigil · 2nd, Anthropic's track", where: 'Cal Hacks 13.0', go: '#a-calhacks' },
    { c: 'LAX', tick: 'Now', when: 'Now', what: 'Open to Summer 2027 internships', where: 'Los Angeles', go: '#contact' },
  ];
  // legs between consecutive stops in different cities
  const LEGS = [];
  STOPS.forEach((s, i) => { if (i && s.c !== STOPS[i - 1].c) LEGS.push({ from: STOPS[i - 1].c, to: s.c, end: i }); });

  /* ---------- 3D helpers ---------- */
  function vec(lat, lon) { const p = lat * RAD, l = lon * RAD; return [Math.cos(p) * Math.cos(l), Math.sin(p), Math.cos(p) * Math.sin(l)]; }
  function slerp(a, b, t) {
    const d = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), w = Math.acos(d);
    if (w < 1e-6) return a.slice();
    const s = Math.sin(w), ka = Math.sin((1 - t) * w) / s, kb = Math.sin(t * w) / s;
    return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
  }
  const latlon = (v) => [Math.asin(Math.max(-1, Math.min(1, v[1]))) / RAD, Math.atan2(v[2], v[0]) / RAD];
  Object.values(CITY).forEach((c) => (c.v = vec(c.lat, c.lon)));

  // camera: looks at (lat0, lon0)
  let lat0 = 0, lon0 = 0;
  function project(v, h = 1) {
    const cl = Math.cos(lon0 * RAD), sl = Math.sin(lon0 * RAD), cp = Math.cos(lat0 * RAD), sp = Math.sin(lat0 * RAD);
    // rotate around Y by lon0, then around X by lat0
    const x1 = v[0] * cl + v[2] * sl, z1 = -v[0] * sl + v[2] * cl, y1 = v[1];
    const y2 = y1 * cp - x1 * sp, x2 = y1 * sp + x1 * cp;
    return { x: z1 * h, y: y2 * h, z: x2 };
  }
  // world-space vector -> camera so the point faces the viewer: x2 is depth toward viewer
  const camFor = (c) => ({ lat: Math.max(-35, Math.min(45, c.lat * 0.75)), lon: c.lon });

  /* ---------- colors follow the theme ---------- */
  let C = {};
  const readC = () => { const g = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(); C = { ink: g('--ink'), muted: g('--muted'), rule: g('--rule'), paper: g('--paper'), panel: g('--panel'), blue: g('--blue'), yellow: g('--yellow'), accent: g('--accent') }; };
  readC(); new MutationObserver(readC).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readC);

  /* ---------- state ---------- */
  let cur = STOPS.length - 1;            // stop shown
  let flight = null;                      // { leg, t0, dur, camFrom, camTo }
  let drag = null, spin = { lat: 0, lon: 0 }; // visitor's own rotation on top of the camera
  let W = 0, R = 0, dpr = 1, visible = false, idle = 0;
  const camAt = camFor(CITY[STOPS[cur].c]);
  lat0 = camAt.lat; lon0 = camAt.lon;

  function size() {
    dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth;
    cv.width = W * dpr; cv.height = W * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = W * 0.42;
  }

  function legPoint(leg, t) {
    const a = CITY[leg.from].v, b = CITY[leg.to].v, v = slerp(a, b, t);
    const d = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    return { v, h: 1 + Math.sin(Math.PI * t) * Math.min(0.09, 0.03 + d * 0.04) };
  }

  function draw(now) {
    const cx = W / 2, cy = W / 2;
    ctx.clearRect(0, 0, W, W);

    // camera: flight path or resting, plus idle sway and visitor spin
    let progress = 1, active = null;
    if (flight) {
      const k = Math.min(1, (now - flight.t0) / flight.dur);
      progress = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      active = flight.leg;
      const cv3 = slerp(vec(flight.camFrom.lat, flight.camFrom.lon), vec(flight.camTo.lat, flight.camTo.lon), progress);
      [lat0, lon0] = latlon(cv3);
      if (k >= 1) flight = null;
    } else {
      const c = camFor(CITY[STOPS[cur].c]); lat0 = c.lat; lon0 = c.lon;
    }
    const sway = reduce || document.documentElement.classList.contains('motion-off') ? 0 : Math.sin(idle / 2600) * 7;
    lat0 = Math.max(-60, Math.min(70, lat0 + spin.lat)); lon0 += spin.lon + sway;

    // ocean + rim
    const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, C.panel); g.addColorStop(1, C.paper);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.stroke();

    // land dots, brighter toward the viewer
    ctx.fillStyle = C.ink;
    for (const v of DOTS) {
      const p = project(v); if (p.z <= 0.02) continue;
      ctx.globalAlpha = 0.18 + p.z * 0.55;
      const s = 0.7 + p.z * 1.1;
      ctx.fillRect(cx + p.x * R - s / 2, cy - p.y * R - s / 2, s, s);
    }
    ctx.globalAlpha = 1;

    // routes: flown legs solid, future legs dashed, the active one drawn up to the plane
    LEGS.forEach((leg) => {
      const flown = leg.end <= cur && leg !== active, upto = leg === active ? progress : flown ? 1 : 1;
      ctx.beginPath(); let pen = false;
      for (let i = 0; i <= 64; i++) {
        const t = (i / 64) * upto, q = legPoint(leg, t), p = project(q.v, q.h);
        const on = p.z > -0.02;
        if (!on) { pen = false; continue; }
        const X = cx + p.x * R, Y = cy - p.y * R;
        pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true;
      }
      ctx.setLineDash(flown || leg === active ? [] : [3, 5]);
      ctx.strokeStyle = flown || leg === active ? C.blue : C.muted;
      ctx.globalAlpha = flown || leg === active ? 1 : 0.55;
      ctx.lineWidth = flown || leg === active ? 2.2 : 1.4; ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    });

    // city pins
    ctx.font = '600 11px "Geist Mono", monospace';
    const here = STOPS[cur].c;
    Object.entries(CITY).forEach(([code, c]) => {
      const p = project(c.v); if (p.z <= 0.05) return;
      const X = cx + p.x * R, Y = cy - p.y * R, isHere = code === here && !flight;
      if (isHere && !reduce) {
        const k = (now % 1800) / 1800;
        ctx.beginPath(); ctx.arc(X, Y, 5 + k * 12, 0, Math.PI * 2); ctx.strokeStyle = C.blue; ctx.globalAlpha = 1 - k; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
      }
      ctx.beginPath(); ctx.arc(X, Y, isHere ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = C.yellow; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; ctx.stroke();
      ctx.globalAlpha = Math.min(1, p.z * 2);
      const tx = X + c.dx, ty = Y + c.dy, wd = ctx.measureText(code).width;
      ctx.fillStyle = C.paper; ctx.fillRect(tx - 3, ty - 10, wd + 6, 14);
      ctx.fillStyle = isHere ? C.accent : C.ink; ctx.fillText(code, tx, ty);
      ctx.globalAlpha = 1;
    });

    // the plane, nose along the route
    if (active) {
      const a = legPoint(active, progress), b = legPoint(active, Math.min(1, progress + 0.01));
      const pa = project(a.v, a.h), pb = project(b.v, b.h);
      if (pa.z > -0.02) {
        const X = cx + pa.x * R, Y = cy - pa.y * R, ang = Math.atan2(-(pb.y - pa.y), pb.x - pa.x);
        ctx.save(); ctx.translate(X, Y); ctx.rotate(ang);
        ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-6, -6); ctx.lineTo(-3, 0); ctx.lineTo(-6, 6); ctx.closePath();
        ctx.fillStyle = C.ink; ctx.fill(); ctx.strokeStyle = C.paper; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.restore();
      }
    }
  }

  /* ---------- boarding-pass card + ticks ---------- */
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function showCard(i) {
    const s = STOPS[i], c = CITY[s.c], prev = i ? STOPS[i - 1] : null;
    const moved = prev && prev.c !== s.c;
    const route = moved
      ? `<span class="tk-code">${prev.c}</span><span class="tk-fly" aria-hidden="true"><i></i>✈<i></i></span><span class="tk-code">${s.c}</span>`
      : `<span class="tk-code">${s.c}</span><span class="tk-tag">${i ? 'still here' : 'origin'}</span>`;
    card.innerHTML = `<div class="tk-main">
        <span class="tk-label">${moved ? `${CITY[prev.c].name} → ${c.name}` : c.name}</span>
        <div class="tk-route">${route}</div>
        <dl class="tk-meta"><div><dt>When</dt><dd>${esc(s.when)}</dd></div><div><dt>What</dt><dd>${esc(s.what)}</dd></div><div><dt>Where</dt><dd>${esc(s.where)}</dd></div></dl>
      </div>
      <div class="tk-stub"><span class="tk-label">Stop</span><b>${i + 1}<small>/${STOPS.length}</small></b>${s.go ? '<button type="button">Show me →</button>' : ''}</div>`;
    const btn = card.querySelector('button'); if (btn) btn.onclick = () => window.__mock?.goTo?.(s.go);
    document.querySelectorAll('.tl-item').forEach((el) => el.classList.toggle('j-active', s.go && '#' + el.id === s.go));
    range.setAttribute('aria-valuetext', `${s.when}: ${s.what}, ${s.where}, ${c.name}`);
    [...ticks.children].forEach((t) => t.classList.toggle('on', +t.dataset.i === i));
  }
  STOPS.forEach((s, i) => {
    if (!s.tick) return;
    const t = document.createElement('span'); t.textContent = s.tick; t.dataset.i = i;
    t.style.left = `calc(${(i / (STOPS.length - 1)) * 100}% + ${8 - (i / (STOPS.length - 1)) * 16}px)`;
    ticks.appendChild(t);
  });

  function go(i, animate) {
    i = Math.max(0, Math.min(STOPS.length - 1, i));
    const from = cur; cur = i; range.value = i; showCard(i);
    spin = { lat: 0, lon: 0 };
    // fly the last leg that ends at or before i, if we actually changed city
    if (animate && !reduce && STOPS[from].c !== STOPS[i].c) {
      // fly straight from where we are to where we're going (scrubbing can skip stops)
      const leg = LEGS.find((l) => l.end === i && l.from === STOPS[from].c) || { from: STOPS[from].c, to: STOPS[i].c, end: Infinity };
      const a = CITY[leg.from].v, b = CITY[leg.to].v, d = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      flight = { leg, t0: performance.now(), dur: 700 + d * 650, camFrom: camFor(CITY[leg.from]), camTo: camFor(CITY[leg.to]) };
    } else flight = null;
    kick();
  }

  /* ---------- input ---------- */
  let auto = null;
  const stopAuto = () => { clearTimeout(auto); auto = null; };
  range.addEventListener('input', () => { stopAuto(); go(+range.value, true); });
  cv.addEventListener('pointerdown', (e) => { stopAuto(); drag = { x: e.clientX, y: e.clientY, s: { ...spin } }; cv.setPointerCapture(e.pointerId); cv.classList.add('grabbing'); });
  cv.addEventListener('pointermove', (e) => {
    if (!drag) return;
    spin = { lon: drag.s.lon - (e.clientX - drag.x) * 0.5, lat: drag.s.lat + (e.clientY - drag.y) * 0.4 };
    kick();
  });
  const end = () => { drag = null; cv.classList.remove('grabbing'); };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('dblclick', () => { spin = { lat: 0, lon: 0 }; kick(); });

  // play the whole route once, the first time the globe scrolls into view
  let played = false;
  function playRoute(i = 0) {
    go(i, i > 0);
    if (i < STOPS.length - 1) auto = setTimeout(() => playRoute(i + 1), STOPS[i + 1].c !== STOPS[i].c ? 2300 : 1100);
    else auto = null;
  }

  /* ---------- loop: only while visible ---------- */
  let raf = 0, last = performance.now();
  function frame(now) {
    raf = 0;
    if (!visible) return;
    if (!drag && !document.documentElement.classList.contains('motion-off')) idle += now - last;
    last = now;
    draw(now);
    if (!reduce || flight) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } else if (reduce && visible) draw(performance.now()); }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !played) { played = true; if (!reduce) { cur = 0; playRoute(0); } }
    kick();
  }, { threshold: 0.35 }).observe(cv);
  new ResizeObserver(() => { size(); kick(); }).observe(cv);
  size(); showCard(cur);
})();
