window.Screens = window.Screens || {};
window.Screens.save = (function () {

function render(el, navigate) {
  const mixIds = Object.keys(window.AppState.mix);
  const tagWords = mixIds.map((id) => '#' + id).join(' ');

  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <div class="save-layout">
      <div class="save-preview">
        <div class="save-preview-art"></div>
        <div class="save-preview-row">
          <span class="save-preview-dot"></span>
          <span class="save-preview-title" id="preview-title">Rainy Days at School</span>
        </div>
        <div class="save-preview-meta">${mixIds.length ? mixIds.join(' · ') : 'no sounds in this mix yet'}</div>
        <div class="save-preview-tags" id="preview-tags"></div>
      </div>

      <div class="save-form">
        <label class="save-label">GIVE IT A NAME</label>
        <input class="save-input" id="save-name" value="Rainy Days at School" maxlength="40" />

        <label class="save-label">TELL US ABOUT IT (OR DON'T)</label>
        <textarea class="save-input save-textarea" id="save-note" maxlength="180">The sound of rain, the school bell, and everyone sprinting for the bus like it owed them money.</textarea>

        <label class="save-label">TAG IT (#nostalgia is implied)</label>
        <input class="save-input" id="save-tags" value="${tagWords || '#school #rain #friends'}" />
      </div>
    </div>

    <div class="save-actions">
      <button class="btn btn-outline" id="save-back">KEEP EDITING</button>
      <button class="btn btn-primary" id="save-seal">SEAL IT IN THE VAULT &rarr;</button>
    </div>
  `;

  const nameInput = el.querySelector('#save-name');
  const tagsInput = el.querySelector('#save-tags');
  const previewTitle = el.querySelector('#preview-title');
  const previewTags = el.querySelector('#preview-tags');

  function renderTags() {
    previewTags.innerHTML = tagsInput.value.split(/\s+/).filter(Boolean)
      .map((t) => `<span class="save-tag">${t.replace(/^#?/, '#')}</span>`).join('');
  }
  nameInput.addEventListener('input', () => { previewTitle.textContent = nameInput.value || 'Untitled Memory'; });
  tagsInput.addEventListener('input', renderTags);
  renderTags();

  el.querySelector('#save-back').addEventListener('click', () => navigate('draw'));
  el.querySelector('#save-seal').addEventListener('click', () => {
    window.AppState.savedMemory = {
      title: nameInput.value,
      note: el.querySelector('#save-note').value,
      tags: tagsInput.value,
    };
    navigate('pinmap');
  });
}

return { render };
})();
