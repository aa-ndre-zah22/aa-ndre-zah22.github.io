window.Screens = window.Screens || {};
window.Screens.exploremap = (function () {

function render(el, navigate) {
  el.innerHTML = `
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <div id="explore-map-el" style="position:absolute;inset:0;"></div>
    <div class="explore-filters">
      <span class="explore-filter explore-filter-active">All</span>
      <span class="explore-filter">Schools</span>
      <span class="explore-filter">Homes</span>
      <span class="explore-filter">Playgrounds</span>
      <span class="explore-filter">Sounds</span>
    </div>
    <div class="map-search" style="top:24px;left:56px;right:56px;">
      <span>&#128269;</span> Pick a place. Any place. We won't judge your search history.
    </div>
  `;

  const map = L.map('explore-map-el', { zoomControl: true, attributionControl: false })
    .setView([22.5, 78.9], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    subdomains: 'abc', maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

  // A fixed timeout can't cover every case (window resizes, orientation
  // changes, or the container settling its layout at a different moment
  // than expected) — watch the container itself and re-measure whenever
  // its real rendered size changes.
  const resizeObserver = new ResizeObserver(() => map.invalidateSize());
  resizeObserver.observe(document.getElementById('explore-map-el'));

  const pinIcon = L.divIcon({
    className: 'pin-drop-icon',
    html: '&#128205;',
    iconSize: [40, 40],
    iconAnchor: [20, 38],
  });

  window.db.collection('memories').limit(200).get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (typeof data.lat !== 'number' || typeof data.lng !== 'number') return;
        L.marker([data.lat, data.lng], { icon: pinIcon }).addTo(map).on('click', () => {
          window.AppState.savedMemory = Object.assign({ id: doc.id }, data);
          navigate('memorypin');
        });
      });
    })
    .catch((err) => {
      console.warn('Could not load pinned memories from Firestore:', err.message);
    });
}

return { render };
})();
