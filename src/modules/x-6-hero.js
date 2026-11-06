(() => {
  const hero = document.querySelector('#banner svg'); if (!hero) return;
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // extra props: a "hi!" bubble on the head and a coffee puddle by the mug
  const head = hero.querySelector('.head');
  const hi = document.createElementNS(NS, 'text'); hi.setAttribute('class', 'hi-bubble'); hi.setAttribute('x', '690'); hi.setAttribute('y', '160'); hi.textContent = 'hi!'; head.appendChild(hi);
  const mug = hero.querySelector('.mug');
  if (mug) { const pud = document.createElementNS(NS, 'ellipse'); pud.setAttribute('class', 'puddle'); pud.setAttribute('cx', '1250'); pud.setAttribute('cy', '1430'); pud.setAttribute('rx', '120'); pud.setAttribute('ry', '10'); mug.parentNode.insertBefore(pud, mug); }

  let busy = false;
  const flash = (c, ms) => { hero.classList.add(c); setTimeout(() => hero.classList.remove(c), ms); };
  hero.querySelector('.me').addEventListener('click', () => {
    if (busy) return; busy = true; setTimeout(() => (busy = false), 1500);
    if (hero.classList.contains('s-night')) { hero.classList.add('spill', 'q-on'); setTimeout(() => hero.classList.remove('spill', 'q-on'), 2400); window.__toast?.('oops, 2 AM coffee'); }
    else if (hero.classList.contains('s-agent') && hero.classList.contains('bot-up')) { flash('bot-hop', 900); flash('ex-on', 1100); }
    else flash('react-hi', 1500);
  });

  // type a line of code and the character "runs" it in the code window
  const form = document.getElementById('runline'), input = document.getElementById('runInput');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const line = input.value.trim().slice(0, 48); if (!line) return;
    input.value = '';
    try {
      paused = true; // freeze the scene timeline while the visitor's line runs
      const scenes = ['s-code', 's-agent', 's-brain', 's-night'];
      const was = scenes.find((s) => hero.classList.contains(s));
      hero.classList.remove(...STATE, ...scenes, 'paused'); hero.classList.add('s-code');
      document.getElementById('banner').classList.remove('night');
      fname.textContent = 'you.ts'; clearCode();
      setRow(0, [['c', '// typed by you']]);
      hero.classList.add('typing');
      let k = 0;
      const iv = setInterval(() => {
        k++; setRow(1, [['', line.slice(0, k)]]); row(1).appendChild(caret);
        if (k >= line.length || reduce) {
          clearInterval(iv); setRow(1, [['', line]]);
          setTimeout(() => {
            hero.classList.remove('typing'); hero.classList.add('look-up', 'ex-on');
            setRow(2, [['ok', '✓ '], ['c', `ran in ${(0.1 + Math.random() * 0.5).toFixed(2)}s`]]);
            setRow(3, [['c', '// nice line. back to my code'], ]);
            setTimeout(() => { hero.classList.remove('look-up', 'ex-on'); paused = false; play(idx); }, 2600);
          }, 350);
        }
      }, 55);
    } catch (err) { paused = false; }
  });
})();

;(() => {
  // visible pause control: stops the illustration, the drifting background and the chat avatar's idle motion
  const btn = document.getElementById('heroPause'); if (!btn) return;
  const hero = document.querySelector('#banner svg'), banner = document.getElementById('banner');
  const label = btn.querySelector('span'), icon = btn.querySelector('use');
  let held = false;
  try { held = localStorage.getItem('motion') === 'off'; } catch (e) {}
  const apply = () => {
    try { paused = held; } catch (e) {}
    hero?.classList.toggle('paused', held);
    document.documentElement.classList.toggle('motion-off', held);
    btn.setAttribute('aria-pressed', String(held));
    label.textContent = held ? 'Play animation' : 'Pause animation';
    icon.setAttribute('href', held ? '#i-play' : '#i-pause');
  };
  btn.addEventListener('click', () => { held = !held; try { localStorage.setItem('motion', held ? 'off' : 'on'); } catch (e) {} apply(); });
  // the scene's own hover handler resumes on mouseleave; keep it paused if the visitor asked
  banner?.addEventListener('mouseleave', () => { if (held) { try { paused = true; } catch (e) {} hero?.classList.add('paused'); } });
  if (held) setTimeout(apply, 0);
})();
