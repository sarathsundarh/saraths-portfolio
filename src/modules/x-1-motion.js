(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // cards tilt slightly toward the cursor
  if (!reduce && fine) {
    document.querySelectorAll('.proj').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        if (e.target.closest('.demo')) { card.style.transform = ''; return; }
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('tilting');
        card.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave', () => { card.classList.remove('tilting'); card.style.transform = ''; });
    });
  }

  // numbers count up the first time they scroll into view (the final value is already in the HTML)
  if (!reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target, to = +el.dataset.to, suf = el.dataset.suf || '';
      const t0 = performance.now(), dur = 1100;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
        el.textContent = v + suf;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.9 });
    document.querySelectorAll('.count').forEach((el) => io.observe(el));
  }
})();
