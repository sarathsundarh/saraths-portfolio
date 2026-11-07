(() => {
  // Ask AI Sarath as a floating chat: a launcher pill, a draggable panel on wide screens,
  // a bottom sheet on phones, and a "back to chat" pill after an answer moves the page.
  const panel = document.getElementById('ask'); if (!panel) return;
  const box = document.getElementById('askBox'), head = panel.querySelector('.chat-head');
  const phone = matchMedia('(max-width: 640px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  const launch = document.createElement('button');
  launch.type = 'button'; launch.className = 'chat-launch';
  launch.innerHTML = '<span class="av" aria-hidden="true"></span><span class="cl-text">Ask AI Sarath</span>';
  document.body.appendChild(launch);
  const triggers = [launch, document.getElementById('chatFab'), document.getElementById('dockChat')].filter(Boolean);
  triggers.forEach((t) => { t.setAttribute('aria-controls', 'ask'); t.setAttribute('aria-expanded', 'false'); });

  const back = document.createElement('button');
  back.type = 'button'; back.className = 'chat-back'; back.textContent = '↩ back to chat';
  document.body.appendChild(back);

  // a one-time nudge so visitors know the chat exists
  const hint = document.createElement('div');
  hint.className = 'chat-hint'; hint.setAttribute('role', 'status');
  hint.innerHTML = '<span>Ask me about my work. Answers cite their sources.</span><button type="button" aria-label="Dismiss">×</button>';
  document.body.appendChild(hint);
  const dropHint = () => { hint.classList.remove('on'); store.set('chatHint', '1'); };
  hint.querySelector('button').onclick = dropHint;
  hint.querySelector('span').onclick = () => open(launch);
  if (!store.get('chatHint')) setTimeout(() => { if (!isOpen()) hint.classList.add('on'); }, 5000);

  let opener = null, hideT;
  const isOpen = () => panel.classList.contains('is-open');
  const setExpanded = (v) => triggers.forEach((t) => t.setAttribute('aria-expanded', String(v)));
  function open(from) {
    if (isOpen()) { box.focus({ preventScroll: true }); return; }
    opener = from || document.activeElement;
    clearTimeout(hideT); panel.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('is-open')));
    document.body.classList.add('chat-open'); setExpanded(true);
    back.classList.remove('on'); dropHint();
    setTimeout(() => box.focus({ preventScroll: true }), reduce ? 0 : 180);
    const chat = document.getElementById('chat'); chat.scrollTop = chat.scrollHeight;
  }
  function close(restore = true) {
    if (!isOpen()) return;
    panel.classList.remove('is-open'); document.body.classList.remove('chat-open'); setExpanded(false);
    hideT = setTimeout(() => { if (!isOpen()) panel.hidden = true; }, reduce ? 0 : 260);
    if (restore) (opener && opener.isConnected && opener.offsetParent !== null ? opener : launch).focus({ preventScroll: true });
  }
  const toggle = (from) => (isOpen() ? close() : open(from));
  launch.addEventListener('click', () => toggle(launch));
  panel.querySelector('.chat-close').addEventListener('click', () => close());
  back.addEventListener('click', () => open(launch));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen() && document.getElementById('overlay')?.hidden !== false) close();
  });

  // when an answer scrolls the page: on phones the sheet covers it, so tuck it away and offer the way back
  function afterMove() {
    if (!phone.matches) return;
    close(false);
    setTimeout(() => back.classList.add('on'), 500);
  }
  window.addEventListener('scroll', () => { if (back.classList.contains('on') && window.scrollY < 40) back.classList.remove('on'); }, { passive: true });

  // drag the panel by its header on wide screens; double-click the header to put it back
  let drag = null;
  const clamp = (x, y) => [Math.min(innerWidth - panel.offsetWidth - 8, Math.max(8, x)), Math.min(innerHeight - panel.offsetHeight - 8, Math.max(8, y))];
  const place = (x, y) => { [x, y] = clamp(x, y); Object.assign(panel.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' }); };
  const unplace = () => { ['left', 'top', 'right', 'bottom'].forEach((k) => (panel.style[k] = '')); panel.classList.remove('moved'); };
  head.addEventListener('pointerdown', (e) => {
    if (phone.matches || e.button !== 0 || e.target.closest('button, a')) return;
    const r = panel.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    head.setPointerCapture(e.pointerId); panel.classList.add('dragging');
  });
  head.addEventListener('pointermove', (e) => { if (drag) { place(e.clientX - drag.dx, e.clientY - drag.dy); panel.classList.add('moved'); } });
  const endDrag = () => { drag = null; panel.classList.remove('dragging'); };
  head.addEventListener('pointerup', endDrag); head.addEventListener('pointercancel', endDrag);
  head.addEventListener('dblclick', (e) => { if (!e.target.closest('button, a')) unplace(); });
  window.addEventListener('resize', () => { if (panel.classList.contains('moved')) { const r = panel.getBoundingClientRect(); place(r.left, r.top); } });
  phone.addEventListener('change', unplace);

  window.__chat = { open, close, toggle, afterMove, isOpen };
})();
