// Dry-media kit: paper tooth, crayon / oil-pastel strokes, grain-gated layers.
// Everything is seeded, so the same seed redraws the same picture.
const { createCanvas } = require('@napi-rs/canvas');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRng(seed) {
  const r = mulberry32(seed);
  const f = () => r();
  f.range = (a, b) => a + (b - a) * r();
  f.pick = (arr) => arr[Math.floor(r() * arr.length)];
  f.gauss = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  f.fork = (tag) => makeRng((seed * 2654435761 + tag * 97) >>> 0);
  return f;
}

function makeNoise(seed) {
  const rng = mulberry32(seed);
  const p = new Uint8Array(512);
  const perm = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const val = new Float32Array(256); for (let i = 0; i < 256; i++) val[i] = rng();
  const fade = (t) => t * t * (3 - 2 * t);
  function n2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = val[p[(p[xi & 255] + yi) & 511] & 255], b = val[p[(p[(xi + 1) & 255] + yi) & 511] & 255];
    const c = val[p[(p[xi & 255] + yi + 1) & 511] & 255], d = val[p[(p[(xi + 1) & 255] + yi + 1) & 511] & 255];
    const u = fade(xf), v = fade(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  n2.fbm = (x, y, oct = 4) => { let s = 0, amp = 0.5, f = 1, norm = 0; for (let i = 0; i < oct; i++) { s += amp * n2(x * f, y * f); norm += amp; amp *= 0.5; f *= 2.03; } return s / norm; };
  return n2;
}

const hex = (h) => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
const rgb = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const jitter = (c, rng, amt = 10) => c.map((v) => Math.max(0, Math.min(255, v + rng.gauss() * amt)));

class Sheet {
  constructor(W, H, paperHex, seed) {
    this.W = W; this.H = H; this.seed = seed;
    this.noise = makeNoise(seed);
    this.rng = makeRng(seed);
    const paper = hex(paperHex);
    this.px = new Float32Array(W * H * 3);
    for (let i = 0; i < W * H; i++) { this.px[i * 3] = paper[0]; this.px[i * 3 + 1] = paper[1]; this.px[i * 3 + 2] = paper[2]; }
    // paper tooth: fine fibrous grain plus a slower wash, in [0,1]
    this.grain = new Float32Array(W * H);
    const n = this.noise, n2 = makeNoise(seed + 7);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const fine = n(x * 0.26, y * 0.2);             // tooth
      const fiber = n2(x * 0.09, y * 0.9);           // horizontal fibres
      const slow = n.fbm(x * 0.004, y * 0.004, 3);   // uneven pressure across the sheet
      this.grain[y * W + x] = fine * 0.55 + fiber * 0.25 + slow * 0.2;
    }
  }
  // layer(y0, y1): a canvas covering only rows y0..y1, drawn in sheet coordinates.
  layer(y0, y1) {
    const a = y0 === undefined ? 0 : Math.max(0, Math.floor(y0)), b = y1 === undefined ? this.H : Math.min(this.H, Math.ceil(y1));
    const c = createCanvas(this.W, b - a); const ctx = c.getContext('2d'); ctx.translate(0, -a); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    return { c, ctx, y0: a, y1: b };
  }
  // Lay a layer down through the paper tooth. pressure ~0.4 (light, lots of paper) .. 0.95 (heavy).
  // box = [y0, y1]: only rows in that band are read, which keeps very tall sheets fast.
  lay(layer, pressure = 0.7, soft = 7, opacity = 1, box) {
    const { W, H } = this; const y0 = box ? Math.max(layer.y0, Math.floor(box[0])) : layer.y0, y1 = box ? Math.min(layer.y1, Math.ceil(box[1])) : layer.y1;
    if (y1 <= y0) return;
    const d = layer.c.getContext('2d').getImageData(0, y0 - layer.y0, W, y1 - y0).data; const px = this.px, g = this.grain;
    for (let k = 0; k < W * (y1 - y0); k++) {
      const a0 = d[k * 4 + 3]; if (!a0) continue; const i = k + y0 * W;
      let gate = (pressure - g[i]) * soft + 0.5; if (gate <= 0) continue; if (gate > 1) gate = 1;
      const a = (a0 / 255) * gate * opacity, j = i * 3, k4 = k * 4;
      px[j] += (d[k4] - px[j]) * a; px[j + 1] += (d[k4 + 1] - px[j + 1]) * a; px[j + 2] += (d[k4 + 2] - px[j + 2]) * a;
    }
  }
  finish(file, outW) {
    const { W, H } = this; const c = createCanvas(W, H); const ctx = c.getContext('2d'); const img = ctx.createImageData(W, H);
    for (let i = 0; i < W * H; i++) {
      const t = (this.grain[i] - 0.5) * 5; // paper tooth shows faintly everywhere
      img.data[i * 4] = this.px[i * 3] + t; img.data[i * 4 + 1] = this.px[i * 3 + 1] + t; img.data[i * 4 + 2] = this.px[i * 3 + 2] + t; img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const fs = require('fs');
    fs.writeFileSync(file + '.png', c.toBuffer('image/png'));
    if (outW) { const s = createCanvas(outW, Math.round(outW * H / W)); s.getContext('2d').drawImage(c, 0, 0, s.width, s.height); fs.writeFileSync(file + '-' + outW + '.jpg', s.toBuffer('image/jpeg', 88)); }
    return c;
  }
}

// One crayon / pastel mark: a bundle of thin fibres along a slightly bent path.
function mark(ctx, rng, x, y, ang, len, w, col, alpha = 0.9) {
  const fibres = 3 + Math.floor(rng() * 3);
  const bend = rng.gauss() * len * 0.08;
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
  for (let f = 0; f < fibres; f++) {
    const off = (fibres === 1 ? 0 : f / (fibres - 1) - 0.5) * w;
    const sx = x - dx * len / 2 + nx * off, sy = y - dy * len / 2 + ny * off;
    const ex = x + dx * len / 2 + nx * off * 0.7, ey = y + dy * len / 2 + ny * off * 0.7;
    const cx = x + nx * (off + bend), cy = y + ny * (off + bend);
    ctx.strokeStyle = rgb(jitter(col, rng, 6));
    ctx.globalAlpha = alpha * rng.range(0.55, 1);
    ctx.lineWidth = Math.max(0.8, (w / fibres) * rng.range(1.1, 2.0));
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// A wobbly ink or crayon line through points.
function line(ctx, rng, pts, w, col, alpha = 1, wob = 1.2) {
  ctx.strokeStyle = rgb(col); ctx.globalAlpha = alpha;
  for (let pass = 0; pass < 2; pass++) {
    ctx.lineWidth = w * (pass ? 0.6 : 1);
    ctx.beginPath();
    pts.forEach((p, i) => { const px = p[0] + rng.gauss() * wob, py = p[1] + rng.gauss() * wob; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function curve(p0, p1, sag, n = 40, wav = 0, rng) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n; const x = p0[0] + (p1[0] - p0[0]) * t; let y = p0[1] + (p1[1] - p0[1]) * t + sag * 4 * t * (1 - t);
    out.push([x + (wav ? Math.sin(t * 9 + (rng ? rng() : 0)) * wav : 0), y]);
  }
  return out;
}

module.exports = { Sheet, makeRng, makeNoise, hex, rgb, mix, jitter, mark, line, curve, createCanvas };
