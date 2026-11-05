(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const arc = $('#jArc'); if (!arc) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const done = $('#jArcDone'), me = $('#jMe'), range = $('#jRange'), card = $('#jCard');
  const NS = 'http://www.w3.org/2000/svg';
  const total = arc.getTotalLength();
  const tmp = document.createElementNS(NS, 'path'); tmp.setAttribute('d', 'M640 150 C 520 20, 220 10, 110 132'); arc.parentNode.appendChild(tmp);
  const toLA = tmp.getTotalLength(); tmp.remove();
  // facts from the resume; Bangalore stops sit just apart so the marker visibly moves
  const STOPS = [
    { at: 0, when: 'Jun – Aug 2023', what: 'AI Research Intern', where: 'ElementalsAI · Bangalore', go: '#x-elem' },
    { at: 18, when: 'Jan – Jun 2024', what: 'Intern', where: 'IDFC FIRST Bank · Bangalore', go: '#x-idfc' },
    { at: 34, when: 'May 2024', what: 'B.Tech., Computer Science', where: 'PES University · Bangalore', go: '#education' },
    { at: 52, when: 'Jul 2024 – Aug 2026', what: 'Application Engineer', where: 'IDFC FIRST Bank · Bangalore', go: '#x-idfc' },
    { at: toLA, when: 'Expected May 2028', what: 'MS, Computer Science', where: 'USC · Los Angeles', go: '#education' },
    { at: total, when: 'Oct 2026', what: "Drigil, 2nd in Anthropic's track", where: 'Cal Hacks 13.0 · San Francisco', go: '#a-calhacks' },
    { at: toLA, when: 'Now', what: 'Open to Summer 2027 internships', where: 'Los Angeles', go: '#contact' },
  ];
  done.style.strokeDasharray = `${total} ${total}`;
  let cur = toLA, raf = 0, maxDone = 0;
  function place(len) {
    const p = arc.getPointAtLength(len);
    me.setAttribute('transform', `translate(${p.x.toFixed(1)} ${(p.y - 18).toFixed(1)})`);
    maxDone = Math.max(maxDone, len);
    done.style.strokeDashoffset = total - maxDone;
  }
  function show(i, animate) {
    const s = STOPS[i];
    card.innerHTML = `<span class="j-when">${s.when}</span><b>${s.what}</b><span class="j-place">${s.where}</span><button type="button">Show me →</button>`;
    card.querySelector('button').onclick = () => window.__mock?.goTo?.(s.go);
    document.querySelectorAll('.tl-item').forEach((el) => el.classList.toggle('j-active', '#' + el.id === s.go));
    cancelAnimationFrame(raf);
    const from = cur, to = s.at;
    if (!animate || reduce) { cur = to; place(to); return; }
    const t0 = performance.now(), dur = 700;
    const step = (now) => { const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; cur = from + (to - from) * e; place(cur); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  range.addEventListener('input', () => show(+range.value, true));
  maxDone = total; // the whole journey has happened; scrubbing replays it
  show(+range.value, false);
})();
