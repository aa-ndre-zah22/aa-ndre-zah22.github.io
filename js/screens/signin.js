window.Screens = window.Screens || {};
window.Screens.signin = (function () {

const EMAIL_STORAGE_KEY = 'ringABellPendingEmail';

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

// Called once at startup (see main.js) to complete sign-in if the user
// arrived by clicking the magic link from their email.
function completeSignInIfNeeded(onSignedIn) {
  if (!window.auth.isSignInWithEmailLink(window.location.href)) return;

  let email = window.localStorage.getItem(EMAIL_STORAGE_KEY);
  if (!email) {
    email = window.prompt('Confirm the email you signed in with:');
  }
  if (!email) return;

  window.auth.signInWithEmailLink(email, window.location.href)
    .then(() => {
      window.localStorage.removeItem(EMAIL_STORAGE_KEY);
      // Strip the one-time oobCode/apiKey query params Firebase appended
      // to the link before the router adds its own #screen fragment back.
      window.history.replaceState(null, '', window.location.origin + window.location.pathname);
      if (onSignedIn) onSignedIn();
    })
    .catch((err) => {
      console.warn('Email link sign-in failed:', err.message);
    });
}

return { render, completeSignInIfNeeded };
})();
