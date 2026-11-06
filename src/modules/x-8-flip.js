(() => {
  // achievement stories: plain disclosure buttons (aria-expanded + a hidden paragraph)
  document.querySelectorAll('.story-btn').forEach((btn) => {
    const story = document.getElementById(btn.getAttribute('aria-controls'));
    if (!story) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide the story' : 'Read the story';
      story.hidden = !open;
    });
  });
  // in-page links inside stories use the chat's marker scroll
  document.querySelectorAll('.story a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    if (!window.__mock?.goTo) return;
    e.preventDefault(); window.__mock.goTo(a.getAttribute('href'));
  }));
})();
