window.Screens = window.Screens || {};
window.Screens.draw = (function () {

const COLORS = ['#382A26', '#3D7EFF', '#F47B35', '#7657C8'];
const CANVAS_W = 620, CANVAS_H = 460;

function render(el, navigate) {
  el.innerHTML = `
    <img class="backdrop" src="assets/backdrop.svg" alt="" />
    <img class="nav-logo" src="assets/logo.svg" alt="Ring a Bell" />
    <div class="draw-step">04 / 11 &mdash; draw &amp; decorate</div>

    <h1 class="draw-title">Now... what does that sound look like?</h1>
    <p class="draw-sub">Draw it, sticker it, scribble on it. Stick figures encouraged. We don't grade this.</p>

    <div class="draw-layout">
      <div class="draw-tools">
        <button class="draw-tool draw-tool-active" data-tool="pencil" title="Pencil">&#9998;</button>
        <button class="draw-tool" data-tool="brush" title="Brush">&#128396;</button>
        <button class="draw-tool" data-tool="eraser" title="Eraser">&#9003;</button>
        <div class="draw-swatches">
          ${COLORS.map((c, i) => `<span class="draw-swatch${i === 0 ? ' draw-swatch-active' : ''}" data-color="${c}" style="background:${c}"></span>`).join('')}
        </div>
        <button class="draw-tool draw-tool-small" id="draw-undo" title="Undo">UNDO</button>
        <button class="draw-tool draw-tool-small" id="draw-redo" title="Redo">REDO</button>
      </div>

      <div class="draw-canvas-wrap" style="width:${CANVAS_W}px;height:${CANVAS_H}px;">
        <canvas id="draw-canvas" width="${CANVAS_W}" height="${CANVAS_H}"></canvas>
        <div class="draw-overlay" id="draw-overlay"></div>
      </div>

      <div class="draw-side">
        <div class="draw-side-label">STICKERS</div>
        <div class="draw-stickers" id="draw-stickers"></div>
        <div class="draw-side-label">WRITE A LINE</div>
        <input type="text" id="draw-line-input" class="draw-line-input" placeholder="tap to scribble a memory..." maxlength="60" />
      </div>
    </div>

    <div class="draw-actions">
      <button class="btn btn-outline" id="draw-clear">CLEAR PAGE</button>
      <button class="btn btn-accent" id="draw-save">SAVE IT &rarr;</button>
    </div>
  `;

  const canvas = el.querySelector('#draw-canvas');
  const ctx = canvas.getContext('2d');
  const overlay = el.querySelector('#draw-overlay');
  ctx.fillStyle = '#FFF3D6';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let tool = 'pencil';
  let color = COLORS[0];
  let drawing = false;
  let history = [ctx.getImageData(0, 0, CANVAS_W, CANVAS_H)];
  let historyIndex = 0;

  function pushHistory() {
    history = history.slice(0, historyIndex + 1);
    history.push(ctx.getImageData(0, 0, CANVAS_W, CANVAS_H));
    historyIndex = history.length - 1;
  }

  function restoreHistory() {
    ctx.putImageData(history[historyIndex], 0, 0);
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.strokeStyle = tool === 'eraser' ? '#FFF3D6' : color;
    ctx.lineWidth = tool === 'brush' ? 14 : tool === 'eraser' ? 24 : 3;
    ctx.globalAlpha = tool === 'brush' ? 0.85 : 1;
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  window.addEventListener('mouseup', () => {
    if (drawing) { drawing = false; ctx.globalAlpha = 1; pushHistory(); }
  });

  el.querySelectorAll('.draw-tool[data-tool]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tool = btn.dataset.tool;
      el.querySelectorAll('.draw-tool[data-tool]').forEach((b) => b.classList.remove('draw-tool-active'));
      btn.classList.add('draw-tool-active');
    });
  });
  el.querySelectorAll('.draw-swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
      color = sw.dataset.color;
      el.querySelectorAll('.draw-swatch').forEach((s) => s.classList.remove('draw-swatch-active'));
      sw.classList.add('draw-swatch-active');
    });
  });

  el.querySelector('#draw-undo').addEventListener('click', () => {
    if (historyIndex > 0) { historyIndex--; restoreHistory(); }
  });
  el.querySelector('#draw-redo').addEventListener('click', () => {
    if (historyIndex < history.length - 1) { historyIndex++; restoreHistory(); }
  });
  el.querySelector('#draw-clear').addEventListener('click', () => {
    ctx.fillStyle = '#FFF3D6';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    pushHistory();
    overlay.innerHTML = '';
  });

  // stickers — draggable, from the same 10-icon set
  const stickerRow = el.querySelector('#draw-stickers');
  window.SOUNDS.forEach((s) => {
    const btn = document.createElement('button');
    btn.className = 'draw-sticker-src';
    btn.innerHTML = `<img src="assets/${s.file}" alt="${s.name}" />`;
    btn.title = 'Add ' + s.name;
    btn.addEventListener('click', () => addSticker(s.file));
    stickerRow.appendChild(btn);
  });

  function addSticker(file) {
    const img = document.createElement('img');
    img.src = 'assets/' + file;
    img.className = 'draw-placed-sticker';
    img.style.left = (40 + Math.random() * (CANVAS_W - 120)) + 'px';
    img.style.top = (30 + Math.random() * (CANVAS_H - 120)) + 'px';
    makeDraggable(img);
    overlay.appendChild(img);
  }

  function makeDraggable(node) {
    let sx, sy, ox, oy, dragging = false;
    node.addEventListener('mousedown', (e) => {
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(node.style.left); oy = parseFloat(node.style.top);
      node.classList.add('draw-sticker-dragging');
      e.stopPropagation();
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      node.style.left = (ox + e.clientX - sx) + 'px';
      node.style.top = (oy + e.clientY - sy) + 'px';
    });
    window.addEventListener('mouseup', () => {
      if (dragging) { dragging = false; node.classList.remove('draw-sticker-dragging'); }
    });
    node.addEventListener('dblclick', () => node.remove());
  }

  const lineInput = el.querySelector('#draw-line-input');
  lineInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && lineInput.value.trim()) {
      const note = document.createElement('div');
      note.className = 'draw-placed-note';
      note.textContent = lineInput.value.trim();
      note.style.left = (60 + Math.random() * 200) + 'px';
      note.style.top = (CANVAS_H - 80 - Math.random() * 60) + 'px';
      makeDraggable(note);
      overlay.appendChild(note);
      lineInput.value = '';
    }
  });

  el.querySelector('#draw-save').addEventListener('click', () => navigate('save'));
}

return { render };
})();
