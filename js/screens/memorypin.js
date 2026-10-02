window.Screens = window.Screens || {};
window.Screens.memorypin = (function () {

function render(el, navigate) {
  const memory = window.AppState.savedMemory || { title: 'Rainy Days at School' };
  const hasLocation = typeof memory.lat === 'number' && typeof memory.lng === 'number';
  const lat = hasLocation ? memory.lat : 9.9312;
  const lng = hasLocation ? memory.lng : 76.2673;

  el.innerHTML = `
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <div class="map-canvas map-canvas-plain">
      <div id="memorypin-map-el" style="position:absolute;inset:0;"></div>
      <div class="map-popup">
        <div class="map-popup-row">
          <span class="map-popup-dot"></span>
          <div>
            <div class="map-popup-title">${memory.title}</div>
            <div class="map-popup-sub">&#128205; ${memory.placeSub || memory.placeName || 'Unknown location'}</div>
          </div>
        </div>
        <p class="map-popup-body">by Ann &middot; just now &middot; ${memory.note || 'a new memory, freshly pinned.'}</p>
        <div class="map-popup-drawing" id="popup-drawing-wrap" style="display:none;">
          <img id="popup-drawing-img" alt="Drawing of this memory" style="width:100%;border-radius:8px;display:block;" />
        </div>
        <div class="map-popup-comments" id="popup-comments"></div>
        <button class="btn btn-primary map-popup-btn" id="popup-remember">&#10084; I REMEMBER THIS TOO</button>
      </div>
    </div>
    <div class="save-actions" style="bottom:30px;">
      <button class="btn btn-outline" id="popup-explore">EXPLORE THE MAP &rarr;</button>
      <button class="btn btn-accent" id="popup-share">SHARE THIS MEMORY &rarr;</button>
    </div>
  `;

  const map = L.map('memorypin-map-el', { zoomControl: true, attributionControl: false })
    .setView([lat, lng], hasLocation ? 15 : 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    subdomains: 'abc', maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(map);
  L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

  const pinIcon = L.divIcon({
    className: 'pin-drop-icon',
    html: '&#128205;',
    iconSize: [40, 40],
    iconAnchor: [20, 38],
  });
  L.marker([lat, lng], { icon: pinIcon }).addTo(map);

  const resizeObserver = new ResizeObserver(() => map.invalidateSize());
  resizeObserver.observe(document.getElementById('memorypin-map-el'));

  el.querySelector('#popup-explore').addEventListener('click', () => navigate('exploremap'));
  el.querySelector('#popup-share').addEventListener('click', () => navigate('share'));

  const rememberBtn = el.querySelector('#popup-remember');
  if (!memory.id) {
    rememberBtn.disabled = true;
    rememberBtn.title = 'This memory isn\'t saved yet.';
  } else {
    rememberBtn.addEventListener('click', () => {
      window.AppState.remixMemoryId = memory.id;
      navigate('draw');
    });

    const drawingWrap = el.querySelector('#popup-drawing-wrap');
    const drawingImg = el.querySelector('#popup-drawing-img');
    window.db.collection('memories').doc(memory.id).collection('drawings')
      .orderBy('createdAt', 'desc').limit(1).get()
      .then((snap) => {
        if (!snap.empty) {
          drawingImg.src = snap.docs[0].data().dataUrl;
          drawingWrap.style.display = 'block';
        }
      })
      .catch(() => {});

    const commentsBox = el.querySelector('#popup-comments');
    window.db.collection('memories').doc(memory.id).collection('comments')
      .orderBy('createdAt', 'asc').limit(20).get()
      .then((snap) => {
        if (snap.empty) return;
        commentsBox.innerHTML = snap.docs.map((d) => {
          const c = d.data();
          const who = (c.authorEmail || 'someone').split('@')[0];
          return `<p class="map-popup-comment"><strong>${who}</strong> ${c.text || ''}</p>`;
        }).join('');
      })
      .catch(() => {});
  }
}

// Re-entering after a remix (new drawing layer / comment) needs a full
// rebuild to show the update — see the matching note in draw.js.
function onEnter(el, navigate) {
  if (el._enteredBefore) {
    render(el, navigate);
  } else {
    el._enteredBefore = true;
  }
}

return { render, onEnter };
})();
