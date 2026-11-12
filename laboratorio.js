const byId = id => document.getElementById(id);
const coefficients = ['a', 'b', 'c'].map(byId);
const storageKey = 'rai-universo-2d-v1';
const views = ['inicio', 'grafico', 'dna', 'formas'];
const canvas = byId('plot');
const ctx = canvas.getContext('2d');
const formatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });
const fmt = value => formatter.format(Math.abs(value) < 1e-10 ? 0 : value);
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
let mark = saved.mark !== false;
coefficients.forEach((input, index) => {
  input.value = saved.coefficients?.[index] ?? [1, 0, -4][index];
});
let view = 'inicio';
const seed = byId('homeSeed');
const amplitude = byId('homeAmplitude');
const graphInputs = Array.from(document.querySelectorAll('[data-coefficient]'));
seed.value = saved.seed ?? seed.value;
amplitude.value = saved.amplitude ?? amplitude.value;
let validSeed = seed.value;
let validAmplitude = +amplitude.value;

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      view, mark, featuredHome: true, seed: validSeed, amplitude: validAmplitude, coefficients: coefficients.map(input => +input.value)
    }));
  } catch {}
}
function selectView(next) {
  view = views.includes(next) ? next : 'inicio';
  for (const id of views) {
    byId(id).hidden = id !== view;
    document.querySelector('[data-view="' + id + '"]').setAttribute('aria-current', String(id === view));
  }
  save();
  render();
}
function realRoots(a, b, c) {
  if (a === 0) return b === 0 ? (c === 0 ? null : []) : [-c / b];
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  if (discriminant === 0) return [-b / (2 * a)];
  const delta = Math.sqrt(discriminant);
  return [(-b - delta) / (2 * a), (-b + delta) / (2 * a)].sort((x, y) => x - y);
}
function equationText(a, b, c) {
  const terms = [[a, 'x²'], [b, 'x'], [c, '']].filter(([n]) => n !== 0);
  return 'y = ' + (terms.map(([n, symbol], index) => {
    const sign = n < 0 ? (index ? ' − ' : '−') : (index ? ' + ' : '');
    const magnitude = Math.abs(n) === 1 && symbol ? '' : fmt(Math.abs(n));
    return sign + magnitude + symbol;
  }).join('') || '0');
}
function draw(fn, roots) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const ox = w / 2, oy = h / 2;
  const step = Math.min(w / 14, h / 12);
  ctx.font = '12px system-ui';
  function line(x1, y1, x2, y2) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  ctx.strokeStyle = '#20314c';
  for (let i = -Math.floor(ox / step); i <= ox / step; i++) line(ox + i * step, 0, ox + i * step, h);
  for (let i = -Math.floor(oy / step); i <= oy / step; i++) line(0, oy + i * step, w, oy + i * step);
  ctx.strokeStyle = '#8294b2';
  line(0, oy, w, oy);
  line(ox, 0, ox, h);
  ctx.fillStyle = '#bac9df';
  for (let i = -Math.floor(ox / step); i <= ox / step; i++) {
    if (i && ox + i * step > 10 && ox + i * step < w - 15) ctx.fillText(String(i), ox + i * step - 5, oy + 15);
  }
  for (let i = -Math.floor(oy / step); i <= oy / step; i++) {
    if (i && oy - i * step > 14 && oy - i * step < h - 5) ctx.fillText(String(i), ox + 6, oy - i * step + 4);
  }
  ctx.fillText('x', w - 13, oy - 7);
  ctx.fillText('y', ox + 7, 15);
  function curve(f, color, dash) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash(dash);
    for (let px = 0; px <= w; px++) {
      const py = oy - f((px - ox) / step) * step;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
  curve(x => x * x, '#75d9ef', [6, 5]);
  curve(fn, '#f3ce84', []);
  ctx.fillStyle = '#f3ce84';
  for (const root of roots) {
    ctx.beginPath(); ctx.arc(ox + root * step, oy, 5, 0, Math.PI * 2); ctx.fill();
  }
}
function render() {
  const [a, b, c] = coefficients.map(input => +input.value);
  graphInputs.forEach(input => { if (input !== document.activeElement) input.value = byId(input.dataset.coefficient).value; });
  byId('homeEquation').textContent = equationText(a, b, c);
  const fn = x => a * x * x + b * x + c;
  const roots = realRoots(a, b, c);
  const equation = equationText(a, b, c);
  coefficients.forEach(input => byId(input.id + 'Val').textContent = fmt(+input.value));
  byId('equation').textContent = equation;
  byId('rootsToggle').setAttribute('aria-pressed', String(mark));
  const explanation = roots === null ? 'Todo x real é raiz.' : roots.length ? 'Raízes reais · ' + roots.map(fmt).join(' e ') : 'A função não tem raízes reais.';
  byId('roots').textContent = explanation;
  canvas.setAttribute('aria-label', 'Comparação de y = x² com ' + equation + '. ' + explanation);
  byId('values').innerHTML = [-3, -2, -1, 0, 1, 2, 3].map(x =>
    '<tr><th scope="row">' + fmt(x) + '</th><td>' + fmt(x * x) + '</td><td>' + fmt(fn(x)) + '</td></tr>'
  ).join('');
  draw(fn, mark ? roots ?? [] : []);
}
coefficients.forEach(input => input.addEventListener('input', () => { save(); render(); }));
byId('example').onclick = () => {
  coefficients.forEach((input, index) => input.value = [1, 0, -4][index]);
  save(); render();
};
byId('graphPreset').onchange = event => {
  if (!event.target.value) return;
  const preset = event.target.value.split(',');
  coefficients.forEach((input, index) => { input.value = preset[index]; });
  event.target.value = '';
  save();
  render();
};
byId('rootsToggle').onclick = () => { mark = !mark; save(); render(); };
document.querySelectorAll('[data-view]').forEach(button => {
  button.onclick = () => selectView(button.dataset.view);
});
new ResizeObserver(render).observe(canvas);
function passToLab(id, name, value) {
  const frame = byId(id).querySelector('iframe');
  function send() {
    frame.contentWindow.dispatchEvent(new CustomEvent(name, {detail: value}));
  }
  if (frame.contentDocument?.readyState === 'complete' && frame.contentDocument.URL !== 'about:blank') send();
  else frame.addEventListener('load', send, {once: true});
}

document.querySelectorAll('[data-open]').forEach(button => {
  button.onclick = () => {
    const id = button.dataset.open;
    if (id === 'dna') passToLab(id, 'rai:seed', validSeed);
    if (id === 'formas') passToLab(id, 'rai:amplitude', validAmplitude);
    selectView(id);
    document.querySelector('[data-view="' + id + '"]').focus();
  };
});

function preview(id, draw, designHeight = 240) {
  const target = byId(id);
  const context = target.getContext('2d');
  function paint() {
    const w = target.clientWidth, h = target.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
    target.width = Math.round(w * dpr);
    target.height = Math.round(h * dpr);
    const scale = Math.min(w / 400, h / designHeight);
    context.setTransform(dpr * scale, 0, 0, dpr * scale, target.width / 2, target.height / 2);
    draw(context);
  }
  new ResizeObserver(paint).observe(target);
  return paint;
}

const paintDNA = preview('dnaPreview', g => {
  const shape = model(validSeed);
  for (let ring = 0; ring < 22; ring++) {
    g.beginPath();
    for (let i = 0; i <= 420; i++) {
      const angle = i / 420 * Math.PI * 2;
      const p = point(shape, ring / 21, angle);
      const x = (p.x * .94 - p.y * .34) * 178;
      const y = (p.y * .76 + p.x * .22 - p.z * .68) * 118;
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    }
    g.strokeStyle = 'hsla(' + ((shape.h % 360 + ring * 7) % 360) + ', 91%, 73%, .74)';
    g.stroke();
  }
});
function projectWave(x, y) {
  const z = validAmplitude * Math.sin(x) * Math.cos(y);
  return [x * 22 - y * 10, x * 2 + y * 12 - z * 20];
}

const paintWave = preview('wavePreview', g => {
  for (const alongX of [true, false]) {
    for (let row = 0; row <= 32; row++) {
      const u = (row / 32 - .5) * 7;
      g.beginPath();
      for (let col = 0; col <= 80; col++) {
        const v = (col / 80 - .5) * 7;
        const [x, y] = alongX ? [v, u] : [u, v];
        const [sx, sy] = projectWave(x * 2, y);
        if (col) g.lineTo(sx, sy);
        else g.moveTo(sx, sy);
      }
      g.strokeStyle = alongX ? 'rgba(73, 231, 245, .77)' : 'rgba(41, 185, 220, .62)';
      g.stroke();
    }
  }
}, 180);
const paintGraph = preview('graphPreview', g => {
  const [a, b, c] = coefficients.map(input => +input.value);
  g.strokeStyle = '#344d74';
  g.beginPath();
  for (let x = -180; x <= 180; x += 20) { g.moveTo(x, -100); g.lineTo(x, 100); }
  for (let y = -100; y <= 100; y += 20) { g.moveTo(-180, y); g.lineTo(180, y); }
  g.stroke();
  g.strokeStyle = '#8ba2c5';
  g.beginPath();
  g.moveTo(-180, 0); g.lineTo(180, 0); g.moveTo(0, -100); g.lineTo(0, 100);
  g.stroke();
  g.save();
  g.beginPath(); g.rect(-180, -100, 360, 200); g.clip();
  g.beginPath();
  for (let pixel = -180; pixel <= 180; pixel++) {
    const x = pixel / 30;
    const y = -(a * x * x + b * x + c) * 8;
    if (pixel === -180) g.moveTo(pixel, y);
    else g.lineTo(pixel, y);
  }
  g.strokeStyle = '#f3ce84'; g.lineWidth = 2.5; g.stroke();
  g.restore();
});
seed.oninput = () => {
  seed.value = seed.value.replace(/[^0-9]/g, '');
  if (!seed.value) return;
  validSeed = seed.value;
  save(); paintDNA();
};
seed.onblur = () => { seed.value = validSeed; };
amplitude.oninput = () => {
  if (amplitude.value === '' || !amplitude.validity.valid) return;
  validAmplitude = +amplitude.value;
  save(); paintWave();
};
amplitude.onblur = () => { amplitude.value = validAmplitude; };
graphInputs.forEach(input => {
  const coefficient = byId(input.dataset.coefficient);
  input.oninput = () => {
    if (input.value === '' || !input.validity.valid) return;
    coefficient.value = input.value;
    save(); render(); paintGraph();
  };
  input.onblur = () => { input.value = coefficient.value; };
});
selectView('inicio');
