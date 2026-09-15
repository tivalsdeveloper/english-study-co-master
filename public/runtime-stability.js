(() => {
  if (window.__tivalsRuntimeStability) return;
  window.__tivalsRuntimeStability = true;

  // Prevent accidental double submission caused by duplicated click handlers.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[type="submit"], [data-send-button]');
    if (!button || button.dataset.busy !== 'true') return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  // Keep navigation usable even when an overlay is accidentally left active.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('[data-menu-open="true"], [aria-modal="true"]').forEach((el) => {
      if (el instanceof HTMLElement) el.hidden = true;
    });
    document.body.style.overflow = '';
  });

  // Chat media must be scoped to its chat/message, never treated as global page state.
  const tagMedia = (root = document) => {
    root.querySelectorAll('[data-message-id] img, [data-message-id] video').forEach((media) => {
      const message = media.closest('[data-message-id]');
      if (message && !media.dataset.messageId) media.dataset.messageId = message.dataset.messageId || '';
    });
  };
  tagMedia();
  new MutationObserver(() => tagMedia()).observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('pageshow', () => { document.body.style.overflow = ''; });
})();
