(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = $('#banner svg'); if (!hero) return;
  const NS = 'http://www.w3.org/2000/svg';

  const btn = document.createElement('button');
  btn.className = 'companion'; btn.type = 'button';
  btn.setAttribute('aria-label', 'Ask AI Sarath');
  btn.innerHTML = '<span class="cbg" aria-hidden="true"></span>';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '300 20 600 640'); svg.setAttribute('aria-hidden', 'true');
  svg.appendChild(hero.querySelector('defs').cloneNode(true));
  const me = hero.querySelector('.me').cloneNode(true);
  me.querySelectorAll('.bubble').forEach((b) => b.remove());
  svg.appendChild(me);
  // a little laptop that slides up while "typing"
  const lid = document.createElementNS(NS, 'g'); lid.setAttribute('class', 'mini-lid');
  lid.innerHTML = '<rect x="390" y="520" width="420" height="190" rx="22" class="lid-face"/><circle cx="600" cy="600" r="22" fill="none" stroke="var(--accent)" stroke-width="9"/>';
  svg.appendChild(lid);
  btn.appendChild(svg);
  document.body.appendChild(btn);
  const bubble = document.createElement('div'); bubble.className = 'c-bubble'; bubble.setAttribute('aria-live', 'polite'); document.body.appendChild(bubble);

  // transform origins for the cloned rig
  requestAnimationFrame(() => svg.querySelectorAll('[data-pivot]').forEach((el) => {
    const [px, py] = el.dataset.pivot.split(' ').map(Number); const b = el.getBBox();
    el.style.transformOrigin = `${px - b.x}px ${py - b.y}px`;
  }));

  const MOODS = {
    about: { cls: [], line: "hey, I'm Sarath" },
    ask: { cls: ['look-right'], line: 'ask me anything, I cite my sources' },
    projects: { cls: ['typing'], line: 'every card has a live demo, try one' },
    experience: { cls: ['look-up'], line: 'two years shipping at IDFC FIRST Bank' },
    education: { cls: ['look-up'], line: 'MS CS at USC, graduating May 2028' },
    stack: { cls: ['think'], line: 'drag the skills around' },
    achievements: { cls: ['look-up'], line: "2nd in Anthropic's track at Cal Hacks!", party: true },
    notes: { cls: ['typing'], line: 'how I built the chat above' },
    contact: { cls: ['look-up'], line: "say hi, I'm looking for Summer 2027 internships", hop: true },
  };
  const ALL = ['typing', 'look-right', 'look-up', 'think'];
  let current = '', bt;
  function mood(id) {
    if (id === current || !MOODS[id]) return;
    current = id; const m = MOODS[id];
    svg.classList.remove(...ALL); svg.classList.add(...m.cls);
    bubble.textContent = m.line; bubble.classList.add('on');
    clearTimeout(bt); bt = setTimeout(() => bubble.classList.remove('on'), 2600);
    if (!reduce && m.hop) { btn.classList.remove('hop'); void btn.offsetWidth; btn.classList.add('hop'); }
    if (!reduce && m.party) confetti();
  }
  function confetti() {
    const r = btn.getBoundingClientRect(), cols = ['var(--accent)', 'var(--gold)', 'var(--ink)'];
    for (let i = 0; i < 16; i++) {
      const c = document.createElement('i'); c.className = 'confetti';
      c.style.left = `${r.left + r.width / 2}px`; c.style.top = `${r.top + 10}px`; c.style.background = cols[i % 3];
      document.body.appendChild(c);
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, d = 70 + Math.random() * 70;
      c.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + 60}px) rotate(${Math.random() * 540}deg)`, opacity: 0 }],
        { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => c.remove();
    }
  }

  // show once the hero is out of view
  new IntersectionObserver(([e]) => btn.classList.toggle('on', !e.isIntersecting), { threshold: 0.05 }).observe($('#banner'));
  const sio = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && mood(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('section[id]').forEach((s) => sio.observe(s));
  (function blink() { setTimeout(() => { svg.classList.add('blink'); setTimeout(() => svg.classList.remove('blink'), 130); blink(); }, 2600 + Math.random() * 2800); })();

  btn.addEventListener('click', () => {
    $('#ask').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => $('#askBox')?.focus({ preventScroll: true }), reduce ? 0 : 600);
  });
  window.__companion = { mood, confetti, svg };
})();
