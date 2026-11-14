// "Off the map": the 404 picture. The notebook page is torn through, the railway runs off the edge of the paper,
// and on the far side the line carries on to a small town. The gap is left empty on purpose: the 404 page lets the
// reader draw the missing track across it, then a train rolls over. Original work, drawn stroke by stroke.
// node art/lost.js [day|night]  ->  art/out/lost-<mode>.jpg, art/out/lost-geometry.json
const fs = require('fs');
const path = require('path');
const { Sheet, makeRng, hex, rgb, mix, mark, line, curve } = require('./kit');
const NIGHT = process.argv[2] === 'night';
const W = 1600, H = 1000;
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });

const P = NIGHT
  ? { paper: '#2C2A27', ink: hex('#E8E0D0'), graphite: hex('#CFC7B8'), rail: hex('#D9D0BF'), tie: hex('#8A6A4E'), rule: '#3B3934', grid: '#36342F', red: '#C24A3A', blue: '#3D52B0', ochre: '#E2AE3E', teal: '#4A8A86', purple: '#8E7FB4', grey: '#9E988E', cream: '#F4EAD2', glow: 'rgb(247,210,122)' }
  : { paper: '#FBF4DC', ink: hex('#3A3530'), graphite: hex('#55535C'), rail: hex('#4A4046'), tie: hex('#8A6A4E'), rule: '#C9D6E4', grid: '#D3DBE5', red: '#C24A3A', blue: '#3D52B0', ochre: '#E2AE3E', teal: '#5E9A8E', purple: '#9A86B8', grey: '#B3ADA2', cream: '#FBF0D4', glow: 'rgb(247,210,122)' };
const sheet = new Sheet(W, H, P.paper, 404), R = makeRng(404), N = sheet.noise;
const fam = (h) => [hex(h), mix(hex(h), [255, 250, 235], 0.14), mix(hex(h), [0, 0, 0], 0.1)];
const poly = (pts) => (ctx) => { pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const circ = (cx, cy, rx, ry = rx, n = 40, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const bbox = (pts) => { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
const pen = (L, rng, pts, w = 1.8, col = P.ink, a = 0.85, wob = 0.5) => line(L.ctx, rng, pts, w, typeof col === 'string' ? hex(col) : col, a, wob);
function paper(Lsh, L, rng, pts, col, { ang = -0.1, edge = true, dens = 1, lit = null } = {}) {
  const b = bbox(pts), n = Math.max(12, Math.round((b[2] - b[0]) * (b[3] - b[1]) / 70 * dens));
  if (Lsh) { Lsh.ctx.save(); Lsh.ctx.translate(5, 7); Lsh.ctx.fillStyle = 'rgba(70,55,45,0.28)'; Lsh.ctx.beginPath(); poly(pts)(Lsh.ctx); Lsh.ctx.fill(); Lsh.ctx.restore(); }
  const ctx = L.ctx; ctx.save(); ctx.beginPath(); poly(pts)(ctx); ctx.clip();
  ctx.fillStyle = rgb(hex(col)); ctx.globalAlpha = 0.6; ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]); ctx.globalAlpha = 1;
  const F = fam(col), Lt = lit ? fam(lit) : null;
  for (let i = 0; i < n; i++) { const x = rng.range(b[0] - 4, b[2] + 4), y = rng.range(b[1] - 4, b[3] + 4); mark(ctx, rng, x, y, ang + rng.gauss() * 0.12, rng.range(10, 26), rng.range(3, 6), rng.pick(Lt && x > (b[0] + b[2]) / 2 && rng() < 0.7 ? Lt : F), 0.95); }
  ctx.restore();
  if (edge) line(ctx, rng, [...pts, pts[0]], 1.6, P.ink, 0.6, 0.5);
}
function layers(fn, seed) { const Lsh = sheet.layer(), L = sheet.layer(), Li = sheet.layer(), rng = R.fork(seed); fn({ Lsh, L, Li, rng }); sheet.lay(Lsh, 1.1, 3, 0.75); sheet.lay(L, 0.92, 7); sheet.lay(Li, 0.95, 8); }

// ---------- the page: lamplight, paper strokes, a grid on the left, ruled lines on the right ----------
{
  const L = sheet.layer(), ctx = L.ctx;
  const lamp = ctx.createRadialGradient(0.18 * W, 0.2 * H, 0, 0.18 * W, 0.2 * H, 1.1 * W);
  lamp.addColorStop(0, NIGHT ? 'rgba(248,214,150,0.13)' : 'rgba(248,226,170,0.22)'); lamp.addColorStop(1, NIGHT ? 'rgba(10,10,20,0.35)' : 'rgba(150,130,100,0.14)');
  ctx.fillStyle = lamp; ctx.fillRect(0, 0, W, H);
  sheet.lay(L, 1.2, 4);
  const P2 = sheet.layer(), rng = R.fork(1);
  for (let i = 0; i < 3800; i++) mark(P2.ctx, rng, rng() * W, rng() * H, rng.gauss() * 0.05, rng.range(40, 120), rng.range(6, 12), hex(rng.pick(NIGHT ? ['#34312D', '#2F2C29', '#383530'] : ['#F8E8C2', '#FBF0D4', '#F4ECD6'])), 0.45);
  sheet.lay(P2, 0.7, 5, 0.6);
  const G = sheet.layer(), rg = R.fork(2);
  for (let y = 26; y < H; y += 30) line(G.ctx, rg, curve([0.02 * W, y], [0.98 * W, y + 2], 0, 40), 1, hex(P.rule), 0.55, 0.25);
  for (let x = 0.02 * W; x < 0.12 * W; x += 30) line(G.ctx, rg, [[x, 0], [x + 2, H]], 1, hex(P.grid), 0.45, 0.2);
  line(G.ctx, rg, [[0.06 * W, 0], [0.061 * W, H]], 1.4, hex(NIGHT ? '#8A4A44' : '#D9877E'), 0.55, 0.3);
  sheet.lay(G, 0.85, 6);
}

// ---------- the line: runs in from the left, stops at the tear; resumes on the far side and climbs to a town ----------
const LEFT = []; for (let i = 0; i <= 60; i++) { const t = i / 60; LEFT.push([-10 + t * (0.497 * W + 10), 0.8 * H - 0.06 * H * Math.sin(t * Math.PI * 0.9) - t * 0.02 * H]); }
const leftEnd = LEFT[LEFT.length - 1];
const rightStart = [0.706 * W, 0.7 * H];
const townAt = [0.9 * W, 0.47 * H];
const RIGHT = []; { const c1 = [0.78 * W, 0.71 * H], c2 = [0.8 * W, 0.5 * H]; for (let i = 0; i <= 60; i++) { const t = i / 60, u = 1 - t; RIGHT.push([u * u * u * rightStart[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * townAt[0], u * u * u * rightStart[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * townAt[1]]); } }

// the far side: a cut-paper hill with the town, and a cow, because someone always asks for a cow
layers(({ Lsh, L, Li, rng }) => {
  const hill = (x) => 0.58 * H - 0.15 * H * Math.exp(-Math.pow((x - 0.9 * W) / 190, 2)) + 0.025 * H * Math.sin(x / W * 9);
  const hp = []; for (let x = 0.6 * W; x <= W + 10; x += 8) hp.push([x, hill(x)]); hp.push([W + 10, H + 10], [0.6 * W, H + 10]);
  paper(Lsh, L, rng, hp, NIGHT ? '#5E8C6E' : '#9DBA86', { ang: -0.05, lit: NIGHT ? '#6E9A78' : '#B8CFA0' });
  const blds = []; for (let k = 0; k < 9; k++) { const x = townAt[0] + rng.range(-90, 90); blds.push({ x, w: rng.range(20, 34), h: rng.range(26, 54), base: hill(x) + rng.range(4, 16) }); }
  blds.push({ x: townAt[0] + 14, w: 30, h: 96, base: hill(townAt[0] + 14) + 8, tower: true }); blds.sort((a, b) => a.base - b.base);
  for (const b of blds) {
    const x0 = b.x - b.w / 2, y0 = b.base - b.h;
    paper(Lsh, L, rng, rect(x0, y0, b.w, b.h), b.tower ? P.purple : P.cream, { ang: Math.PI / 2, dens: 1.6 });
    if (b.tower) { for (let j = 0; j < 6; j++) for (const s of [-1, 1]) pen(Li, rng, [[b.x + s * b.w / 2, y0 + 10 + j * 14], [b.x + s * (b.w / 2 + 8), y0 + 10 + j * 14]], 2.2, '#7E7868', 0.9, 0.2); pen(Li, rng, [[b.x, y0], [b.x, y0 - 26]], 2); Li.ctx.fillStyle = 'rgb(242,128,110)'; Li.ctx.beginPath(); Li.ctx.arc(b.x, y0 - 29, 4.5, 0, 7); Li.ctx.fill(); }
    else paper(null, L, rng, [[x0 - 4, y0], [b.x, y0 - b.w * 0.5], [x0 + b.w + 4, y0]], rng.pick([P.red, P.blue]), { dens: 2 });
    Li.ctx.globalAlpha = NIGHT ? 1 : 0.6; Li.ctx.fillStyle = P.glow; Li.ctx.fillRect(b.x - 3, y0 + 10, 6, 7); Li.ctx.globalAlpha = 1;
  }
  // the cow: cut-paper body, patches, legs, a tail, mid-chew
  const cx = 0.82 * W, cy = 0.8 * H;
  paper(Lsh, L, rng, [...circ(cx, cy, 34, 20, 24)], P.cream, { ang: 0, dens: 2 });
  paper(null, L, rng, circ(cx - 10, cy - 4, 11, 8, 14), '#3A3530', { edge: false, dens: 3 });
  paper(null, L, rng, circ(cx + 16, cy + 6, 8, 6, 12), '#3A3530', { edge: false, dens: 3 });
  paper(Lsh, L, rng, [[cx + 30, cy - 12], [cx + 52, cy - 16], [cx + 56, cy - 2], [cx + 36, cy + 4]], P.cream, { ang: 0, dens: 3 });
  paper(null, L, rng, circ(cx + 55, cy - 7, 6, 5, 10), '#E8A0AC', { edge: false, dens: 4 });
  for (const dx of [-22, -10, 12, 24]) pen(Li, rng, [[cx + dx, cy + 16], [cx + dx + 1, cy + 34]], 3.2, '#3A3530', 0.9, 0.2);
  pen(Li, rng, curve([cx - 34, cy - 4], [cx - 46, cy + 18], -8, 8), 1.6, '#3A3530', 0.8, 0.3);
  pen(Li, rng, [[cx + 36, cy - 14], [cx + 34, cy - 22]], 2, '#3A3530', 0.8, 0.2); pen(Li, rng, [[cx + 46, cy - 16], [cx + 48, cy - 24]], 2, '#3A3530', 0.8, 0.2);
  for (let k = 0; k < 6; k++) pen(Li, rng, [[cx + 58 + k * 4, cy + 34], [cx + 60 + k * 4, cy + 24 - (k % 2) * 6]], 1.4, NIGHT ? '#5E8C6E' : '#6E9A60', 0.9, 0.2);
}, 20);

// ---------- the tear: a ragged hole through the page ----------
const HOLE = [];
{
  const cx = 0.6 * W, cy = 0.74 * H, rx = 0.105 * W, ry = 0.3 * H;
  const tr = R.fork(9);
  for (let i = 0; i < 160; i++) {
    const a = i / 160 * Math.PI * 2, wob = 1 + 0.22 * (N.fbm(Math.cos(a) * 1.6 + 5, Math.sin(a) * 1.6 + 5, 3) - 0.5) * 2 + tr.range(-0.035, 0.035) * (tr() < 0.35 ? 2.2 : 1);
    HOLE.push([cx + Math.cos(a) * rx * wob, Math.min(H + 40, cy + Math.sin(a) * ry * wob)]);
  }
}
{
  // what is beyond the page: sky by day, stars by night
  const L = sheet.layer(), ctx = L.ctx, rng = R.fork(10), b = bbox(HOLE);
  ctx.save(); ctx.beginPath(); poly(HOLE)(ctx); ctx.clip();
  const g = ctx.createLinearGradient(0, b[1], 0, b[3]);
  if (NIGHT) { g.addColorStop(0, '#1B1F45'); g.addColorStop(1, '#2A3270'); } else { g.addColorStop(0, '#8FB0C8'); g.addColorStop(1, '#F2D6C0'); }
  ctx.fillStyle = g; ctx.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
  const cols = NIGHT ? ['#232A62', '#2E3A80', '#1E2350'] : ['#9DBBD0', '#B4CAD8', '#F6E3B8'];
  for (let i = 0; i < 2600; i++) { const x = rng.range(b[0], b[2]), y = rng.range(b[1], b[3]); mark(ctx, rng, x, y, -0.1 + rng.gauss() * 0.06, rng.range(16, 50), rng.range(4, 9), hex(rng.pick(cols)), 0.8); }
  if (NIGHT) for (let i = 0; i < 70; i++) { ctx.fillStyle = 'rgb(253,243,208)'; ctx.globalAlpha = rng.range(0.3, 0.9); ctx.beginPath(); ctx.arc(rng.range(b[0], b[2]), rng.range(b[1], b[3]), rng.range(0.8, 2.2), 0, 7); ctx.fill(); }
  else for (const [x, y] of [[b[0] + 70, b[1] + 220], [b[0] + 190, b[1] + 380]]) for (let k = 0; k < 5; k++) { ctx.fillStyle = 'rgba(253,248,234,0.9)'; ctx.beginPath(); ctx.ellipse(x + (k - 2) * 18, y - (k % 2) * 9, 18, 12, 0, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.restore();
  sheet.lay(L, 1.2, 4);
  // the torn rim: pale fibres and a shadow on the inside edge
  const T = sheet.layer(), rt = R.fork(11);
  T.ctx.save(); T.ctx.beginPath(); poly(HOLE)(T.ctx); T.ctx.clip();
  T.ctx.strokeStyle = 'rgba(20,18,30,0.35)'; T.ctx.lineWidth = 22; T.ctx.beginPath(); poly(HOLE)(T.ctx); T.ctx.stroke(); T.ctx.restore();
  for (let i = 0; i < HOLE.length; i++) { const p = HOLE[i], q = HOLE[(i + 1) % HOLE.length]; for (let k = 0; k < 3; k++) mark(T.ctx, rt, p[0] + (q[0] - p[0]) * k / 3, p[1] + (q[1] - p[1]) * k / 3, Math.atan2(q[1] - p[1], q[0] - p[0]), 12, 4, hex('#FFF8E6'), 0.9); }
  pen(T, rt, [...HOLE, HOLE[0]], 1.4, P.ink, 0.5, 0.6);
  sheet.lay(T, 0.95, 7);
}

// the railway, both halves; the left half is pencil at the far edge and real track by the tear
function drawTrack(pts, seed, realFrom) {
  const T = sheet.layer(), rng = R.fork(seed);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i], q = pts[i - 1], t = i / pts.length, ang = Math.atan2(p[1] - q[1], p[0] - q[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
    const real = realFrom === null ? 1 : Math.min(1, Math.max(0, (t - realFrom) / 0.3)), gauge = 2 + real * 7, col = mix(P.graphite, P.rail, real);
    for (const s of real > 0.05 ? [-1, 1] : [0]) line(T.ctx, rng, [[q[0] + nx * gauge * s, q[1] + ny * gauge * s], [p[0] + nx * gauge * s, p[1] + ny * gauge * s]], 1.8 + real * 0.7, col, 0.9, 0.22);
    if (real > 0.3 && i % 2 === 0) mark(T.ctx, rng, p[0], p[1], ang + Math.PI / 2, gauge * 2.6, 3, P.tie, 0.85 * real);
  }
  sheet.lay(T, 0.96, 7);
}
drawTrack(LEFT, 30, 0.05);
drawTrack(RIGHT, 31, null);
layers(({ Li, rng }) => {
  // the rails at the tear are bent where the paper gave way
  pen(Li, rng, [[leftEnd[0] - 4, leftEnd[1] - 9], [leftEnd[0] + 10, leftEnd[1] - 16]], 2.4, P.rail, 0.9, 0.2);
  pen(Li, rng, [[leftEnd[0] - 4, leftEnd[1] + 9], [leftEnd[0] + 12, leftEnd[1] + 16]], 2.4, P.rail, 0.9, 0.2);
  pen(Li, rng, [[rightStart[0] + 4, rightStart[1] - 9], [rightStart[0] - 10, rightStart[1] - 15]], 2.4, P.rail, 0.9, 0.2);
  // a lost signpost: three arrows, each pointing somewhere different, each with a question mark
  const sx = 0.24 * W, sy = 0.73 * H;
  pen(Li, rng, [[sx, sy + 6], [sx + 2, sy - 150]], 4, P.tie, 0.95, 0.3);
  const arrows = [[-0.15, 1, P.ochre], [0.35, -1, '#9DBBD0'], [-0.5, 1, P.red]];
  arrows.forEach(([ang, dir, col], k) => {
    const y = sy - 132 + k * 34, len = 92, c = Math.cos(ang), s = Math.sin(ang);
    const pts = [[0, -11], [len - 16, -11], [len, 0], [len - 16, 11], [0, 11]].map(([u, v]) => [sx + dir * (u * c - v * s), y + (u * s + v * c)]);
    const L2 = sheet.layer(); paper(null, L2, rng, pts, col, { ang, dens: 2 }); sheet.lay(L2, 0.92, 7);
    const qx = sx + dir * 46 * c, qy = y + 46 * s;
    pen(Li, rng, [...circ(qx, qy - 3, 4.5, 4.5, 10, -Math.PI, Math.PI * 0.4), [qx + 0.5, qy + 3]], 1.6, P.ink, 0.85, 0.15);
    Li.ctx.fillStyle = rgb(P.ink); Li.ctx.beginPath(); Li.ctx.arc(qx + 0.5, qy + 7, 1.4, 0, 7); Li.ctx.fill();
  });
  // pencil question marks in the margin, the way anyone doodles when they're lost
  for (const [x, y, s] of [[0.03 * W, 0.62 * H, 1.4], [0.035 * W, 0.86 * H, 1], [0.97 * W, 0.12 * H, 1.2], [0.42 * W, 0.92 * H, 0.9]]) {
    pen(Li, rng, [...circ(x, y - 8 * s, 9 * s, 9 * s, 14, -Math.PI, Math.PI * 0.45), [x + 1, y + 6 * s]], 1.6, P.graphite, 0.75, 0.3);
    Li.ctx.fillStyle = rgb(P.graphite); Li.ctx.beginPath(); Li.ctx.arc(x + 1, y + 13 * s, 1.8, 0, 7); Li.ctx.fill();
  }
  // a blue-pencil dashed guide across the gap, the way you'd mark where something should go
  for (let k = 0; k < 9; k++) { const t0 = k / 9 + 0.02, t1 = t0 + 0.06; const P0 = [leftEnd[0] + (rightStart[0] - leftEnd[0]) * t0, leftEnd[1] + (rightStart[1] - leftEnd[1]) * t0 - 40 * Math.sin(t0 * Math.PI)], P1 = [leftEnd[0] + (rightStart[0] - leftEnd[0]) * t1, leftEnd[1] + (rightStart[1] - leftEnd[1]) * t1 - 40 * Math.sin(t1 * Math.PI)]; pen(Li, rng, [P0, P1], 2, P.blue, 0.55, 0.3); }
}, 40);

// ---------- the room is darker beyond the lamp at night ----------
{
  const L = sheet.layer(), v = L.ctx.createRadialGradient(0.3 * W, 0.35 * H, 0.3 * W, 0.5 * W, 0.5 * H, 0.95 * W);
  v.addColorStop(0, 'rgba(20,18,40,0)'); v.addColorStop(1, NIGHT ? 'rgba(20,18,40,0.6)' : 'rgba(60,50,40,0.16)');
  L.ctx.fillStyle = v; L.ctx.fillRect(0, 0, W, H); sheet.lay(L, 1.2, 4, 0.8);
}

const mode = NIGHT ? 'night' : 'day';
const c = sheet.finish(path.join(OUT, `lost-${mode}`), 0);
fs.writeFileSync(path.join(OUT, `lost-${mode}.jpg`), c.toBuffer('image/jpeg', 86));
fs.unlinkSync(path.join(OUT, `lost-${mode}.png`));
const r1 = (p) => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10];
fs.writeFileSync(path.join(OUT, 'lost-geometry.json'), JSON.stringify({ width: W, height: H, leftTrack: LEFT.slice(-14).map(r1), leftEnd: r1(leftEnd), rightStart: r1(rightStart), rightTrack: RIGHT.map(r1), hole: HOLE.map(r1) }));
console.log('drew lost', mode);
