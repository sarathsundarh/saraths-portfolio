(() => {
  // long highlight lists collapse to three on phones (the button is hidden on wider screens by CSS)
  document.querySelectorAll('.tl-item ul').forEach((ul) => {
    const n = ul.children.length; if (n <= 3) return;
    ul.classList.add('clip');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'more-btn';
    btn.textContent = `Show all ${n} highlights`;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const open = ul.classList.toggle('clip') === false;
      btn.textContent = open ? 'Show fewer' : `Show all ${n} highlights`;
      btn.setAttribute('aria-expanded', String(open));
    });
    ul.after(btn);
  });
})();
