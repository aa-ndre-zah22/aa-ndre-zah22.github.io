// Real Web Audio mixing engine. No recorded sound files exist yet, so each
// sound is a small procedurally-generated loop standing in for the real
// recording — swap `makeSource()`'s buffer/oscillator per sound id for a
// loaded <AudioBufferSourceNode> from a real file later; everything else
// (per-sound gain, master play/pause, volume sliders) stays the same.

window.SoundEngine = (function () {

let ctx = null;
let masterGain = null;
let playing = false;
const active = {}; // id -> { nodes: [...], gain: GainNode }

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

function noiseBuffer(c, seconds) {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

// sound "recipes" — a rough sonic sketch per icon, until real audio lands
const RECIPES = {
  pinwheel:  { type: 'wind' },
  phone:     { type: 'pulse', freq: 950, on: 0.15, off: 0.55 },
  tv:        { type: 'noise-filtered', cutoff: 3200 },
  cloud:     { type: 'wind', cutoff: 1800 },
  bell:      { type: 'bell', freq: 880 },
  bird:      { type: 'chirp' },
  cup:       { type: 'crackle' },
  bus:       { type: 'rumble', freq: 70 },
  cricket:   { type: 'pulse', freq: 4200, on: 0.05, off: 0.18 },
  popper:    { type: 'pop' },
};

function buildGraph(c, recipe, out) {
  const nodes = [];
  if (recipe.type === 'wind' || recipe.type === 'noise-filtered') {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 2);
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = recipe.cutoff || 900;
    src.connect(filter).connect(out);
    src.start();
    nodes.push(src);
  } else if (recipe.type === 'rumble') {
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = recipe.freq;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 220;
    osc.connect(filter).connect(out);
    osc.start();
    nodes.push(osc);
  } else if (recipe.type === 'bell') {
    const loop = () => {
      if (!active[recipe._id]) return;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'triangle';
      osc.frequency.value = recipe.freq;
      g.gain.setValueAtTime(0.5, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.1);
      osc.connect(g).connect(out);
      osc.start();
      osc.stop(c.currentTime + 1.1);
      recipe._timer = setTimeout(loop, 1800);
    };
    recipe._loopFn = loop;
    loop();
  } else if (recipe.type === 'pulse') {
    const loop = () => {
      if (!active[recipe._id]) return;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = recipe.freq;
      g.gain.setValueAtTime(0.4, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + recipe.on);
      osc.connect(g).connect(out);
      osc.start();
      osc.stop(c.currentTime + recipe.on);
      recipe._timer = setTimeout(loop, (recipe.on + recipe.off) * 1000);
    };
    recipe._loopFn = loop;
    loop();
  } else if (recipe.type === 'chirp') {
    const loop = () => {
      if (!active[recipe._id]) return;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      const base = 1800 + Math.random() * 900;
      osc.frequency.setValueAtTime(base, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(base * 1.4, c.currentTime + 0.08);
      g.gain.setValueAtTime(0.25, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
      osc.connect(g).connect(out);
      osc.start();
      osc.stop(c.currentTime + 0.12);
      recipe._timer = setTimeout(loop, 400 + Math.random() * 900);
    };
    recipe._loopFn = loop;
    loop();
  } else if (recipe.type === 'crackle' || recipe.type === 'pop') {
    const loop = () => {
      if (!active[recipe._id]) return;
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c, 0.06);
      const g = c.createGain();
      g.gain.setValueAtTime(0.3, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
      src.connect(g).connect(out);
      src.start();
      recipe._timer = setTimeout(loop, recipe.type === 'pop' ? 1200 + Math.random() * 1500 : 150 + Math.random() * 250);
    };
    recipe._loopFn = loop;
    loop();
  }
  return nodes;
}

function addSound(id, volumePercent) {
  const c = getCtx();
  if (active[id]) return;
  const gain = c.createGain();
  gain.gain.value = (volumePercent || 60) / 100;
  gain.connect(masterGain);
  const recipe = Object.assign({ _id: id }, RECIPES[id] || { type: 'wind' });
  active[id] = { gain, recipe, nodes: [] };
  if (playing) active[id].nodes = buildGraph(c, recipe, gain);
}

function removeSound(id) {
  const entry = active[id];
  if (!entry) return;
  if (entry.recipe._timer) clearTimeout(entry.recipe._timer);
  entry.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
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
    entry.nodes = buildGraph(c, entry.recipe, entry.gain);
  });
}

function pause() {
  playing = false;
  Object.keys(active).forEach((id) => {
    const entry = active[id];
    if (entry.recipe._timer) clearTimeout(entry.recipe._timer);
    entry.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
    entry.nodes = [];
  });
}

function isPlaying() { return playing; }

return { addSound, removeSound, setVolume, play, pause, isPlaying };
})();
