(() => {
  document.querySelectorAll('.award.flip').forEach((card) => {
    const back = card.querySelector('.back'), link = card.querySelector('.a-link');
    back.setAttribute('aria-hidden', 'true');
    const follow = () => {
      if (link.dataset.href) location.href = link.dataset.href;
      else if (link.dataset.jump) window.__mock?.goTo?.(link.dataset.jump);
    };
    card.addEventListener('click', (e) => {
      const flipped = card.classList.contains('flipped');
      if (flipped && e.target.closest('.a-link')) return follow();
      card.classList.toggle('flipped', !flipped);
      card.setAttribute('aria-pressed', String(!flipped));
      back.setAttribute('aria-hidden', String(flipped));
      card.querySelector('.front').setAttribute('aria-hidden', String(!flipped));
    });
  });
})();
