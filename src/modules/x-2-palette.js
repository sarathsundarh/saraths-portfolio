(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = () => window.__mock || {};
  const smooth = reduce ? 'auto' : 'smooth';

  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
  let tt; const say = (t) => { toast.textContent = t; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 1800); };
  window.__toast = say;

  const wrap = document.createElement('div'); wrap.className = 'pal-wrap'; wrap.hidden = true;
  wrap.innerHTML = `<div class="pal" role="dialog" aria-modal="true" aria-label="Command palette">
    <div class="pal-in"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input id="palInput" placeholder="Jump to a project, skill or section, or ask AI Sarath…" aria-controls="palList" aria-autocomplete="list" /><kbd>esc</kbd></div>
    <ul class="pal-list" id="palList" role="listbox" aria-label="Results"></ul>
    <div class="pal-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>⌘K</kbd> or <kbd>/</kbd> anytime</span></div></div>`;
  document.body.appendChild(wrap);
  const input = $('#palInput', wrap), list = $('#palList', wrap);

  const go = (sel, ring) => { const el = $(sel); if (!el) return; if (ring && M().goTo) M().goTo(sel); else el.scrollIntoView({ behavior: smooth, block: 'start' }); };
  const items = [];
  $$('section[data-section]').forEach((s) => items.push({ t: s.dataset.section, k: 'section', ic: '§', run: () => go('#' + s.id) }));
  $$('.proj').forEach((p) => items.push({ t: $('h3', p).firstChild.textContent.trim(), k: 'project', ic: '◆', run: () => go('#' + p.id, true) }));
  items.push({ t: 'Drigil case study', k: 'page', ic: '↗', run: () => (location.href = 'pages/drigil.html') });
  items.push({ t: 'How I built AI Sarath', k: 'note', ic: '✎', run: () => (location.href = 'pages/ai-sarath.html') });
  $$('#stackList button[data-skill]').forEach((b) => items.push({ t: b.textContent.trim(), k: 'skill', ic: '#', run: () => b.click() }));
  items.push({ t: 'Copy email address', k: 'action', ic: '@', run: () => {
    const v = 'harisara@usc.edu';
    (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => say('Copied harisara@usc.edu'), () => say('harisara@usc.edu'));
  } });
  items.push({ t: 'Toggle dark / light theme', k: 'action', ic: '◐', run: () => $('#theme') && $('#theme').click() });
  items.push({ t: 'Back to top', k: 'action', ic: '↑', run: () => window.scrollTo({ top: 0, behavior: smooth }) });

  const score = (q, t) => {
    if (!q) return 1;
    const a = t.toLowerCase(), i = a.indexOf(q);
    if (i === 0) return 100; if (i > 0) return 60 - i;
    let j = 0; for (const ch of a) if (ch === q[j]) j++;
    return j === q.length ? 10 : -1;
  };
  const hl = (t, q) => { const i = q ? t.toLowerCase().indexOf(q) : -1; const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); return i < 0 ? esc(t) : esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + q.length)) + '</mark>' + esc(t.slice(i + q.length)); };
  let shown = [], sel = 0;
  function render() {
    const raw = input.value.trim(), q = raw.toLowerCase();
    shown = items.map((it) => ({ it, s: score(q, it.t) })).filter((x) => x.s >= 0).sort((a, b) => b.s - a.s).slice(0, q ? 9 : 12).map((x) => x.it);
    if (raw) shown.push({ t: `Ask AI Sarath: “${raw}”`, k: 'ask', ic: '✦', run: () => askAI(raw) });
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length ? shown.map((it, i) => `<li role="option" id="pal-${i}" aria-selected="${i === sel}" data-i="${i}"><span class="ic">${it.ic}</span><span>${hl(it.t, q)}</span><span class="k">${it.k}</span></li>`).join('') : '<li class="pal-empty">No matches</li>';
    input.setAttribute('aria-activedescendant', shown.length ? `pal-${sel}` : '');
  }
  function askAI(q) {
    $('#ask').scrollIntoView({ behavior: smooth, block: 'start' });
    const box = $('#askBox'); box.value = q;
    setTimeout(() => $('#askForm').requestSubmit(), reduce ? 0 : 500);
  }
  let lastFocus = null;
  function open() { lastFocus = document.activeElement; wrap.hidden = false; input.value = ''; sel = 0; render(); input.focus(); }
  function close() { wrap.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  function run(i) { const it = shown[i]; if (!it) return; close(); setTimeout(it.run, 30); }
  window.__palette = { open };

  input.addEventListener('input', () => { sel = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % shown.length; render(); $(`#pal-${sel}`)?.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; render(); $(`#pal-${sel}`)?.scrollIntoView({ block: 'nearest' }); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
  });
  list.addEventListener('pointermove', (e) => { const li = e.target.closest('li[data-i]'); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; render(); } });
  list.addEventListener('click', (e) => { const li = e.target.closest('li[data-i]'); if (li) run(+li.dataset.i); });
  wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); wrap.hidden ? open() : close(); }
    else if (e.key === '/' && !typing && wrap.hidden) { e.preventDefault(); open(); }
  });
  $('#kbtn')?.addEventListener('click', open);
})();
