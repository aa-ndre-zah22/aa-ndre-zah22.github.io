window.Screens = window.Screens || {};
window.Screens.search = (function () {

const RESULTS = [
  { title: 'Rainy Days at School', meta: 'Ann · St. Mary\'s School, Kochi' },
  { title: 'Bell for Games Period', meta: 'Dev · St. Mary\'s School, Kochi' },
  { title: 'The Old Assembly', meta: 'Meera · St. Mary\'s School, Kochi' },
];

function render(el, navigate) {
  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <div class="search-bar">
      <span>&#128269;</span>
      <input id="search-input" placeholder="school bell" />
    </div>
    <div class="search-tabs">
      <span class="explore-filter explore-filter-active">Memories (${RESULTS.length})</span>
      <span class="explore-filter">Places (3)</span>
      <span class="explore-filter">Sounds (1)</span>
      <span class="explore-filter">People (6)</span>
    </div>
    <div class="search-results" id="search-results"></div>
  `;

  const list = el.querySelector('#search-results');
  RESULTS.forEach((r) => {
    const row = document.createElement('div');
    row.className = 'search-row';
    row.innerHTML = `
      <span class="save-preview-dot" style="width:34px;height:34px;"></span>
      <div class="search-row-text">
        <div class="search-row-title">${r.title}</div>
        <div class="search-row-meta">${r.meta}</div>
      </div>
    `;
    row.addEventListener('click', () => navigate('memorypin'));
    list.appendChild(row);
  });
}

return { render };
})();
