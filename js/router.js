window.Router = (function () {

const screens = new Map();
let current = null;

function registerScreen(name, mod) {
  screens.set(name, mod);
}

function navigate(name) {
  const app = document.getElementById('app');
  const next = screens.get(name);
  if (!next) {
    console.warn('No screen registered for "' + name + '"');
    return;
  }
  if (current && current.name === name) return; // already on this screen
  if (current && current.el) {
    current.el.classList.remove('active');
    if (current.mod.onExit) current.mod.onExit(current.el);
  }
  let el = document.getElementById('screen-' + name);
  const isNew = !el;
  if (isNew) {
    el = document.createElement('div');
    el.id = 'screen-' + name;
    el.className = 'screen';
    app.appendChild(el);
  }
  // mark active (visible) BEFORE render() runs, so anything that measures
  // the container's size (e.g. Leaflet maps) doesn't see a display:none 0x0 box.
  el.classList.add('active');
  if (isNew) next.render(el, navigate);
  if (next.onEnter) next.onEnter(el, navigate);
  current = { el, mod: next, name };
  // pushState (not location.hash=) so the URL updates without re-firing hashchange
  // and re-entering navigate() for the screen we're already on.
  history.pushState(null, '', '#' + name);
}

window.addEventListener('popstate', () => {
  const name = window.location.hash.replace('#', '');
  if (name && screens.has(name) && (!current || current.name !== name)) navigate(name);
});

return { registerScreen, navigate };
})();
