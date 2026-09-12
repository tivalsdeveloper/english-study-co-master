(() => {
  function enhance() {
    const auth = document.querySelector('.auth');
    if (!auth) return;
    const heading = auth.querySelector('h2');
    if (!heading || heading.textContent?.trim() !== 'Welcome back') return;
    const form = auth.querySelector('form');
    if (!form || form.querySelector('.login-forgot-inline')) return;
    const password = form.querySelector('input[name="password"]');
    if (!password) return;
    const label = password.closest('label');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'login-forgot-inline';
    button.textContent = 'Forgot password?';
    button.addEventListener('click', () => {
      const close = auth.querySelector('button.close');
      if (close instanceof HTMLButtonElement) close.click();
      setTimeout(() => window.dispatchEvent(new Event('english-open-forgot-password')), 50);
    });
    label?.insertAdjacentElement('afterend', button);
  }
  const style = document.createElement('style');
  style.textContent = `.login-forgot-inline{display:block;margin:-2px 0 12px auto;border:0;background:transparent;color:#17634f;font-weight:700;font-size:14px;padding:4px 0;cursor:pointer;text-decoration:underline;text-underline-offset:3px}.login-forgot-inline:hover{opacity:.8}`;
  document.head.appendChild(style);
  new MutationObserver(enhance).observe(document.body, { childList:true, subtree:true });
  enhance();
})();