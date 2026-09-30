// Tiny shared app state so the mix built on the Mixer screen survives
// navigating to Listen, Draw, Save, etc. Not persisted to disk — resets on reload.
window.AppState = window.AppState || {
  mix: {}, // sound id -> volume percent
  user: null, // set by the onAuthStateChanged listener below once Firebase resolves
};

window.auth.onAuthStateChanged(function (user) {
  window.AppState.user = user;
});
