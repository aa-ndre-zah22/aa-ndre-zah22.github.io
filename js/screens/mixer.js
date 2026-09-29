window.Screens = window.Screens || {};
window.Screens.mixer = (function () {

const DEFAULT_VOLUME = 60;

function render(el, navigate) {
  const mix = window.AppState.mix; // id -> volume percent, present = in the mix

  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <div class="mixer-step">02 / 11 &mdash; build your mix</div>

    <h1 class="mixer-title">Build your childhood sound</h1>
    <p class="mixer-sub">10 sounds so far &mdash; tap one to drop it on the deck. More on the way.</p>

    <div class="mixer-grid" id="mixer-grid"></div>

    <div class="mixer-dock">
      <button class="mixer-playbtn" id="mixer-playbtn" aria-label="Play mix">
        <span class="mixer-play-icon" id="mixer-play-icon">&#9654;</span>
      </button>
      <div class="mixer-chips" id="mixer-chips">
        <span class="mixer-empty" id="mixer-empty">your mixtape is currently more silent than a library on a Sunday &mdash; tap a record above</span>
      </div>
      <button class="btn btn-accent" id="mixer-listen">LISTEN &rarr;</button>
    </div>
  `;

  const grid = el.querySelector('#mixer-grid');
  const chips = el.querySelector('#mixer-chips');
  const emptyMsg = el.querySelector('#mixer-empty');
  const playBtn = el.querySelector('#mixer-playbtn');
  const playIcon = el.querySelector('#mixer-play-icon');

  window.SOUNDS.forEach((s) => {
    const tile = document.createElement('div');
    tile.className = 'mixer-tile';
    tile.id = 'tile-' + s.id;
    tile.innerHTML = `
      <div class="mixer-disc">
        <img src="assets/${s.file}" alt="" class="mixer-icon" />
        <span class="mixer-badge">&check;</span>
      </div>
      <div class="mixer-tile-label">${s.name}</div>
    `;
    tile.addEventListener('click', () => toggleSound(s));
    grid.appendChild(tile);
    if (mix[s.id] != null) tile.classList.add('mixer-tile-active');
  });

  const addTile = document.createElement('div');
  addTile.className = 'mixer-tile mixer-add-tile';
  addTile.innerHTML = `
    <div class="mixer-disc mixer-disc-dashed"><span class="mixer-plus">+</span></div>
    <div class="mixer-tile-label">Add Your Own Sound</div>
  `;
  grid.appendChild(addTile);

  function toggleSound(s) {
    const tile = document.getElementById('tile-' + s.id);
    if (mix[s.id] != null) {
      delete mix[s.id];
      tile.classList.remove('mixer-tile-active');
      window.SoundEngine.removeSound(s.id);
    } else {
      mix[s.id] = DEFAULT_VOLUME;
      tile.classList.add('mixer-tile-active');
      window.SoundEngine.addSound(s.id, DEFAULT_VOLUME);
    }
    renderChips();
  }

  function renderChips() {
    const ids = Object.keys(mix);
    chips.innerHTML = '';
    if (ids.length === 0) {
      chips.appendChild(emptyMsg);
      return;
    }
    ids.forEach((id) => {
      const s = window.SOUNDS.find((x) => x.id === id);
      const chip = document.createElement('div');
      chip.className = 'mixer-chip';
      chip.innerHTML = `
        <img src="assets/${s.file}" class="mixer-chip-icon" alt="" />
        <span class="mixer-chip-name">${s.name}</span>
        <input type="range" min="0" max="100" value="${mix[id]}" class="mixer-slider" />
        <span class="mixer-chip-pct">${mix[id]}%</span>
        <span class="mixer-chip-remove">&times;</span>
      `;
      chip.querySelector('.mixer-slider').addEventListener('input', (e) => {
        const v = Number(e.target.value);
        mix[id] = v;
        chip.querySelector('.mixer-chip-pct').textContent = v + '%';
        window.SoundEngine.setVolume(id, v);
      });
      chip.querySelector('.mixer-chip-remove').addEventListener('click', () => toggleSound(s));
      chips.appendChild(chip);
    });
  }

  renderChips();

  // rebuild the audio graph for whatever's already in the mix (e.g. coming back from Listen)
  Object.keys(mix).forEach((id) => window.SoundEngine.addSound(id, mix[id]));
  syncPlayButton();

  function syncPlayButton() {
    const playing = window.SoundEngine.isPlaying();
    playIcon.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
    playBtn.classList.toggle('mixer-playbtn-active', playing);
  }
  el._onEnter = syncPlayButton;

  playBtn.addEventListener('click', () => {
    if (window.SoundEngine.isPlaying()) window.SoundEngine.pause();
    else window.SoundEngine.play();
    syncPlayButton();
  });

  el.querySelector('#mixer-listen').addEventListener('click', () => navigate('listen'));
}

function onEnter(el) {
  if (el._onEnter) el._onEnter();
}

return { render, onEnter };
})();
