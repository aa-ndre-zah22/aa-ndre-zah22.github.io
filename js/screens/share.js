window.Screens = window.Screens || {};
window.Screens.share = (function () {

function render(el, navigate) {
  const memory = window.AppState.savedMemory || { title: 'Rainy Days at School' };
  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <div class="save-step">08 / 11 &mdash; go flex it</div>

    <div class="share-layout">
      <div class="share-copy">
        <h1>Your memory is ready to<br />haunt everyone's feed.</h1>
        <p>Flex your nostalgia. Main character energy encouraged. Bonus points if someone comments "wait I remember this too."</p>
        <div class="share-icons">
          <span>Link</span><span>IG</span><span>X</span><span>WA</span><span>FB</span>
        </div>
        <div class="save-actions" style="position:static;transform:none;justify-content:flex-start;">
          <button class="btn btn-outline" id="share-another">MAKE ANOTHER</button>
          <button class="btn btn-accent" id="share-viewmap">VIEW ON MAP &rarr;</button>
        </div>
      </div>

      <div class="share-card">
        <div class="share-kicker">WHAT DID YOUR CHILDHOOD SOUND LIKE?</div>
        <div class="share-title">${memory.title}</div>
        <div class="share-sub">&#128205; St. Mary's School</div>
        <div class="share-art"></div>
        <div class="share-listen">&#9658; Listen to my memory</div>
        <div class="share-cta">Remember something from this place? &rarr;</div>
      </div>
    </div>
  `;

  el.querySelector('#share-another').addEventListener('click', () => navigate('mixer'));
  el.querySelector('#share-viewmap').addEventListener('click', () => navigate('exploremap'));
}

return { render };
})();
