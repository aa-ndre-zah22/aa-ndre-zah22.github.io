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

return { playTapSound, playStaticBurst, playChime };
})();
