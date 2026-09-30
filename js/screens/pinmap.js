window.Screens = window.Screens || {};
window.Screens.pinmap = (function () {

function render(el, navigate) {
  el.innerHTML = `
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <h1 class="draw-title">Where did this happen?</h1>
    <p class="draw-sub">X marks the spot. Literally.</p>

    <div class="map-canvas" style="cursor:default;">
      <div id="pin-map-el" style="position:absolute;inset:0;border-radius:14px;overflow:hidden;"></div>
      <input id="pin-search-input" class="map-search-input" placeholder="Search for a school, park, street, or city..." autocomplete="off" />
      <div class="pin-search-results" id="pin-search-results"></div>
      <div class="map-place-card" id="pin-place-card">
        <div class="map-place-name" id="pin-place-name">St. Mary's School</div>
        <div class="map-place-sub" id="pin-place-sub">Kochi, India</div>
      </div>
      <button class="btn btn-accent map-pin-btn" id="map-pin-confirm">PIN MEMORY &rarr;</button>
    </div>
  `;

  const start = { lat: 9.9312, lng: 76.2673 }; // Kochi, as a sensible default
  const map = L.map('pin-map-el', { zoomControl: true, attributionControl: false }).setView([start.lat, start.lng], 13);
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
  resizeObserver.observe(document.getElementById('pin-map-el'));

  const pinIcon = L.divIcon({
    className: 'pin-drop-icon',
    html: '&#128205;',
    iconSize: [40, 40],
    iconAnchor: [20, 38],
  });
  const marker = L.marker([start.lat, start.lng], { icon: pinIcon, draggable: true }).addTo(map);

  const placeCard = el.querySelector('#pin-place-card');
  const placeName = el.querySelector('#pin-place-name');
  const placeSub = el.querySelector('#pin-place-sub');

  function reverseGeocode(latlng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`, {
      headers: { 'Accept-Language': 'en' },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data || !data.address) return;
        const a = data.address;
        placeName.textContent = a.amenity || a.building || a.road || a.suburb || 'Dropped pin';
        placeSub.textContent = [a.suburb, a.city || a.town || a.village, a.state].filter(Boolean).join(', ') || data.display_name;
        placeCard.style.display = 'block';
      })
      .catch(() => {});
  }

  map.on('click', (e) => { marker.setLatLng(e.latlng); reverseGeocode(e.latlng); });
  marker.on('dragend', () => reverseGeocode(marker.getLatLng()));

  const searchInput = el.querySelector('#pin-search-input');
  const resultsBox = el.querySelector('#pin-search-results');
  let searchTimer = null;

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = searchInput.value.trim();
    if (q.length < 3) { resultsBox.innerHTML = ''; return; }
    searchTimer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`, {
        headers: { 'Accept-Language': 'en' },
      })
        .then((r) => r.json())
        .then((results) => {
          resultsBox.innerHTML = '';
          results.forEach((r) => {
            const row = document.createElement('div');
            row.className = 'pin-search-row';
            row.textContent = r.display_name;
            row.addEventListener('click', () => {
              const latlng = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
              map.setView(latlng, 15);
              marker.setLatLng(latlng);
              placeName.textContent = r.display_name.split(',')[0];
              placeSub.textContent = r.display_name;
              placeCard.style.display = 'block';
              resultsBox.innerHTML = '';
              searchInput.value = r.display_name;
            });
            resultsBox.appendChild(row);
          });
        })
        .catch(() => {});
    }, 400);
  });

  const confirmBtn = el.querySelector('#map-pin-confirm');
  confirmBtn.addEventListener('click', () => {
    const latlng = marker.getLatLng();
    const memory = Object.assign({}, window.AppState.savedMemory, {
      placeName: placeName.textContent,
      placeSub: placeSub.textContent,
      lat: latlng.lat,
      lng: latlng.lng,
      authorEmail: (window.AppState.user && window.AppState.user.email) || 'anonymous',
    });

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Pinning...';

    window.db.collection('memories').add(Object.assign({}, memory, {
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }))
      .then((docRef) => {
        memory.id = docRef.id;
        window.AppState.savedMemory = memory;
        navigate('memorypin');
      })
      .catch((err) => {
        console.warn('Could not save memory to Firestore:', err.message);
        // Still let the user see their own pin locally even if the write failed
        // (e.g. offline, or Firestore rules not yet configured for this project).
        window.AppState.savedMemory = memory;
        navigate('memorypin');
      });
  });
}

return { render };
})();
