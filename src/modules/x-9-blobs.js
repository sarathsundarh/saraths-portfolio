(() => {
  // ink blobs lean gently toward the cursor and drift with scroll; purely decorative
  const el = document.querySelector('.bg-blobs');
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let mx = 0, my = 0, sy = 0, raf = 0;
  const apply = () => { raf = 0; el.style.setProperty('--bx', `${(mx * 26).toFixed(1)}px`); el.style.setProperty('--by', `${(my * 26 - sy * 0.04).toFixed(1)}px`); };
  const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
  window.addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; queue(); }, { passive: true });
  window.addEventListener('scroll', () => { sy = Math.min(scrollY, 4000); queue(); }, { passive: true });
})();
