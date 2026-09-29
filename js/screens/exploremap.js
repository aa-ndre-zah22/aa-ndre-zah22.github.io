window.Screens = window.Screens || {};
window.Screens.exploremap = (function () {

const CITIES = [
  { name: 'Mumbai', count: 120, size: 76, color: '#F47B35', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', count: 84, size: 66, color: '#FFD23F', lat: 28.7041, lng: 77.1025 },
  { name: 'Bengaluru', count: 62, size: 56, color: '#3D7EFF', lat: 12.9716, lng: 77.5946 },
  { name: 'Kochi', count: 37, size: 44, color: '#FFF3D6', lat: 9.9312, lng: 76.2673 },
];

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
    <div class="save-step" style="bottom:24px;top:auto;">09 / 11 &mdash; explore the map</div>
  `;

  const map = L.map('explore-map-el', { zoomControl: true, attributionControl: false })
    .setView([22.5, 78.9], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    subdomains: 'abc', maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

  // Container isn't at its final layout size the instant L.map() runs (screen
  // transition/flex layout settles a frame or two later), so Leaflet's first
  // size read is stale. Re-measure once layout has caught up.
  requestAnimationFrame(() => map.invalidateSize());
  setTimeout(() => map.invalidateSize(), 300);

  CITIES.forEach((c) => {
    const icon = L.divIcon({
      className: 'explore-city-icon',
      html: `
        <div class="explore-city-bubble" style="width:${c.size}px;height:${c.size}px;background:${c.color};">${c.count}</div>
        <div class="explore-city-name">${c.name}</div>
      `,
      iconSize: [c.size, c.size + 24],
      iconAnchor: [c.size / 2, c.size / 2],
    });
    L.marker([c.lat, c.lng], { icon }).addTo(map).on('click', () => navigate('memorypin'));
  });
}

return { render };
})();
