window.Screens = window.Screens || {};
window.Screens.profile = (function () {

const MEMORIES = ['Rainy Days', 'Lunch Chaos', 'Old Assembly', 'Marbles', 'Library Hush'];

function render(el, navigate) {
  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <div class="profile-header">
      <div class="profile-avatar"></div>
      <div>
        <div class="profile-name">Ann</div>
        <div class="profile-bio">professional rememberer of things that no longer exist</div>
      </div>
      <div class="profile-stats">
        <div><b>12</b><span>MEMORIES</span></div>
        <div><b>4</b><span>PLACES</span></div>
        <div><b>28</b><span>SAVED</span></div>
      </div>
    </div>

    <div class="search-tabs" style="top:220px;">
      <span class="explore-filter explore-filter-active">My Memories</span>
      <span class="explore-filter">Saved</span>
      <span class="explore-filter">Places Remembered</span>
    </div>

    <div class="profile-grid" id="profile-grid"></div>

    <button class="btn btn-accent" id="profile-new" style="position:absolute;bottom:40px;left:56px;">+ NEW MEMORY</button>
  `;

  const grid = el.querySelector('#profile-grid');
  MEMORIES.forEach((m) => {
    const tile = document.createElement('div');
    tile.className = 'profile-tile';
    tile.innerHTML = `<span class="save-preview-dot"></span><div>${m}</div>`;
    tile.addEventListener('click', () => navigate('memorypin'));
    grid.appendChild(tile);
  });

  el.querySelector('#profile-new').addEventListener('click', () => navigate('mixer'));
}

return { render };
})();
