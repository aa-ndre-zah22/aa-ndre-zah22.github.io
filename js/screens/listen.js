window.Screens = window.Screens || {};
window.Screens.listen = (function () {

function render(el, navigate) {
  const hasSounds = Object.keys(window.AppState.mix).length > 0;

  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <div class="listen-step">03 / 11 &mdash; take a listen</div>

    <h1 class="listen-title">Your Memory Soundscape</h1>
    <p class="listen-sub">Take a sec. Let it hit you. (Deep breath &mdash; this one's a doozy.)</p>

    <div class="listen-stage">
      <div class="listen-wave listen-wave-left">
        <span></span><span></span><span></span>
      </div>
      <img class="listen-radio" src="assets/radio.svg" alt="" />
      <div class="listen-wave listen-wave-right">
        <span></span><span></span><span></span>
      </div>
    </div>

    <div class="listen-bars" id="listen-bars">
      ${Array.from({ length: 8 }).map(() => '<span class="listen-bar"></span>').join('')}
    </div>

    <div class="listen-transport">
      <span class="listen-time">0:12</span>
      <button class="listen-playbtn" id="listen-playbtn" aria-label="Play">
        <span id="listen-play-icon">&#9654;</span>
      </button>
      <span class="listen-time">1:04</span>
    </div>

    <div class="listen-actions">
      <button class="btn btn-outline" id="listen-edit">EDIT MIX</button>
      <button class="btn btn-accent" id="listen-draw">DRAW IT OUT &rarr;</button>
    </div>

    ${!hasSounds ? '<p class="listen-empty-note">Your mix is empty &mdash; head back and drop a few sounds on the deck first.</p>' : ''}
  `;

  const playBtn = el.querySelector('#listen-playbtn');
  const playIcon = el.querySelector('#listen-play-icon');
  const bars = el.querySelector('#listen-bars');

  function syncPlayUI() {
    const playing = window.SoundEngine.isPlaying();
    playIcon.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
    playBtn.classList.toggle('listen-playbtn-active', playing);
    bars.classList.toggle('listen-bars-active', playing);
  }

  playBtn.addEventListener('click', () => {
    if (window.SoundEngine.isPlaying()) window.SoundEngine.pause();
    else window.SoundEngine.play();
    syncPlayUI();
  });

  if (hasSounds && !window.SoundEngine.isPlaying()) window.SoundEngine.play();
  syncPlayUI();
  el._onEnter = syncPlayUI;

  el.querySelector('#listen-edit').addEventListener('click', () => navigate('mixer'));
  el.querySelector('#listen-draw').addEventListener('click', () => navigate('draw'));
}

function onEnter(el) {
  if (el._onEnter) el._onEnter();
}

return { render, onEnter };
})();
