// Lightweight sound-effect synth for UI feedback (tap clicks, etc).
// This is a placeholder until real recorded sound effects are dropped in —
// swap playTapSound/playStaticBurst for real <audio> playback once files exist.

window.RingAudio = (function () {

let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function playTapSound() {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(220, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(660, c.currentTime + 0.06);
  gain.gain.setValueAtTime(0.15, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.12);
}

function playStaticBurst() {
  const c = getCtx();
  const bufferSize = c.sampleRate * 0.15;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.25, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
  noise.connect(gain).connect(c.destination);
  noise.start();
}

function playChime() {
  const c = getCtx();
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = c.currentTime + i * 0.08;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + 0.5);
  });
}

// Low impact "thud" + rising whoosh + bright landing chord — a startled
// sting for the logo reveal, distinct from the gentler playChime above.
function playSurpriseTone() {
  const c = getCtx();

  const thump = c.createOscillator();
  const thumpGain = c.createGain();
  thump.type = 'square';
  thump.frequency.setValueAtTime(90, c.currentTime);
  thump.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.08);
  thumpGain.gain.setValueAtTime(0.3, c.currentTime);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.09);
  thump.connect(thumpGain).connect(c.destination);
  thump.start();
  thump.stop(c.currentTime + 0.09);

  const sweep = c.createOscillator();
  const sweepGain = c.createGain();
  sweep.type = 'sawtooth';
  sweep.frequency.setValueAtTime(280, c.currentTime + 0.05);
  sweep.frequency.exponentialRampToValueAtTime(1500, c.currentTime + 0.26);
  sweepGain.gain.setValueAtTime(0, c.currentTime + 0.05);
  sweepGain.gain.linearRampToValueAtTime(0.16, c.currentTime + 0.12);
  sweepGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  sweep.connect(sweepGain).connect(c.destination);
  sweep.start(c.currentTime + 0.05);
  sweep.stop(c.currentTime + 0.3);

  [659.25, 830.61, 987.77].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const start = c.currentTime + 0.28 + i * 0.02;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + 0.6);
  });
}

// Looping TV grain/hiss, meant to run under the static visual while the
// screen waits for taps. Call stopGrainNoise() to fade it out.
let grainSource = null;
let grainGain = null;

function startGrainNoise() {
  if (grainSource) return;
  const c = getCtx();
  const bufferSize = c.sampleRate * 2;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = c.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3000;
  filter.Q.value = 0.4;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.4);

  noise.connect(filter).connect(gain).connect(c.destination);
  noise.start();

  grainSource = noise;
  grainGain = gain;
}

function stopGrainNoise() {
  if (!grainSource) return;
  const c = getCtx();
  const src = grainSource;
  const gain = grainGain;
  gain.gain.cancelScheduledValues(c.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, c.currentTime);
  gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.25);
  setTimeout(() => { try { src.stop(); } catch (e) {} }, 300);
  grainSource = null;
  grainGain = null;
}

return { playTapSound, playStaticBurst, playChime, playSurpriseTone, startGrainNoise, stopGrainNoise };
})();
