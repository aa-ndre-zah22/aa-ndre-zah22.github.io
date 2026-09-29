window.Screens = window.Screens || {};
window.Screens.memorypin = (function () {

function render(el, navigate) {
  const memory = window.AppState.savedMemory || { title: 'Rainy Days at School' };
  el.innerHTML = `
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <div class="map-canvas map-canvas-plain">
      <div class="map-land"></div>
      <div class="map-pin map-pin-static">&#128205;</div>
      <div class="map-popup">
        <div class="map-popup-row">
          <span class="map-popup-dot"></span>
          <div>
            <div class="map-popup-title">${memory.title}</div>
            <div class="map-popup-sub">&#128205; St. Mary's School, Kochi</div>
          </div>
        </div>
        <p class="map-popup-body">by Ann &middot; just now &middot; ${memory.note || 'a new memory, freshly pinned.'}</p>
        <button class="btn btn-primary map-popup-btn" id="popup-remember">&#10084; I REMEMBER THIS TOO</button>
      </div>
    </div>
    <div class="save-actions" style="bottom:30px;">
      <button class="btn btn-outline" id="popup-explore">EXPLORE THE MAP &rarr;</button>
      <button class="btn btn-accent" id="popup-share">SHARE THIS MEMORY &rarr;</button>
    </div>
  `;
  el.querySelector('#popup-explore').addEventListener('click', () => navigate('exploremap'));
  el.querySelector('#popup-share').addEventListener('click', () => navigate('share'));
}

return { render };
})();
