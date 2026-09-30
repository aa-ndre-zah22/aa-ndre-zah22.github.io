window.Screens = window.Screens || {};
window.Screens.signin = (function () {

const EMAIL_STORAGE_KEY = 'ringABellPendingEmail';

function render(el, navigate) {
  if (window.auth.isSignInWithEmailLink(window.location.href)) {
    renderCompleting(el, navigate);
  } else {
    renderForm(el, navigate);
  }
}

function cleanUrl() {
  // Strip the one-time oobCode/apiKey query params Firebase appended to
  // the link before the router adds its own #screen fragment back.
  window.history.replaceState(null, '', window.location.origin + window.location.pathname);
}

function finishSignIn(email, el, navigate) {
  window.auth.signInWithEmailLink(email, window.location.href)
    .then(() => {
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      cleanUrl();
      navigate('mixer');
    })
    .catch((err) => {
      renderConfirmForm(el, navigate, err.message || "That link didn't work — try entering your email again.");
    });
}

function renderConfirmForm(el, navigate, errorText) {
  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <div class="signin-scrim"></div>
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />

    <div class="signin-card">
      <button class="signin-close" id="signin-close" aria-label="Close">&times;</button>
      <h1>Almost there.</h1>
      <p class="signin-sub">Confirm the email you used, to finish signing in on this device.</p>

      <label class="save-label" style="margin-bottom:6px;display:block;">EMAIL</label>
      <input type="email" id="confirm-email" class="signin-input" placeholder="you@example.com" />
      <p class="signin-error" id="signin-error">${errorText || ''}</p>

      <button class="signin-btn signin-btn-dark" id="btn-confirm">Confirm &amp; Sign In</button>
    </div>
  `;

  const input = el.querySelector('#confirm-email');
  const errorMsg = el.querySelector('#signin-error');
  const btn = el.querySelector('#btn-confirm');

  function tryConfirm() {
    const val = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      errorMsg.textContent = "That doesn't look like an email yet.";
      input.focus();
      return;
    }
    errorMsg.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    finishSignIn(val, el, navigate);
  }

  el.querySelector('#signin-close').addEventListener('click', () => { cleanUrl(); navigate('landing'); });
  btn.addEventListener('click', tryConfirm);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryConfirm(); });
}

function renderCompleting(el, navigate) {
  const storedEmail = window.localStorage.getItem(EMAIL_STORAGE_KEY);

  if (!storedEmail) {
    // Link was opened in a different browser/app than the one the email
    // was requested from (common when opening from a mail app) — we can't
    // read the pending email from localStorage there, so ask for it here
    // instead of the native window.prompt(), which many in-app browsers
    // silently block, causing a confusing "nothing happens" loop.
    renderConfirmForm(el, navigate, '');
    return;
  }

  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <div class="signin-scrim"></div>
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />

    <div class="signin-card">
      <h1>Signing you in...</h1>
      <p class="signin-sub">Just a second.</p>
    </div>
  `;

  finishSignIn(storedEmail, el, navigate);
}

function renderForm(el, navigate) {
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
  const continueBtn = el.querySelector('#btn-continue');
  const card = el.querySelector('.signin-card');

  function showSentState(email) {
    card.innerHTML = `
      <button class="signin-close" id="signin-close" aria-label="Close">&times;</button>
      <h1>Check your inbox.</h1>
      <p class="signin-sub">We just sent a real sign-in link to <strong>${email}</strong>. Open it on this device to finish signing in.</p>
      <p class="signin-fine">Didn't get it? Check spam, or close this and try again with a different email.</p>
    `;
    el.querySelector('#signin-close').addEventListener('click', () => navigate('landing'));
  }

  function tryContinue() {
    const val = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!valid) {
      errorMsg.textContent = 'That doesn\'t look like an email yet.';
      emailInput.focus();
      return;
    }
    errorMsg.textContent = '';
    continueBtn.disabled = true;
    continueBtn.textContent = 'Sending...';

    const actionCodeSettings = {
      url: window.location.origin + window.location.pathname + '#signin',
      handleCodeInApp: true,
    };

    window.auth.sendSignInLinkToEmail(val, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem(EMAIL_STORAGE_KEY, val);
        showSentState(val);
      })
      .catch((err) => {
        continueBtn.disabled = false;
        continueBtn.textContent = 'Continue';
        errorMsg.textContent = err.message || 'Something went wrong sending that link.';
      });
  }

  el.querySelector('#signin-close').addEventListener('click', () => navigate('landing'));
  el.querySelector('#btn-continue').addEventListener('click', tryContinue);
  emailInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryContinue(); });
}

return { render };
})();
