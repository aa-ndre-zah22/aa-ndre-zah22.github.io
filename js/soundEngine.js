// Real Web Audio mixing engine, playing real recorded loops from assets/sounds/.
// Each active sound gets its own GainNode (for the per-sound volume slider),
// all routed into one masterGain (for global play/pause).

window.SoundEngine = (function () {

let ctx = null;
let masterGain = null;
let playing = false;
const active = {}; // id -> { gain: GainNode, source: AudioBufferSourceNode|null }
const bufferCache = {}; // id -> Promise<AudioBuffer>

const SOUND_FILES = {
  pinwheel: 'assets/sounds/pinwheel.wav',
  phone:    'assets/sounds/phone.mp3',
  tv:       'assets/sounds/tv.wav',
  cloud:    'assets/sounds/cloud.mp3',
  bell:     'assets/sounds/bell.mp3',
  bird:     'assets/sounds/bird.wav',
  cup:      'assets/sounds/cup.mp3',
  bus:      'assets/sounds/bus.wav',
  cricket:  'assets/sounds/cricket.mp3',
  popper:   'assets/sounds/popper.wav',
};

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

function loadBuffer(c, id) {
  if (bufferCache[id]) return bufferCache[id];
  const url = SOUND_FILES[id];
  bufferCache[id] = fetch(url)
    .then((r) => r.arrayBuffer())
    .then((data) => c.decodeAudioData(data))
    .catch((err) => {
      console.warn('Could not load sound "' + id + '":', err.message);
      delete bufferCache[id];
      throw err;
    });
  return bufferCache[id];
}

function startSource(c, id, entry) {
  loadBuffer(c, id).then((buffer) => {
    // The sound may have been removed or paused while the file was loading.
    if (!active[id] || !playing) return;
    const src = c.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(entry.gain);
    src.start();
    entry.source = src;
  }).catch(() => {});
}

function addSound(id, volumePercent) {
  const c = getCtx();
  if (active[id]) return;
  const gain = c.createGain();
  gain.gain.value = (volumePercent || 60) / 100;
  gain.connect(masterGain);
  active[id] = { gain, source: null };
  if (playing) startSource(c, id, active[id]);
}

function removeSound(id) {
  const entry = active[id];
  if (!entry) return;
  if (entry.source) { try { entry.source.stop(); } catch (e) {} }
  entry.gain.disconnect();
  delete active[id];
}

function setVolume(id, percent) {
  const entry = active[id];
  if (!entry) return;
  entry.gain.gain.value = percent / 100;
}

function play() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
  playing = true;
  Object.keys(active).forEach((id) => {
    const entry = active[id];
    if (!entry.source) startSource(c, id, entry);
  });
}

function pause() {
  playing = false;
  Object.keys(active).forEach((id) => {
    const entry = active[id];
    if (entry.source) { try { entry.source.stop(); } catch (e) {} }
    entry.source = null;
  });
}

function isPlaying() { return playing; }

return { addSound, removeSound, setVolume, play, pause, isPlaying };
})();
