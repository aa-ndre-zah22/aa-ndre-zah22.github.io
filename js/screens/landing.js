window.Screens = window.Screens || {};
window.Screens.landing = (function () {

function render(el, navigate) {
  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />

    <nav class="nav">
      <div></div>
      <div class="nav-links">
        <span>MAP</span>
        <span>ABOUT</span>
        <span id="nav-signin" class="nav-signin">SIGN IN</span>
      </div>
    </nav>

    <div class="landing-hero">
      <div class="landing-eyebrow">AN INTERACTIVE MEMORY ARCHIVE</div>
      <h1 class="landing-title">What did your childhood sound like?</h1>
      <p class="landing-sub">No account needed to snoop around. You'll only need to sign in when you're ready to make something of your own.</p>
    </div>

    <div class="landing-cards">
      <div class="landing-card">
        <div class="landing-badge landing-badge-outline">no login needed</div>
        <div class="landing-icon landing-icon-map"></div>
        <h2>Surf the Map</h2>
        <p>Snoop through other people's childhoods. Fully consensual, mildly addictive.</p>
        <button class="btn btn-outline" id="btn-surf">TAKE ME THERE &rarr;</button>
      </div>
      <div class="landing-card">
        <div class="landing-badge landing-badge-solid">sign in required</div>
        <div class="landing-icon landing-icon-build"></div>
        <h2>Build Your Own Sound</h2>
        <p>Cook up a mixtape of your own chaos. Rain, bells, and questionable radio taste welcome.</p>
        <button class="btn btn-primary" id="btn-build">LET'S COOK &rarr;</button>
      </div>
    </div>
  `;

  const goSignIn = () => navigate('signin');
  el.querySelector('#nav-signin').addEventListener('click', goSignIn);
  el.querySelector('#btn-build').addEventListener('click', goSignIn);
  el.querySelector('#btn-surf').addEventListener('click', () => navigate('landing')); // stub: map screen not built yet
}

return { render };
})();
