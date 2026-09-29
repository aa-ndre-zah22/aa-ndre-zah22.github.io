window.Screens = window.Screens || {};
window.Screens.signin = (function () {

function render(el, navigate) {
  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <div class="signin-scrim"></div>
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />

    <div class="signin-card">
      <button class="signin-close" id="signin-close" aria-label="Close">&times;</button>
      <h1>Hey stranger,<br />remember me?</h1>
      <p class="signin-sub">Sign in with your email to start pressing play on your past.</p>

      <label class="save-label" style="margin-bottom:6px;display:block;">EMAIL</label>
      <input type="email" id="signin-email" class="signin-input" placeholder="you@example.com" />
      <p class="signin-error" id="signin-error"></p>

      <button class="signin-btn signin-btn-dark" id="btn-continue">Continue</button>

      <p class="signin-fine">By signing in you agree to occasionally feel a lot of feelings. No spam, mostly nostalgia.</p>
      <hr />
      <p class="signin-fine">Guests can still browse the map, open pins, and listen without an account &mdash; this only shows up when you try to build or save a mix.</p>
    </div>
  `;

  const emailInput = el.querySelector('#signin-email');
  const errorMsg = el.querySelector('#signin-error');

  function tryContinue() {
    const val = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!valid) {
      errorMsg.textContent = 'That doesn\'t look like an email yet.';
      emailInput.focus();
      return;
    }
    errorMsg.textContent = '';
    navigate('mixer');
  }

  el.querySelector('#signin-close').addEventListener('click', () => navigate('landing'));
  el.querySelector('#btn-continue').addEventListener('click', tryContinue);
  emailInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryContinue(); });
}

return { render };
})();
