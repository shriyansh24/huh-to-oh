// "The line": the notebook page below the hero, continued for the whole home page.
// The pencil line from the hero runs down the page as a railway; every curriculum track is its own station;
// cut-paper scenes stand up off the page between parts. Original work, drawn stroke by stroke.
// node art/line.js [day|night]  ->  art/out/line-<mode>.png, line-<mode>.jpg, layout-<mode>.json
const fs = require('fs');
const { Sheet, makeRng, hex, rgb, mix, mark, line, curve } = require('./kit');
const MODE = process.argv[2] === 'night' ? 'night' : 'day', NIGHT = MODE === 'night';
const path = require('path');
const ST = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/stations-full.json'), 'utf8'));
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const W = 1440;

// ---------------- layout: where every band and station sits ----------------
const PARTS = []; ST.forEach((s, i) => { if (s.part || i === 0) PARTS.push({ name: s.part, first: i, stations: [] }); PARTS[PARTS.length - 1].stations.push(i); });
const BAND_H = [430, 600, 600, 620, 600], GAP = 168, END_H = 760;
let y = 0; const bands = [], stations = [];
PARTS.forEach((p, pi) => {
  const top = y, h = BAND_H[pi]; bands.push({ part: p.name, top, h }); y += h;
  p.stations.forEach((si, k) => { y += k === 0 ? 70 : GAP; stations.push({ i: si, y }); });
  y += 120;
});
const endTop = y; const H = endTop + END_H;
// stations alternate sides of the page centre; the card sits on the outer side, a drawn emblem on the inner side
stations.forEach((s, k) => { s.side = k % 2 ? 'right' : 'left'; s.x = W * (s.side === 'left' ? 0.43 : 0.57); });

// ---------------- palette ----------------
const P = NIGHT ? {
  paper: '#2B2926', lit: [251, 244, 220], rule: '#3A3732', ink: hex('#E8E0D0'), graphite: hex('#CFC7B8'), rail: hex('#D9D0BF'), tie: hex('#8A6A4E'),
  shadow: 'rgba(0,0,0,0.55)', red: '#E0705E', blue: '#7E96E0', ochre: '#E3A13A', green: '#6E9A78', teal: '#4A8A86', purple: '#8E7FB4', rose: '#D88A9A', sky: '#5A6FA8', brown: '#9A7A5A', grey: '#8E8A84', cream: '#EFE6D2', dark: '#1E2350', water: '#3F6E96', glow: 'rgb(247,210,122)',
} : {
  paper: '#FBF4DC', lit: [251, 244, 220], rule: '#D9E1EA', ink: hex('#3A3530'), graphite: hex('#55535C'), rail: hex('#4A4046'), tie: hex('#8A6A4E'),
  shadow: 'rgba(70,55,45,0.28)', red: '#C24A3A', blue: '#3D52B0', ochre: '#E2AE3E', green: '#8FAE7A', teal: '#5E9A8E', purple: '#9A86B8', rose: '#E8A0AC', sky: '#9DBBD0', brown: '#9A7454', grey: '#B3ADA2', cream: '#FBF0D4', dark: '#2A3270', water: '#7FA9C8', glow: 'rgb(247,210,122)',
};
const sheet = new Sheet(W, H, P.paper, 4242), R = makeRng(4242), N = sheet.noise;
const toHex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const shade = (h, t) => toHex(mix(hex(h), [0, 0, 0], t)), tint = (h, t) => toHex(mix(hex(h), [255, 250, 235], t));
const fam = (h) => [hex(h), mix(hex(h), [255, 250, 235], 0.14), mix(hex(h), [0, 0, 0], 0.1)];

// ---------------- drawing helpers ----------------
const poly = (pts) => (ctx) => { pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
const rect = (x, y0, w, h) => [[x, y0], [x + w, y0], [x + w, y0 + h], [x, y0 + h]];
const circ = (cx, cy, rx, ry = rx, n = 40, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const bbox = (pts) => { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
// cut paper: crayon fill clipped to a shape, a pencil edge, and a soft shadow on the page underneath
function paper(Lsh, L, rng, pts, col, { ang = -0.1, edge = true, lit = null, litDir = 1, shadow = true, dens = 1 } = {}) {
  const b = bbox(pts), area = (b[2] - b[0]) * (b[3] - b[1]);
  if (shadow && Lsh) { Lsh.ctx.save(); Lsh.ctx.translate(5, 7); Lsh.ctx.fillStyle = P.shadow; Lsh.ctx.beginPath(); poly(pts)(Lsh.ctx); Lsh.ctx.fill(); Lsh.ctx.restore(); }
  const ctx = L.ctx; ctx.save(); ctx.beginPath(); poly(pts)(ctx); ctx.clip();
  ctx.fillStyle = rgb(mix(hex(col), hex(P.paper), 0.12)); ctx.globalAlpha = NIGHT ? 0.9 : 0.55; ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]); ctx.globalAlpha = 1;
  const F = fam(col), Lt = lit ? fam(lit) : null, n = Math.max(12, Math.round(area / 70 * dens));
  for (let i = 0; i < n; i++) {
    const x = rng.range(b[0] - 4, b[2] + 4), yy = rng.range(b[1] - 4, b[3] + 4);
    const useLit = Lt && ((x - b[0]) / (b[2] - b[0] + 1) - 0.5) * litDir > 0.08 && rng() < 0.8;
    mark(ctx, rng, x, yy, ang + rng.gauss() * 0.12, rng.range(10, 26), rng.range(3, 6), rng.pick(useLit ? Lt : F), 0.95);
  }
  ctx.restore();
  if (edge) line(ctx, rng, [...pts, pts[0]], 1.6, P.ink, NIGHT ? 0.55 : 0.6, 0.5);
}
const pen = (L, rng, pts, w = 1.8, col = P.ink, a = 0.85, wob = 0.5) => line(L.ctx, rng, pts, w, typeof col === 'string' ? hex(col) : col, a, wob);
const dot = (L, x, yy, r, col, a = 1) => { L.ctx.globalAlpha = a; L.ctx.fillStyle = col; L.ctx.beginPath(); L.ctx.arc(x, yy, r, 0, 7); L.ctx.fill(); L.ctx.globalAlpha = 1; };
// draw into a band of rows with three layers (shadow, paper, ink) and lay them down
function band(y0, y1, fn, seed) {
  const Lsh = sheet.layer(y0, y1), L = sheet.layer(y0, y1), Li = sheet.layer(y0, y1), rng = R.fork(seed);
  fn({ Lsh, L, Li, rng });
  sheet.lay(Lsh, 1.1, 3, NIGHT ? 0.9 : 0.75); sheet.lay(L, 0.92, 7); sheet.lay(Li, 0.95, 8);
}

// ---------------- the page itself ----------------
{
  // lamplight: at night only the top of the page is lit, then the paper goes dark
  const L = sheet.layer(), ctx = L.ctx;
  if (NIGHT) {
    const g = ctx.createLinearGradient(0, 0, 0, 900);
    g.addColorStop(0, 'rgba(251,244,220,1)'); g.addColorStop(0.36, 'rgba(240,229,202,0.95)'); g.addColorStop(0.62, 'rgba(120,108,92,0.42)'); g.addColorStop(1, 'rgba(43,41,38,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 900);
    const v = ctx.createLinearGradient(0, 0, W, 0); v.addColorStop(0, 'rgba(20,18,30,0.35)'); v.addColorStop(0.3, 'rgba(20,18,30,0)'); v.addColorStop(0.7, 'rgba(20,18,30,0)'); v.addColorStop(1, 'rgba(20,18,30,0.35)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(248,226,170,0.22)'); g.addColorStop(1, 'rgba(240,226,190,0.1)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const v = ctx.createLinearGradient(0, 0, W, 0); v.addColorStop(0, 'rgba(120,100,70,0.1)'); v.addColorStop(0.25, 'rgba(120,100,70,0)'); v.addColorStop(0.75, 'rgba(120,100,70,0)'); v.addColorStop(1, 'rgba(120,100,70,0.1)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  for (let y0 = 0; y0 < H; y0 += 2000) sheet.lay(L, 1.2, 4, 1, [y0, y0 + 2000]);
  // paper strokes so the page is drawn too
  for (let y0 = 0; y0 < H; y0 += 1500) {
    const P2 = sheet.layer(y0, y0 + 1500), rng = R.fork(1 + y0);
    for (let i = 0; i < 2600; i++) {
      const x = rng() * W, yy = y0 + rng() * 1500, litT = NIGHT ? Math.max(0, 1 - yy / 700) : 1;
      const base = NIGHT ? mix(hex('#34312D'), hex('#F4E6C4'), litT) : hex(rng.pick(['#F8E8C2', '#FBF0D4', '#F4ECD6']));
      mark(P2.ctx, rng, x, yy, rng.gauss() * 0.05, rng.range(50, 130), rng.range(6, 12), base, 0.45);
    }
    sheet.lay(P2, 0.7, 5, 0.6);
  }
  // faint ruled lines all the way down, and the margin line
  for (let y0 = 0; y0 < H; y0 += 2000) {
    const G = sheet.layer(y0, y0 + 2000), rng = R.fork(7 + y0);
    for (let yy = y0 + 16; yy < y0 + 2000; yy += 32) line(G.ctx, rng, curve([0.015 * W, yy], [0.985 * W, yy + 2], 0, 40), 1, hex(yy < 500 && NIGHT ? '#B9C6D8' : P.rule), NIGHT ? (yy < 500 ? 0.4 * (1 - yy / 500) + 0.25 : 0.5) : 0.55, 0.25);
    line(G.ctx, rng, [[0.045 * W, y0], [0.046 * W, y0 + 2000]], 1.4, hex(NIGHT ? '#8A4A44' : '#D9877E'), 0.5, 0.3);
    sheet.lay(G, 0.85, 6);
  }
}

// ---------------- the track ----------------
// key points: from the top (where the hero's pencil line comes down) through every band and station, to the town
const KP = [[0.6 * W, -10], [0.6 * W, 120]];
const bandPass = []; // where the track crosses each scene
PARTS.forEach((p, pi) => {
  const b = bands[pi];
  if (pi === 0) { KP.push([0.62 * W, b.top + 250], [0.6 * W, b.top + 360]); bandPass.push([0.62 * W, b.top + 250]); }
  else {
    const passX = [0, 0.6, 0.55, 0.58, 0.56][pi] * W;
    KP.push([passX + 30, b.top + 150], [passX, b.top + 0.62 * b.h], [passX - 20, b.top + b.h - 40]);
    bandPass.push([passX, b.top + 0.62 * b.h]);
  }
  p.stations.forEach((si) => { const s = stations.find((t) => t.i === si); KP.push([s.x, s.y]); });
});
const townX = 0.5 * W, townY = endTop + 610; // the line ends at the foot of the town, after skirting round its right side
KP.push([0.64 * W, endTop + 130], [0.73 * W, endTop + 380], [0.63 * W, endTop + 560], [townX + 70, townY]);
function catmull(pts, per = 30) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const n = Math.max(6, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 6));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  out.push(pts[pts.length - 1]); return out;
}
const PATH = catmull(KP);
const realAt = (yy) => Math.min(1, Math.max(0, (yy - 60) / 260)); // graphite at the top, real track by the first station
const tunnelAt = (p) => { const b = bands[1], c = bandPass[1]; return Math.abs(p[1] - c[1]) < 38 && Math.abs(p[0] - c[0]) < 80; };
function drawTrack(y0, y1) {
  const T = sheet.layer(y0, y1), rng = R.fork(900 + y0);
  for (let i = 1; i < PATH.length; i++) {
    const p = PATH[i], q = PATH[i - 1]; if (p[1] < y0 - 20 || p[1] > y1 + 20) continue;
    if (tunnelAt(p)) continue;
    const ang = Math.atan2(p[1] - q[1], p[0] - q[0]), nx = -Math.sin(ang), ny = Math.cos(ang), real = realAt(p[1]);
    const gauge = 2 + real * 7, dk = NIGHT ? Math.min(1, Math.max(0, (p[1] - 120) / 380)) : 1;
    const col = mix(mix(hex('#55535C'), hex('#4A4046'), real), mix(P.graphite, P.rail, real), dk);
    for (const s of real > 0.05 ? [-1, 1] : [0]) line(T.ctx, rng, [[q[0] + nx * gauge * s, q[1] + ny * gauge * s], [p[0] + nx * gauge * s, p[1] + ny * gauge * s]], 1.7 + real * 0.7, col, 0.9, 0.22);
    if (real > 0.3 && i % 3 === 0) mark(T.ctx, rng, p[0], p[1], ang + Math.PI / 2, gauge * 2.6, 3, P.tie, 0.85 * real);
  }
  sheet.lay(T, 0.96, 7);
}

// ---------------- the start: a red bit, where the line begins ----------------
band(0, bands[0].top + bands[0].h, ({ Lsh, L, Li, rng }) => {
  const bx = 0.6 * W, by = 46;
  const g = Li.ctx.createRadialGradient(bx, by, 0, bx, by, 34); g.addColorStop(0, 'rgba(242,128,110,0.6)'); g.addColorStop(1, 'rgba(242,128,110,0)');
  Li.ctx.fillStyle = g; Li.ctx.fillRect(bx - 40, by - 40, 80, 80); dot(Li, bx, by, 7, 'rgb(178,58,46)');
  pen(Li, rng, circ(bx, by, 14, 13, 30), 2, hex('#46454F'), 0.9);
  // a blue pencil arrow from the margin, pointing at it
  pen(Li, rng, curve([bx + 120, by + 40], [bx + 24, by + 10], -18, 16), 1.6, hex(NIGHT ? '#3D52B0' : '#2D3F9E'), 0.8, 0.4);
  pen(Li, rng, [[bx + 34, by + 4], [bx + 24, by + 10], [bx + 30, by + 19]], 1.6, hex(NIGHT ? '#3D52B0' : '#2D3F9E'), 0.8, 0.4);
  // a small station with a clock where the pencil line turns into track
  const sx = 0.76 * W, base = bands[0].top + 330;
  paper(Lsh, L, rng, rect(sx - 110, base - 70, 220, 70), P.cream, { ang: Math.PI / 2, lit: P.ochre, litDir: 1 });
  paper(Lsh, L, rng, [[sx - 130, base - 70], [sx, base - 118], [sx + 130, base - 70]], P.red, { ang: 0.2 });
  paper(null, L, rng, circ(sx, base - 84, 13, 13, 28), P.cream, { shadow: false });
  pen(Li, rng, [[sx, base - 84], [sx, base - 93]], 1.6); pen(Li, rng, [[sx, base - 84], [sx + 7, base - 82]], 1.6);
  for (const dx of [-70, -24, 24, 70]) paper(null, L, rng, rect(sx + dx - 12, base - 54, 24, 30), P.ochre, { shadow: false, ang: Math.PI / 2 });
  paper(Lsh, L, rng, rect(sx - 150, base, 300, 12), P.grey, { ang: 0 }); // the platform
  // a bench and a lamp post on the platform
  pen(Li, rng, [[sx + 150, base], [sx + 150, base - 92]], 2.2); dot(Li, sx + 150, base - 96, 6, NIGHT ? P.glow : P.ochre, 0.9);
  pen(Li, rng, [[sx - 140, base - 14], [sx - 112, base - 14]], 2.2); pen(Li, rng, [[sx - 138, base - 14], [sx - 138, base]], 1.6); pen(Li, rng, [[sx - 114, base - 14], [sx - 114, base]], 1.6);
}, 10);

// ---------------- part scenes ----------------
// 2. Languages: rolling hills, a tunnel the line runs through, and seven small houses far off
band(bands[1].top, bands[1].top + bands[1].h, ({ Lsh, L, Li, rng }) => {
  const b = bands[1], c = bandPass[1], top = b.top;
  const hillA = (x) => top + 330 + 40 * Math.sin(x / W * 4.1 + 0.6) + 12 * N(x * 0.006, 4);
  const hillB = (x) => top + 395 + 34 * Math.sin(x / W * 3.2 + 2.1) - 70 * Math.exp(-Math.pow((x - c[0]) / 170, 2)) + 10 * N(x * 0.008, 5);
  const shape = (f, bot) => { const pts = []; for (let x = 0; x <= W; x += 10) pts.push([x, f(x)]); pts.push([W, bot], [0, bot]); return pts; };
  paper(Lsh, L, rng, shape(hillA, top + 470), NIGHT ? '#5E5594' : '#A8B4D0', { ang: -0.05, lit: NIGHT ? '#7A6AA8' : '#C8CFE0' });
  // seven little houses on the far hill, one for each language, each its own shape
  const hx = [0.12, 0.2, 0.29, 0.7, 0.78, 0.86, 0.93], hc = [P.blue, P.ochre, P.sky, P.teal, P.red, P.purple, P.grey];
  hx.forEach((t, k) => {
    const x = t * W, base = hillA(x) + 8, w = 26 + (k % 3) * 6, h = 22 + ((k * 7) % 4) * 6;
    paper(null, L, rng, rect(x - w / 2, base - h, w, h), P.cream, { shadow: false, ang: Math.PI / 2, dens: 1.5 });
    paper(null, L, rng, k === 3 ? circ(x, base - h, w / 2, w / 2.4, 16, Math.PI, Math.PI * 2) : k === 1 ? rect(x - w / 2 - 3, base - h - 6, w + 6, 6) : [[x - w / 2 - 4, base - h], [x, base - h - w * 0.55], [x + w / 2 + 4, base - h]], hc[k], { shadow: false, dens: 2 });
    dot(Li, x, base - h / 2, 2.6, NIGHT ? P.glow : 'rgb(120,100,70)', 0.9);
  });
  paper(Lsh, L, rng, shape(hillB, top + b.h - 10), NIGHT ? '#4F7C62' : '#9DBA86', { ang: -0.05, lit: NIGHT ? '#6E9A78' : '#B8CFA0' });
  // the tunnel: a dark arch in the near hill with a stone face
  const tx = c[0], ty = c[1] + 10;
  paper(null, L, rng, [...circ(tx, ty - 6, 58, 50, 24, Math.PI, Math.PI * 2), [tx + 58, ty + 34], [tx - 58, ty + 34]], P.grey, { shadow: false, dens: 1.4 });
  paper(null, L, rng, [...circ(tx, ty, 38, 36, 20, Math.PI, Math.PI * 2), [tx + 38, ty + 34], [tx - 38, ty + 34]], NIGHT ? '#15131A' : '#3A3046', { shadow: false, dens: 2 });
  for (let k = 0; k < 9; k++) { const a = Math.PI + k / 8 * Math.PI; pen(Li, rng, [[tx + Math.cos(a) * 40, ty + Math.sin(a) * 38], [tx + Math.cos(a) * 56, ty - 6 + Math.sin(a) * 48]], 1.3, P.ink, 0.6); }
  // two crayon clouds over the hills
  for (const [cx, cy] of [[0.8 * W, top + 150], [0.9 * W, top + 230]]) for (let k = 0; k < 5; k++) paper(null, L, rng, circ(cx + (k - 2) * 22, cy - (k % 2) * 12, 22, 16, 18), NIGHT ? '#4A4560' : '#FDF8EA', { shadow: false, edge: false, dens: 1.6 });
}, 20);

// 3. The machine and its systems: a city of chips, poles and wires
band(bands[2].top, bands[2].top + bands[2].h, ({ Lsh, L, Li, rng }) => {
  const b = bands[2], c = bandPass[2], top = b.top, ground = top + 470;
  // wires first, so the buildings stand in front of the far ones
  const poles = [0.08, 0.27, 0.71, 0.9].map((t) => t * W);
  poles.forEach((x, k) => { pen(Li, rng, [[x, ground + 10], [x + 2, top + 250]], 3, P.brown, 0.9, 0.4); pen(Li, rng, [[x - 22, top + 262], [x + 22, top + 260]], 2.4, P.brown, 0.9); });
  for (let k = 0; k < poles.length - 1; k++) for (const dy of [262, 270]) { if (k === 1) continue; pen(Li, rng, curve([poles[k] + (dy === 262 ? -18 : 18), top + dy], [poles[k + 1] + (dy === 262 ? -18 : 18), top + dy], 26, 30), 1.2, P.ink, 0.7, 0.3); }
  // a small bird on a wire, because there always is one
  dot(Li, poles[2] + 70, top + 280, 5, NIGHT ? '#CFC7B8' : '#3A3530'); pen(Li, rng, [[poles[2] + 74, top + 279], [poles[2] + 81, top + 281]], 1.4, hex(P.ochre), 1);
  const blds = [[0.13, 70, 150], [0.2, 54, 110], [0.33, 80, 190], [0.41, 48, 120], [0.67, 64, 160], [0.75, 90, 210], [0.84, 56, 130], [0.92, 70, 175]];
  const cols = [P.purple, P.teal, P.blue, P.grey, P.teal, P.purple, P.blue, P.grey];
  blds.forEach(([t, w, h], k) => {
    const x = t * W, x0 = x - w / 2, y0 = ground - h;
    paper(Lsh, L, rng, rect(x0, y0, w, h), cols[k], { ang: Math.PI / 2, lit: NIGHT ? '#B8A8D8' : '#F3D6B0', litDir: 1 });
    for (let j = 0; j < Math.floor(h / 18); j++) for (const s of [-1, 1]) pen(Li, rng, [[x + s * w / 2, y0 + 12 + j * 18], [x + s * (w / 2 + 9), y0 + 12 + j * 18]], 2.4, hex(NIGHT ? '#CFC7B8' : '#7E7868'), 0.9, 0.2);
    for (let j = 0; j < Math.floor(h / 26); j++) if (rng() < 0.7) { Li.ctx.fillStyle = rng() < 0.85 ? P.glow : 'rgb(245,196,81)'; Li.ctx.globalAlpha = NIGHT ? 1 : 0.6; Li.ctx.fillRect(x + rng.range(-0.3, 0.15) * w, y0 + 10 + j * 26, 7, 8); Li.ctx.globalAlpha = 1; }
    if (k === 5) { pen(Li, rng, [[x, y0], [x, y0 - 40]], 2, P.ink); for (const r of [10, 18, 26]) pen(Li, rng, circ(x, y0 - 42, r, r * 0.8, 10, -Math.PI * 0.85, -Math.PI * 0.15), 1.3, hex(P.red), 0.75); dot(Li, x, y0 - 42, 4, P.red); }
  });
  // a database drum and a cloud tied to the ground by a string, at the edges
  const dx = 0.52 * W - 160, dy = ground - 40;
  paper(Lsh, L, rng, [...circ(dx, dy - 50, 34, 10, 20, Math.PI, 0), ...circ(dx, dy, 34, 10, 20, 0, Math.PI)], P.ochre, { ang: Math.PI / 2 });
  for (const yy of [dy - 50, dy - 33, dy - 16]) pen(Li, rng, circ(dx, yy, 34, 10, 24, 0, Math.PI), 1.4, P.ink, 0.7);
  paper(null, L, rng, circ(dx, dy - 50, 34, 10, 24), tint(P.ochre, 0.3), { shadow: false });
  paper(Lsh, L, rng, rect(0, ground, W, 26), NIGHT ? '#3E4A44' : '#B9C4A4', { ang: 0, edge: true, dens: 0.8 }); // the street
}, 30);

// 4. Maths and models: an observatory on a hill under a patch of wired night sky
band(bands[3].top, bands[3].top + bands[3].h, ({ Lsh, L, Li, rng }) => {
  const b = bands[3], top = b.top, c = bandPass[3];
  const sx0 = 0.62 * W, sx1 = 0.97 * W, sy0 = top + 40, sy1 = top + 330;
  const skyPts = []; for (let k = 0; k <= 40; k++) { const t = k / 40; skyPts.push([sx0 + (sx1 - sx0) * t, sy0 + 10 * Math.sin(t * 9) + 6 * N(t * 20, 9)]); }
  for (let k = 0; k <= 40; k++) { const t = 1 - k / 40; skyPts.push([sx0 + (sx1 - sx0) * t, sy1 + 12 * Math.sin(t * 7 + 1)]); }
  paper(Lsh, L, rng, skyPts, P.dark, { ang: -0.08, dens: 1.2 });
  // the wired stars: a small network, three layers, two outputs lit
  const layers = [3, 4, 2], nodes = [];
  layers.forEach((n, li) => { const col = []; for (let k = 0; k < n; k++) col.push([sx0 + 70 + li * 110 + rng.gauss() * 6, sy0 + 40 + (k + 0.5) * ((sy1 - sy0 - 80) / n) + rng.gauss() * 6]); nodes.push(col); });
  for (let li = 0; li < 2; li++) for (const a of nodes[li]) for (const q of nodes[li + 1]) pen(Li, rng, [a, q], 1, hex('#F7EBC4'), 0.35, 0.3);
  nodes.flat().forEach((p, i) => { const out = i >= 7; const g = Li.ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 16); g.addColorStop(0, out ? 'rgba(242,128,110,0.7)' : 'rgba(253,243,208,0.6)'); g.addColorStop(1, 'rgba(253,243,208,0)'); Li.ctx.fillStyle = g; Li.ctx.fillRect(p[0] - 16, p[1] - 16, 32, 32); dot(Li, p[0], p[1], out ? 6 : 4, out ? 'rgb(246,150,128)' : 'rgb(253,246,220)'); });
  for (let k = 0; k < 30; k++) dot(Li, rng.range(sx0 + 10, sx1 - 10), rng.range(sy0 + 14, sy1 - 14), rng.range(0.8, 1.8), 'rgb(253,243,208)', rng.range(0.3, 0.8));
  // the hill and the observatory
  const hill = (x) => top + 470 - 120 * Math.exp(-Math.pow((x - 0.8 * W) / 190, 2)) + 20 * Math.sin(x / W * 5) + 8 * N(x * 0.01, 6);
  const hp = []; for (let x = 0; x <= W; x += 10) hp.push([x, hill(x)]); hp.push([W, top + b.h - 20], [0, top + b.h - 20]);
  paper(Lsh, L, rng, hp, NIGHT ? '#3F6E86' : '#7FA8A0', { ang: -0.05, lit: NIGHT ? '#4A7C8E' : '#A2C4BA' });
  const ox = 0.8 * W, oy = hill(ox) + 6;
  paper(Lsh, L, rng, rect(ox - 50, oy - 56, 100, 56), P.cream, { ang: Math.PI / 2 });
  paper(null, L, rng, circ(ox, oy - 56, 54, 46, 24, Math.PI, Math.PI * 2), NIGHT ? '#9AA2B8' : '#C9CDD6', { shadow: false });
  paper(null, L, rng, [[ox + 4, oy - 100], [ox + 16, oy - 102], [ox + 22, oy - 58], [ox + 10, oy - 56]], NIGHT ? '#15131A' : '#3A3046', { shadow: false, edge: false });
  paper(null, L, rng, [[ox + 6, oy - 94], [ox + 44, oy - 140], [ox + 54, oy - 132], [ox + 16, oy - 86]], P.grey, { shadow: false });
  paper(null, L, rng, rect(ox - 14, oy - 30, 28, 30), P.red, { shadow: false, ang: Math.PI / 2 });
  // a crayon bowl with a ball rolling down it, drawn on the page to the left of the track
  const bx = 0.36 * W, by = top + 470;
  pen(Li, rng, Array.from({ length: 30 }, (_, k) => { const t = k / 29 * 2 - 1; return [bx + t * 120, by - 90 * t * t]; }), 2.2, P.ink, 0.8);
  pen(Li, rng, [[bx - 140, by + 6], [bx + 140, by + 6]], 1.4, P.ink, 0.5); pen(Li, rng, [[bx - 130, by + 16], [bx - 130, by - 110]], 1.4, P.ink, 0.5);
  dot(Li, bx - 72, by - 90 * 0.36 - 9, 9, P.red);
  for (let k = 1; k <= 3; k++) pen(Li, rng, curve([bx - 72 + k * 14, by - 90 * Math.pow(0.6 - k * 0.12, 2) - 18], [bx - 64 + k * 14, by - 90 * Math.pow(0.6 - k * 0.12, 2) - 12], -2, 4), 1.4, hex(P.blue), 0.7, 0.3);
  dot(Li, bx, by - 4, 3, P.ink, 0.8);
}, 40);

// 5. Build it all: a river with a bridge, and paper planes in the air
band(bands[4].top, bands[4].top + bands[4].h, ({ Lsh, L, Li, rng }) => {
  const b = bands[4], top = b.top, c = bandPass[4];
  const r0 = (x) => c[1] - 24 + 10 * Math.sin(x / W * 6 + 1), r1 = (x) => c[1] + 46 + 12 * Math.sin(x / W * 5 + 2);
  const bankN = []; for (let x = 0; x <= W; x += 10) bankN.push([x, r0(x) - 60 - 30 * Math.sin(x / W * 3) ]); for (let x = W; x >= 0; x -= 10) bankN.push([x, r0(x)]);
  paper(Lsh, L, rng, bankN, NIGHT ? '#4F7C62' : '#9DBA86', { ang: -0.05 });
  const riv = []; for (let x = 0; x <= W; x += 10) riv.push([x, r0(x)]); for (let x = W; x >= 0; x -= 10) riv.push([x, r1(x)]);
  paper(null, L, rng, riv, P.water, { ang: 0, shadow: false, dens: 1.2 });
  for (let k = 0; k < 26; k++) { const x = rng() * W, yy = rng.range(r0(x) + 8, r1(x) - 8); pen(Li, rng, curve([x, yy], [x + 26, yy], -3, 6), 1.3, hex(NIGHT ? '#9FC0E0' : '#EAF2F6'), 0.8, 0.2); }
  const bankS = []; for (let x = 0; x <= W; x += 10) bankS.push([x, r1(x)]); for (let x = W; x >= 0; x -= 10) bankS.push([x, r1(x) + 70 + 20 * Math.sin(x / W * 4)]);
  paper(Lsh, L, rng, bankS, NIGHT ? '#5E8C6E' : '#A8C290', { ang: -0.05 });
  // a truss bridge where the line crosses
  const x0 = c[0] - 110, x1 = c[0] + 110, deck = c[1] + 10;
  paper(Lsh, L, rng, rect(x0, deck - 4, x1 - x0, 10), P.red, { ang: 0 });
  for (let k = 0; k <= 6; k++) { const x = x0 + (x1 - x0) * k / 6; pen(Li, rng, [[x, deck - 4], [x, deck - 40]], 2, hex(P.red), 0.95); if (k < 6) pen(Li, rng, [[x, deck - 4], [x + (x1 - x0) / 6, deck - 40]], 1.6, hex(P.red), 0.9); }
  pen(Li, rng, [[x0, deck - 40], [x1, deck - 40]], 2.4, hex(P.red), 0.95);
  for (const x of [x0 + 40, x1 - 40]) paper(Lsh, L, rng, rect(x - 9, deck + 6, 18, r1(x) - deck + 10), P.grey, { ang: Math.PI / 2 });
  // paper planes: the papers lab, flying
  const plane = (px, py, s, a, col) => {
    const pts = [[0, 0], [-46, -14], [-34, 0], [-46, 14]].map(([u, v]) => [px + (u * Math.cos(a) - v * Math.sin(a)) * s, py + (u * Math.sin(a) + v * Math.cos(a)) * s]);
    paper(Lsh, L, rng, pts, col, { ang: a, dens: 2 });
    pen(Li, rng, [pts[0], pts[2]], 1.2, P.ink, 0.6);
  };
  plane(0.83 * W, top + 120, 1.3, -0.25, P.cream); plane(0.93 * W, top + 200, 1.0, -0.15, NIGHT ? '#D8CCB0' : '#F4ECD6'); plane(0.72 * W, top + 230, 0.85, -0.35, P.cream);
  for (const [px, py, s] of [[0.83 * W, top + 120, 1.3], [0.72 * W, top + 230, 0.85]]) pen(Li, rng, Array.from({ length: 24 }, (_, k) => [px - 60 * s - k * 9 * s, py + 16 * s + Math.sin(k * 0.5) * 8 * s + k * 1.6 * s]), 1.2, hex(P.blue), 0.5, 0.3);
}, 50);

// ---------------- the end of the line: the town ----------------
band(endTop, H, ({ Lsh, L, Li, rng }) => {
  // a low sun and a big hill
  const sx = 0.86 * W, sy = endTop + 260;
  const g = L.ctx.createRadialGradient(sx, sy, 50, sx, sy, 260); g.addColorStop(0, NIGHT ? 'rgba(249,223,160,0.35)' : 'rgba(249,223,160,0.5)'); g.addColorStop(1, 'rgba(249,223,160,0)'); L.ctx.fillStyle = g; L.ctx.fillRect(sx - 260, sy - 260, 520, 520);
  paper(null, L, rng, circ(sx, sy, 70, 70, 40), NIGHT ? '#F6C88C' : '#F3C26A', { shadow: false, edge: false, dens: 2.4, ang: 1, lit: NIGHT ? '#FBEFC8' : '#F9E3A8', litDir: -1 });
  const hill = (x) => endTop + 470 - 150 * Math.exp(-Math.pow((x - townX) / 260, 2)) + 24 * Math.sin(x / W * 4 + 1) + 10 * N(x * 0.01, 8);
  const far = (x) => endTop + 400 + 40 * Math.sin(x / W * 6 + 2);
  const fp = []; for (let x = 0; x <= W; x += 10) fp.push([x, far(x)]); fp.push([W, H - 10], [0, H - 10]);
  paper(Lsh, L, rng, fp, NIGHT ? '#6A5E9E' : '#A8B4D0', { ang: -0.05 });
  const hp = []; for (let x = 0; x <= W; x += 10) hp.push([x, hill(x)]); hp.push([W, H - 10], [0, H - 10]);
  paper(Lsh, L, rng, hp, NIGHT ? '#3F6E86' : '#8CB4AA', { ang: -0.05, lit: NIGHT ? '#4A7C8E' : '#B8D2C4' });
  // the town: houses gathered around a tower with pins down both sides
  const blds = [];
  for (let k = 0; k < 22; k++) { const x = townX + rng.range(-230, 230); blds.push({ x, w: rng.range(24, 44), h: rng.range(30, 70) * Math.max(0.4, 1 - Math.abs(x - townX) / 300), base: hill(x) + rng.range(6, 30) }); }
  blds.push({ x: townX + 20, w: 40, h: 150, base: hill(townX + 20) + 14, tower: true }); blds.sort((a, q) => a.base - q.base);
  for (const bd of blds) {
    const x0 = bd.x - bd.w / 2, y0 = bd.base - bd.h;
    paper(Lsh, L, rng, rect(x0, y0, bd.w, bd.h), bd.tower ? P.purple : rng.pick([P.cream, NIGHT ? '#8C7FA8' : '#F3D6B0', P.cream]), { ang: Math.PI / 2, dens: 1.6 });
    if (bd.tower) { for (let j = 0; j < 9; j++) for (const s of [-1, 1]) pen(Li, rng, [[bd.x + s * bd.w / 2, y0 + 12 + j * 15], [bd.x + s * (bd.w / 2 + 10), y0 + 12 + j * 15]], 2.4, hex(NIGHT ? '#E9E0C8' : '#7E7868'), 0.9, 0.2); pen(Li, rng, [[bd.x, y0], [bd.x, y0 - 34]], 2.2); dot(Li, bd.x, y0 - 37, 5, 'rgb(242,128,110)'); }
    else paper(null, L, rng, [[x0 - 4, y0], [bd.x, y0 - bd.w * 0.5], [x0 + bd.w + 4, y0]], rng.pick([P.red, P.blue, P.red]), { shadow: false, dens: 2 });
    for (let j = 0; j < Math.floor(bd.h / 20); j++) if (rng() < 0.6) { Li.ctx.globalAlpha = NIGHT ? 1 : 0.55; Li.ctx.fillStyle = P.glow; Li.ctx.fillRect(bd.x + rng.range(-0.3, 0.15) * bd.w, y0 + 8 + j * 20, 7, 8); Li.ctx.globalAlpha = 1; }
  }
  // the stars over the town, wired like the one in the hero
  const nodes = [[0.24, 90], [0.3, 60], [0.31, 130], [0.38, 80], [0.4, 150], [0.46, 110]].map(([t, dy]) => [t * W, endTop + dy]);
  [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [1, 4]].forEach(([a, q]) => pen(Li, rng, [nodes[a], nodes[q]], 1.1, NIGHT ? hex('#F7EBC4') : hex('#4A4D5E'), NIGHT ? 0.3 : 0.35, 0.3));
  nodes.forEach((p, k) => NIGHT ? dot(Li, p[0], p[1], k === 5 ? 6 : 4, k === 5 ? 'rgb(246,150,128)' : 'rgb(253,246,220)') : pen(Li, rng, circ(p[0], p[1], k === 5 ? 7 : 5, k === 5 ? 7 : 5, 16), 1.6, hex(k === 5 ? '#B23A2E' : '#4A4D5E'), 0.85, 0.2));
  // the buffer stop at the end of the line
  const bxE = townX + 70, byE = townY;
  paper(Lsh, L, rng, rect(bxE - 150, byE + 16, 160, 12), P.grey, { ang: 0 });
  pen(Li, rng, [[bxE - 14, byE - 6], [bxE + 14, byE + 8]], 5, hex(P.red), 1, 0.3);
  pen(Li, rng, [[bxE - 140, byE + 16], [bxE - 140, byE - 70]], 2.2); dot(Li, bxE - 140, byE - 74, 6, NIGHT ? P.glow : P.ochre, 0.95);
}, 60);

// ---------------- station emblems: one small drawing per track, on the inner side ----------------
const EMB = {};
const E = (name, fn) => { EMB[name] = fn; };
E('How to use this', (c, x, yy) => { pen(c.Li, c.rng, [[x, yy + 50], [x, yy - 46]], 3, P.brown, 0.95); paper(c.Lsh, c.L, c.rng, [[x - 4, yy - 40], [x + 56, yy - 40], [x + 70, yy - 28], [x + 56, yy - 16], [x - 4, yy - 16]], P.ochre, { ang: 0 }); paper(c.Lsh, c.L, c.rng, [[x + 4, yy - 6], [x - 56, yy - 6], [x - 70, yy + 6], [x - 56, yy + 18], [x + 4, yy + 18]], P.sky, { ang: 0 }); });
E('Computing foundations', (c, x, yy) => { const pts = [[x - 60, yy - 34], [x + 44, yy - 34], [x + 60, yy - 18], [x + 60, yy + 34], [x - 60, yy + 34]]; paper(c.Lsh, c.L, c.rng, pts, P.cream, { ang: 0 }); for (let k = 0; k < 8; k++) for (let r = 0; r < 3; r++) if ((k * 3 + r * 5) % 4 !== 1) dot(c.Li, x - 48 + k * 13, yy - 16 + r * 16, 3.2, NIGHT ? '#2B2926' : '#3A3530', 0.85); });
E('CS foundations', (c, x, yy) => { const gw = 64, gh = 64, gx = x - 32; paper(c.Lsh, c.L, c.rng, [[gx, yy - gh / 2], [gx + gw * 0.45, yy - gh / 2], ...circ(gx + gw * 0.45, yy, gw * 0.55, gh / 2, 18, -Math.PI / 2, Math.PI / 2), [gx, yy + gh / 2]], P.teal, { ang: 0.3 }); pen(c.Li, c.rng, [[gx - 26, yy - 14], [gx, yy - 14]], 2); pen(c.Li, c.rng, [[gx - 26, yy + 14], [gx, yy + 14]], 2); pen(c.Li, c.rng, [[gx + gw, yy], [gx + gw + 26, yy]], 2); dot(c.Li, gx + gw + 30, yy, 5, P.red); });
// the seven language houses, each its own
const house = (c, x, yy, { w, h, wall, roof, kind }) => {
  const base = yy + 44, x0 = x - w / 2, y0 = base - h;
  paper(c.Lsh, c.L, c.rng, rect(x0, y0, w, h), wall, { ang: Math.PI / 2, lit: tint(wall, 0.35), litDir: 1 });
  if (kind === 'gable') paper(c.Lsh, c.L, c.rng, [[x0 - 8, y0], [x, y0 - w * 0.55], [x0 + w + 8, y0]], roof, { ang: 0.4 });
  if (kind === 'tall') paper(c.Lsh, c.L, c.rng, [[x0 - 6, y0], [x, y0 - w * 0.9], [x0 + w + 6, y0]], roof, { ang: 0.6 });
  if (kind === 'flat') paper(c.Lsh, c.L, c.rng, rect(x0 - 6, y0 - 10, w + 12, 10), roof, { ang: 0 });
  if (kind === 'dome') paper(c.Lsh, c.L, c.rng, circ(x, y0, w / 2 + 4, w * 0.42, 20, Math.PI, Math.PI * 2), roof, { ang: 0 });
  if (kind === 'saw') paper(c.Lsh, c.L, c.rng, [[x0, y0], [x0, y0 - 20], [x0 + w / 3, y0], [x0 + w / 3, y0 - 20], [x0 + 2 * w / 3, y0], [x0 + 2 * w / 3, y0 - 20], [x0 + w, y0]], roof, { ang: 0.2 });
  if (kind === 'step') { paper(c.Lsh, c.L, c.rng, rect(x0 + 6, y0 - 16, w - 12, 16), roof, { ang: 0 }); paper(c.Lsh, c.L, c.rng, rect(x0 + 16, y0 - 30, w - 32, 14), roof, { ang: 0 }); }
  if (kind === 'chim') { paper(c.Lsh, c.L, c.rng, [[x0 - 8, y0], [x0 + w * 0.3, y0 - 30], [x0 + w + 8, y0 - 30], [x0 + w + 8, y0]], roof, { ang: 0.2 }); paper(c.Lsh, c.L, c.rng, rect(x0 + w * 0.68, y0 - 52, 14, 24), P.brown, { ang: Math.PI / 2 }); for (let k = 0; k < 4; k++) paper(null, c.L, c.rng, circ(x0 + w * 0.7 + 8 + k * 9, y0 - 62 - k * 12, 7 + k * 2, 6 + k * 1.5, 14), NIGHT ? '#6A665E' : '#EDE6D6', { shadow: false, edge: false, dens: 2 }); }
  paper(null, c.L, c.rng, rect(x - 8, base - 26, 16, 26), shade(wall, 0.35), { shadow: false, ang: Math.PI / 2 });
  for (const s of [-1, 1]) { c.Li.ctx.globalAlpha = NIGHT ? 1 : 0.75; c.Li.ctx.fillStyle = P.glow; c.Li.ctx.fillRect(x + s * w * 0.28 - 6, y0 + h * 0.22, 12, 12); c.Li.ctx.globalAlpha = 1; pen(c.Li, c.rng, rect(x + s * w * 0.28 - 6, y0 + h * 0.22, 12, 12).concat([[x + s * w * 0.28 - 6, y0 + h * 0.22]]), 1.1, P.ink, 0.6, 0.2); }
  paper(c.Lsh, c.L, c.rng, rect(x0 - 14, base, w + 28, 7), P.grey, { ang: 0, dens: 0.8 });
};
E('Python', (c, x, yy) => house(c, x, yy, { w: 64, h: 70, wall: P.sky, roof: P.blue, kind: 'tall' }));
E('JavaScript', (c, x, yy) => house(c, x, yy, { w: 86, h: 62, wall: P.ochre, roof: shade(P.ochre, 0.35), kind: 'flat' }));
E('TypeScript', (c, x, yy) => house(c, x, yy, { w: 78, h: 64, wall: P.blue, roof: P.cream, kind: 'gable' }));
E('Go', (c, x, yy) => house(c, x, yy, { w: 80, h: 48, wall: P.teal, roof: tint(P.teal, 0.4), kind: 'dome' }));
E('Rust', (c, x, yy) => house(c, x, yy, { w: 92, h: 56, wall: P.red, roof: P.brown, kind: 'chim' }));
E('C++', (c, x, yy) => house(c, x, yy, { w: 62, h: 84, wall: P.purple, roof: shade(P.purple, 0.3), kind: 'step' }));
E('Low-level memory, SIMD and lock-free code', (c, x, yy) => { const teeth = 10, pts = []; for (let k = 0; k < teeth * 2; k++) { const a = k / (teeth * 2) * Math.PI * 2, r = k % 2 ? 40 : 50; pts.push([x + Math.cos(a) * r, yy + Math.sin(a) * r], [x + Math.cos(a + Math.PI / teeth) * r, yy + Math.sin(a + Math.PI / teeth) * r]); } paper(c.Lsh, c.L, c.rng, pts, P.grey, { ang: 0.5 }); paper(null, c.L, c.rng, circ(x, yy, 16, 16, 20), P.paper, { shadow: false }); });
E('The same problems in five languages', (c, x, yy) => { const cols = [P.sky, P.ochre, P.teal, P.red, P.purple]; cols.forEach((col, k) => paper(c.Lsh, c.L, c.rng, rect(x - 70 + k * 28, yy - 10 - (k % 2) * 8, 24, 40 + (k % 2) * 8), col, { ang: Math.PI / 2, dens: 1.6 })); pen(c.Li, c.rng, [[x - 76, yy + 36], [x + 74, yy + 36]], 1.8, P.ink, 0.7); });
E('Languages calling each other', (c, x, yy) => { for (const s of [-1, 1]) { const cx = x + s * 56; paper(c.Lsh, c.L, c.rng, rect(cx - 16, yy - 6, 32, 40), P.grey, { ang: Math.PI / 2 }); pen(c.Li, c.rng, circ(cx, yy - 6, 16, 5, 18), 1.4, P.ink, 0.7); } pen(c.Li, c.rng, curve([x - 40, yy + 10], [x + 40, yy + 10], 22, 30), 1.4, hex(P.red), 0.9, 0.3); });
E('Build, package, test and observe', (c, x, yy) => { paper(c.Lsh, c.L, c.rng, rect(x - 50, yy - 28, 100, 64), P.brown, { ang: 0, lit: tint(P.brown, 0.3) }); pen(c.Li, c.rng, [[x, yy - 28], [x, yy + 36]], 2.4, hex(P.cream), 0.9); pen(c.Li, c.rng, [[x - 50, yy + 4], [x + 50, yy + 4]], 2.4, hex(P.cream), 0.9); pen(c.Li, c.rng, curve([x - 14, yy - 28], [x + 14, yy - 28], -16, 12), 2, hex(P.cream), 0.9); pen(c.Li, c.rng, [[x + 22, yy + 16], [x + 30, yy + 26], [x + 46, yy + 10]], 3, hex(P.green), 0.95, 0.3); });
E('Machine and operating system', (c, x, yy) => { paper(c.Lsh, c.L, c.rng, rect(x - 40, yy - 40, 80, 80), P.dark, { ang: 0.6 }); for (let k = 0; k < 6; k++) for (const s of [-1, 1]) { pen(c.Li, c.rng, [[x - 32 + k * 13, yy + s * 40], [x - 32 + k * 13, yy + s * 52]], 2.2, hex(NIGHT ? '#E9E0C8' : '#8E887A'), 0.9, 0.2); pen(c.Li, c.rng, [[x + s * 40, yy - 32 + k * 13], [x + s * 52, yy - 32 + k * 13]], 2.2, hex(NIGHT ? '#E9E0C8' : '#8E887A'), 0.9, 0.2); } dot(c.Li, x - 24, yy - 24, 4, P.ochre); });
E('Networking and APIs', (c, x, yy) => { for (const dx of [-60, 60]) { pen(c.Li, c.rng, [[x + dx, yy + 50], [x + dx, yy - 40]], 3, P.brown, 0.95); pen(c.Li, c.rng, [[x + dx - 16, yy - 32], [x + dx + 16, yy - 32]], 2.2, P.brown); } for (const off of [-12, 12]) pen(c.Li, c.rng, curve([x - 60 + off, yy - 32], [x + 60 + off, yy - 32], 18, 20), 1.2, P.ink, 0.75, 0.3); paper(c.Lsh, c.L, c.rng, [[x - 6, yy - 22], [x + 14, yy - 14], [x - 6, yy - 6]], P.ochre, { dens: 3 }); });
E('Data systems', (c, x, yy) => { paper(c.Lsh, c.L, c.rng, [...circ(x, yy - 34, 40, 12, 20, Math.PI, 0), ...circ(x, yy + 34, 40, 12, 20, 0, Math.PI)], P.teal, { ang: Math.PI / 2, lit: tint(P.teal, 0.3) }); for (const o of [-12, 10]) pen(c.Li, c.rng, circ(x, yy + o, 40, 12, 24, 0, Math.PI), 1.4, P.ink, 0.7); paper(null, c.L, c.rng, circ(x, yy - 34, 40, 12, 24), tint(P.teal, 0.4), { shadow: false }); });
E('Distributed systems', (c, x, yy) => { const pts = [[x, yy - 40], [x - 50, yy + 30], [x + 50, yy + 30]]; pts.forEach((p, k) => pen(c.Li, c.rng, [p, pts[(k + 1) % 3]], 1.8, P.ink, 0.75)); pts.forEach((p, k) => paper(c.Lsh, c.L, c.rng, rect(p[0] - 16, p[1] - 14, 32, 28), [P.blue, P.ochre, P.teal][k], { ang: Math.PI / 2, dens: 1.6 })); });
E('Cloud and delivery', (c, x, yy) => { for (let k = 0; k < 4; k++) paper(k ? null : c.Lsh, c.L, c.rng, circ(x - 30 + k * 20, yy - 30 - (k % 2) * 10, 24, 18, 18), NIGHT ? '#6A6680' : '#FDF8EA', { shadow: !k, dens: 1.6 }); pen(c.Li, c.rng, [[x - 6, yy - 12], [x - 2, yy + 20]], 1.2, P.ink, 0.7); pen(c.Li, c.rng, [[x + 10, yy - 12], [x + 6, yy + 20]], 1.2, P.ink, 0.7); paper(c.Lsh, c.L, c.rng, rect(x - 16, yy + 20, 36, 28), P.brown, { ang: 0 }); });
E('Reliability and security', (c, x, yy) => { paper(c.Lsh, c.L, c.rng, [[x - 22, yy + 50], [x - 14, yy - 30], [x + 14, yy - 30], [x + 22, yy + 50]], P.cream, { ang: Math.PI / 2 }); for (const o of [0, 26]) paper(null, c.L, c.rng, [[x - 20 + o * 0.08, yy + 6 + o], [x + 20 - o * 0.08, yy + 6 + o], [x + 21 - o * 0.06, yy + 16 + o], [x - 21 + o * 0.06, yy + 16 + o]], P.red, { shadow: false }); paper(null, c.L, c.rng, rect(x - 16, yy - 50, 32, 20), P.ochre, { shadow: false }); paper(null, c.L, c.rng, [[x - 20, yy - 50], [x, yy - 66], [x + 20, yy - 50]], P.red, { shadow: false }); const g = c.Li.ctx.createLinearGradient(x, yy - 40, x - 90, yy - 40); g.addColorStop(0, 'rgba(247,210,122,0.6)'); g.addColorStop(1, 'rgba(247,210,122,0)'); c.Li.ctx.fillStyle = g; c.Li.ctx.beginPath(); c.Li.ctx.moveTo(x - 16, yy - 42); c.Li.ctx.lineTo(x - 100, yy - 62); c.Li.ctx.lineTo(x - 100, yy - 22); c.Li.ctx.closePath(); c.Li.ctx.fill(); });
E('Math for ML', (c, x, yy) => { paper(c.Lsh, c.L, c.rng, rect(x - 56, yy - 44, 112, 88), P.cream, { ang: 0 }); for (let k = 1; k < 7; k++) { pen(c.Li, c.rng, [[x - 56 + k * 16, yy - 44], [x - 56 + k * 16, yy + 44]], 0.8, hex(P.sky), 0.7, 0.1); if (k < 6) pen(c.Li, c.rng, [[x - 56, yy - 44 + k * 15], [x + 56, yy - 44 + k * 15]], 0.8, hex(P.sky), 0.7, 0.1); } pen(c.Li, c.rng, Array.from({ length: 20 }, (_, k) => { const t = k / 19; return [x - 48 + t * 96, yy + 30 - 64 * Math.sin(t * Math.PI * 0.9) * (0.6 + 0.4 * t)]; }), 2, hex(P.red), 0.9, 0.3); });
E('Machine learning and deep learning', (c, x, yy) => { const L3 = [[x - 46, [-28, 0, 28]], [x, [-36, -12, 12, 36]], [x + 46, [-14, 14]]]; for (let i = 0; i < 2; i++) for (const a of L3[i][1]) for (const b of L3[i + 1][1]) pen(c.Li, c.rng, [[L3[i][0], yy + a], [L3[i + 1][0], yy + b]], 1, P.ink, 0.45, 0.2); L3.forEach(([lx, ys], i) => ys.forEach((o) => paper(i === 0 ? c.Lsh : null, c.L, c.rng, circ(lx, yy + o, 9, 9, 16), i === 2 ? P.red : P.cream, { shadow: i === 0, dens: 3 }))); });
E('Reinforcement learning', (c, x, yy) => { paper(c.Lsh, c.L, c.rng, rect(x - 48, yy - 48, 96, 96), P.cream, { ang: 0 }); const walls = [[[-48, -16], [0, -16]], [[16, -48], [16, 0]], [[-16, 16], [48, 16]], [[-16, 16], [-16, 48]]]; walls.forEach(([a, b]) => pen(c.Li, c.rng, [[x + a[0], yy + a[1]], [x + b[0], yy + b[1]]], 3, P.ink, 0.8)); pen(c.Li, c.rng, [[x - 32, yy + 32], [x - 32, yy - 2], [x + 2, yy - 2], [x + 2, yy - 32], [x + 32, yy - 32]], 1.6, hex(P.blue), 0.7, 0.4); const star = Array.from({ length: 11 }, (_, k) => { const a = -Math.PI / 2 + k / 10 * Math.PI * 2, r = k % 2 ? 5 : 12; return [x + 32 + Math.cos(a) * r, yy - 32 + Math.sin(a) * r]; }); paper(null, c.L, c.rng, star, P.ochre, { shadow: false, dens: 4 }); });
E('LLM architecture, training and post-training', (c, x, yy) => { for (let k = 0; k < 4; k++) paper(c.Lsh, c.L, c.rng, rect(x - 44, yy + 30 - k * 24, 88, 20), [P.blue, P.teal, P.blue, P.teal][k], { ang: 0, dens: 1.5 }); pen(c.Li, c.rng, [[x + 54, yy + 44], [x + 54, yy - 60]], 1.6, P.ink, 0.7); pen(c.Li, c.rng, [[x + 48, yy - 52], [x + 54, yy - 62], [x + 60, yy - 52]], 1.6, P.ink, 0.7); for (let k = 0; k < 5; k++) paper(null, c.L, c.rng, rect(x - 44 + k * 18, yy - 70, 14, 14), P.cream, { shadow: false, dens: 3 }); });
E('GPU computing and inference engineering', (c, x, yy) => { paper(c.Lsh, c.L, c.rng, rect(x - 64, yy - 34, 128, 62), P.grey, { ang: 0 }); paper(null, c.L, c.rng, circ(x - 28, yy - 3, 22, 22, 24), NIGHT ? '#3A3833' : '#5A5560', { shadow: false }); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; pen(c.Li, c.rng, curve([x - 28, yy - 3], [x - 28 + Math.cos(a) * 20, yy - 3 + Math.sin(a) * 20], 4, 6), 2, hex(P.cream), 0.8, 0.2); } for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) paper(null, c.L, c.rng, rect(x + 6 + i * 13, yy - 22 + j * 14, 10, 10), P.ochre, { shadow: false, dens: 3, edge: false }); for (let k = 0; k < 8; k++) pen(c.Li, c.rng, [[x - 50 + k * 10, yy + 28], [x - 50 + k * 10, yy + 38]], 3, hex(P.ochre), 0.9, 0.1); });
E('Applied AI systems', (c, x, yy) => { paper(c.Lsh, c.L, c.rng, rect(x - 56, yy - 6, 112, 48), P.red, { ang: 0 }); pen(c.Li, c.rng, [[x - 20, yy - 6], [x - 20, yy - 22], [x + 20, yy - 22], [x + 20, yy - 6]], 3, P.ink, 0.85); pen(c.Li, c.rng, [[x - 56, yy + 10], [x + 56, yy + 10]], 1.6, P.ink, 0.6); pen(c.Li, c.rng, [[x - 30, yy - 10], [x - 46, yy - 50]], 4, hex(P.grey), 0.95); paper(null, c.L, c.rng, circ(x - 48, yy - 54, 9, 7, 12), P.grey, { shadow: false }); pen(c.Li, c.rng, [[x + 28, yy - 10], [x + 44, yy - 46]], 3, hex(P.brown), 0.95); paper(null, c.L, c.rng, rect(x + 34, yy - 60, 22, 12), P.grey, { shadow: false }); });
E('Safety, security and interpretability', (c, x, yy) => { const pts = [[x - 30, yy - 20], [x - 6, yy - 34], [x + 10, yy - 8], [x - 18, yy + 4], [x + 24, yy - 26]]; [[0, 1], [1, 2], [2, 3], [0, 3], [1, 4], [2, 4]].forEach(([a, b]) => pen(c.Li, c.rng, [pts[a], pts[b]], 1.2, P.ink, 0.5)); pts.forEach((p) => dot(c.Li, p[0], p[1], 4, P.ink, 0.8)); paper(null, c.L, c.rng, circ(x - 4, yy - 14, 40, 40, 30), NIGHT ? '#5A6FA8' : '#DDE8EE', { shadow: false, edge: false, dens: 0.6 }); pen(c.Li, c.rng, circ(x - 4, yy - 14, 40, 40, 30), 4, hex(P.brown), 0.9); pen(c.Li, c.rng, [[x + 24, yy + 14], [x + 56, yy + 46]], 8, hex(P.brown), 0.95); });
E('Papers lab', (c, x, yy) => { for (let k = 0; k < 3; k++) paper(c.Lsh, c.L, c.rng, rect(x - 44 + k * 8, yy - 40 + k * 10, 70, 86), P.cream, { ang: 0 }); for (let k = 0; k < 6; k++) pen(c.Li, c.rng, [[x - 20, yy - 6 + k * 10], [x + 26 - (k === 5 ? 20 : 0), yy - 6 + k * 10]], 1.2, P.graphite, 0.7, 0.4); const pl = [[x + 56, yy - 54], [x + 16, yy - 60], [x + 26, yy - 50], [x + 18, yy - 38]]; paper(c.Lsh, c.L, c.rng, pl, P.cream, { dens: 3 }); });
E('Statechart Studio', (c, x, yy) => { pen(c.Li, c.rng, [[x - 40, yy + 56], [x - 10, yy - 50]], 3, P.brown); pen(c.Li, c.rng, [[x + 40, yy + 56], [x + 10, yy - 50]], 3, P.brown); paper(c.Lsh, c.L, c.rng, rect(x - 52, yy - 44, 104, 72), P.cream, { ang: 0 }); for (const [cx, cy] of [[x - 26, yy - 20], [x + 22, yy - 20], [x, yy + 10]]) pen(c.Li, c.rng, circ(cx, cy, 13, 9, 16), 1.6, hex(P.blue), 0.9, 0.2); pen(c.Li, c.rng, [[x - 13, yy - 20], [x + 9, yy - 20]], 1.4, P.ink, 0.7); pen(c.Li, c.rng, [[x + 18, yy - 11], [x + 6, yy + 4]], 1.4, P.ink, 0.7); dot(c.Li, x + 22, yy - 20, 4, 'rgb(233,185,73)'); });
E('Capstones in your languages', (c, x, yy) => { paper(c.Lsh, c.L, c.rng, rect(x - 40, yy - 20, 80, 64), P.cream, { ang: Math.PI / 2 }); paper(c.Lsh, c.L, c.rng, rect(x - 18, yy - 56, 36, 36), P.purple, { ang: Math.PI / 2 }); pen(c.Li, c.rng, [[x, yy - 56], [x, yy - 86]], 1.8); paper(null, c.L, c.rng, [[x, yy - 86], [x + 26, yy - 79], [x, yy - 72]], P.red, { shadow: false, dens: 3 }); for (let k = 0; k < 3; k++) { c.Li.ctx.globalAlpha = NIGHT ? 1 : 0.7; c.Li.ctx.fillStyle = P.glow; c.Li.ctx.fillRect(x - 30 + k * 22, yy - 6, 12, 12); c.Li.ctx.globalAlpha = 1; } });
E('Capstones in AI systems', (c, x, yy) => { pen(c.Li, c.rng, [[x - 30, yy + 50], [x, yy - 50], [x + 30, yy + 50]], 2.4, P.ink, 0.85); for (let k = 1; k < 5; k++) pen(c.Li, c.rng, [[x - 30 + k * 6, yy + 50 - k * 20], [x + 30 - k * 6, yy + 50 - k * 20]], 1.4, P.ink, 0.7); dot(c.Li, x, yy - 54, 6, 'rgb(242,128,110)'); for (const r of [14, 24, 34]) for (const s of [-1, 1]) pen(c.Li, c.rng, circ(x, yy - 54, r, r, 8, s > 0 ? -Math.PI / 4 : Math.PI * 0.75, s > 0 ? Math.PI / 4 : Math.PI * 1.25), 1.4, hex(P.red), 0.7, 0.2); });

// platforms, lamp posts and emblems at every station; emblem sits between the track and the page centre's far side
const layout = { width: W, height: H, mode: MODE, bands: [], stations: [], end: { top: endTop, h: END_H } };
bands.forEach((b, i) => layout.bands.push({ part: b.part, top: b.top, h: b.h, pass: bandPass[i] }));
for (const s of stations) {
  const st = ST[s.i], dir = s.side === 'left' ? 1 : -1, ex = s.x + dir * 200;
  band(s.y - 110, s.y + 110, (c) => {
    // a platform slab on the card side of the track
    const px = s.x - dir * 22;
    paper(c.Lsh, c.L, c.rng, [[px - 6 * dir, s.y - 40], [px - 20 * dir, s.y - 40], [px - 20 * dir, s.y + 40], [px - 6 * dir, s.y + 40]].map(([u, v]) => [u, v]), P.grey, { ang: Math.PI / 2, dens: 1.3 });
    pen(c.Li, c.rng, [[px - 13 * dir, s.y + 36], [px - 13 * dir, s.y - 52]], 1.8, P.ink, 0.8); dot(c.Li, px - 13 * dir, s.y - 55, 4.5, NIGHT ? P.glow : P.ochre, 0.95);
    if (EMB[st.name]) EMB[st.name](c, ex, s.y); else console.warn('no emblem for', st.name);
  }, 100 + s.i);
  layout.stations.push({ index: s.i, name: st.name, part: st.part || null, x: s.x, y: s.y, side: s.side, emblem: [ex, s.y] });
}

// the track goes on last so it runs over the scenes; then the train at the current station
for (let y0 = 0; y0 < H; y0 += 1500) drawTrack(y0, Math.min(H, y0 + 1500));
const cur = stations.find((s) => ST[s.i].current);
if (cur) {
  const k0 = PATH.reduce((best, p, i) => (Math.hypot(p[0] - cur.x, p[1] - (cur.y - 40)) < Math.hypot(PATH[best][0] - cur.x, PATH[best][1] - (cur.y - 40)) ? i : best), 0);
  band(cur.y - 200, cur.y + 120, ({ Li, rng }) => {
    for (let car = 0; car < 4; car++) {
      const p = PATH[Math.max(0, k0 - car * 7)], q = PATH[Math.max(0, k0 - car * 7 - 2)];
      const ang = Math.atan2(p[1] - q[1], p[0] - q[0]), ctx = Li.ctx; ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(ang - Math.PI / 2);
      // cars ride along the track, which runs down the page here: draw them side-on to the track direction
      const w = 22, h = 38; ctx.fillStyle = car === 0 ? P.red : P.blue; ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = rgb(P.ink); ctx.lineWidth = 1.6; ctx.strokeRect(-w / 2, -h / 2, w, h);
      if (car === 0) { ctx.fillStyle = 'rgb(38,35,27)'; ctx.beginPath(); ctx.arc(0, h / 2 - 8, 5, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = 'rgb(247,210,122)'; ctx.fillRect(-w / 2 + 4, -h / 2 + 5, w - 8, h - 10); }
      ctx.restore();
    }
    const head = PATH[k0];
    for (let i = 0; i < 46; i++) mark(Li.ctx, rng, head[0] + 10 + i * 1.6 + rng.gauss() * 4, head[1] + 8 - i * 1.3 + rng.gauss() * 3, rng() * 6, rng.range(4, 10), rng.range(2, 4), hex(NIGHT ? '#BDB6A8' : '#FDF3D0'), 0.7);
  }, 999);
  layout.current = { index: cur.i, x: cur.x, y: cur.y };
}

const out = path.join(OUT, `line-${MODE}`);
const c = sheet.finish(out, 0);
fs.writeFileSync(out + '.jpg', c.toBuffer('image/jpeg', 86));
fs.writeFileSync(path.join(OUT, `layout-${MODE}.json`), JSON.stringify(layout, null, 1));
console.log('drew line', MODE, W, H);
