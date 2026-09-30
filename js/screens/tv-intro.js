window.Screens = window.Screens || {};
window.Screens.tvIntro = (function () {

const TAPS_NEEDED = 3;

function renderStatic(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const imageData = ctx.createImageData(w, h);
  const buf = imageData.data;
  for (let i = 0; i < buf.length; i += 4) {
    const v = Math.random() * 255;
    buf[i] = v; buf[i + 1] = v; buf[i + 2] = v; buf[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

function render(el, navigate) {
  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <div class="tv-scrim"></div>
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />

    <div class="tv-stage">
      <div class="tv-wrap" id="tv-wrap">
        <img class="tv-frame" src="assets/tv-frame.svg" alt="" />
        <canvas class="tv-static" id="tv-static" width="240" height="150"></canvas>
        <img class="tv-screen-logo" id="tv-screen-logo" src="assets/logo.svg" alt="" />
        <div class="tv-hit" id="tv-hit" aria-label="Tap the TV to turn it on" role="button" tabindex="0"></div>
      </div>

      <div class="tv-cursor" id="tv-cursor">tap</div>

      <h1 class="tv-caption" id="tv-caption">Tap the TV three times to start.</h1>
      <p class="tv-subcaption" id="tv-subcaption">It has been off a while. Give it a minute.</p>

      <div class="tv-dots" id="tv-dots">
        <span class="tv-dot"></span>
        <span class="tv-dot"></span>
        <span class="tv-dot"></span>
      </div>
    </div>
  `;

  const hit = el.querySelector('#tv-hit');
  const cursor = el.querySelector('#tv-cursor');
  const staticCanvas = el.querySelector('#tv-static');
  const screenLogo = el.querySelector('#tv-screen-logo');
  const dots = el.querySelectorAll('.tv-dot');
  const caption = el.querySelector('#tv-caption');
  const subcaption = el.querySelector('#tv-subcaption');
  const tvWrap = el.querySelector('#tv-wrap');
  const stage = el.querySelector('.tv-stage');

  let taps = 0;
  let staticTimer = null;
  let finished = false;

  function startStatic() {
    if (staticTimer) return;
    staticTimer = setInterval(() => renderStatic(staticCanvas), 90);
  }
  function stopStatic() {
    clearInterval(staticTimer);
    staticTimer = null;
  }
  startStatic();
  window.RingAudio.startGrainNoise();

  stage.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  stage.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  stage.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });

  function handleTap() {
    if (finished) return;
    taps++;
    window.RingAudio.playTapSound();
    cursor.classList.remove('tv-cursor-tap');
    void cursor.offsetWidth; // restart animation
    cursor.classList.add('tv-cursor-tap');

    tvWrap.classList.remove('tv-flicker');
    void tvWrap.offsetWidth;
    tvWrap.classList.add('tv-flicker');

    if (taps <= TAPS_NEEDED) {
      dots[taps - 1].classList.add('tv-dot-filled');
    }

    if (taps === 1) {
      subcaption.textContent = 'One more...';
    } else if (taps === 2) {
      subcaption.textContent = 'Almost there...';
      window.RingAudio.playStaticBurst();
    } else if (taps >= TAPS_NEEDED) {
      finished = true;
      turnOn();
    }
  }

  function turnOn() {
    stopStatic();
    window.RingAudio.stopGrainNoise();
    window.RingAudio.playSurpriseTone();
    staticCanvas.style.opacity = '0';
    screenLogo.style.opacity = '1';
    hit.style.cursor = 'default';
    caption.textContent = 'There it is.';
    subcaption.textContent = 'Entering Ring a Bell...';
    cursor.style.opacity = '0';

    setTimeout(() => navigate('landing'), 3500);
  }

  hit.addEventListener('click', handleTap);
  hit.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); }
  });

  el._cleanup = function () {
    stopStatic();
    window.RingAudio.stopGrainNoise();
  };
}

function onExit(el) {
  if (el._cleanup) el._cleanup();
}

return { render, onExit };
})();
