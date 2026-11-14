// "The page that runs": a notebook diagram whose pencil line becomes a railway, climbing out of the page
// into a pop-up landscape; the stars above it are wired like a small network. Original work.
// node art/soul.js [width] [day]  ->  art/out/soul-[day-]<width>.png (the hero picture; the site uses the 2560 render)
const { Sheet, makeRng, hex, mix, mark, line, curve } = require('./kit');
const DAY = process.argv[3] === 'day';
const W = +(process.argv[2] || 1600), H = Math.round(W * 9 / 16), S = H / 1440;
const sheet = new Sheet(W, H, DAY ? '#9DB7CC' : '#2A3270', 2026);
const N = sheet.noise, R = makeRng(2026);
const C = (a) => a.map(hex);
const PAGE_Y = (x) => H * (0.70 - 0.014 * Math.sin((x / W) * Math.PI)); // top edge of the open notebook

function hatch(L, rng, clipFn, box, n, colFn, angFn, lenR, wR, alpha = 0.92) {
  const ctx = L.ctx; ctx.save(); ctx.beginPath(); clipFn(ctx); ctx.clip();
  for (let i = 0; i < n; i++) {
    const x = rng.range(box[0], box[2]), y = rng.range(box[1], box[3]);
    mark(ctx, rng, x, y, angFn(x, y), rng.range(...lenR) * S, rng.range(...wR) * S, colFn(x, y), alpha);
  }
  ctx.restore();
}
const poly = (pts) => (ctx) => { pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); };
const area = (k) => Math.round(k * (W / 1600) ** 2);

// ---------- sky: indigo overhead, rose in the middle, butter at the horizon ----------
const SKY = DAY ? { top: C(['#8FB0C8', '#9DBBD0', '#86A8C2']), mid: C(['#B4CAD8', '#C2D4DF', '#A9C2D3']), rose: C(['#F2D6C0', '#EFCDB8', '#E9D2C6']), low: C(['#F6E3B8', '#F8EAC6', '#F3DDB0']), glow: C(['#FBF1D2', '#FDF5DC', '#F9EDC6']) } : { top: C(['#27306E', '#2E3A80', '#232A62']), mid: C(['#5D4F92', '#7A5C9C', '#6A5596']), rose: C(['#C9789A', '#E1868C', '#D07F96']), low: C(['#F3B08E', '#F6C88C', '#F2BC98']), glow: C(['#F8E3B0', '#F7EBC4', '#F9DFA0']) };
function skyCol(x, y, rng) {
  const t = y / (0.56 * H) + (N.fbm(x * 0.0016, y * 0.003, 3) - 0.5) * 0.22;
  if (t < 0.32) return rng.pick(SKY.top);
  if (t < 0.5) return rng.pick(rng() < (t - 0.32) / 0.18 ? SKY.mid : SKY.top);
  if (t < 0.66) return rng.pick(rng() < (t - 0.5) / 0.16 ? SKY.rose : SKY.mid);
  if (t < 0.82) return rng.pick(rng() < (t - 0.66) / 0.16 ? SKY.low : SKY.rose);
  return rng.pick(rng() < 0.5 ? SKY.glow : SKY.low);
}
for (const [pass, n, lr, wr] of [[0, 9000, [80, 170], [16, 30]], [1, 20000, [30, 90], [6, 14]], [2, 9000, [14, 36], [3, 7]]]) {
  const L = sheet.layer(), rng = R.fork(pass + 1);
  for (let i = 0; i < area(n); i++) {
    const x = rng.range(-40, W + 40), y = rng.range(-40, 0.62 * H);
    mark(L.ctx, rng, x, y, -0.1 + rng.gauss() * 0.06 + (N(x * 0.002, y * 0.003) - 0.5) * 0.2, rng.range(...lr) * S, rng.range(...wr) * S, skyCol(x, y, rng), 0.9);
  }
  sheet.lay(L, 0.74 + pass * 0.05, 5);
}

// ---------- the sun, low, half behind the hills ----------
{
  const L = sheet.layer(), rng = R.fork(10), cx = 0.8 * W, cy = 0.5 * H, r = 0.105 * H;
  const halo = L.ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 3.2);
  halo.addColorStop(0, 'rgba(249,223,160,0.55)'); halo.addColorStop(1, 'rgba(249,223,160,0)');
  L.ctx.fillStyle = halo; L.ctx.fillRect(0, 0, W, H);
  sheet.lay(L, 0.95, 6, 0.6);
  const D = sheet.layer();
  hatch(D, rng, (c) => c.arc(cx, cy, r, 0, 7), [cx - r, cy - r, cx + r, cy + r], area(900), (x, y) => (Math.hypot(x - cx, y - cy) > r * 0.82 ? rng.pick(C(['#F6C88C', '#F3B08E'])) : rng.pick(C(['#FBEFC8', '#FDF5DA', '#F9E6B0']))), (x, y) => Math.atan2(y - cy, x - cx) + Math.PI / 2 + rng.gauss() * 0.2, [12, 30], [4, 9], 0.95);
  sheet.lay(D, 0.9, 7);
}

// ---------- the constellation: a small network wired across the night ----------
{
  const L = sheet.layer(), rng = R.fork(20);
  for (let i = 0; i < (DAY ? 0 : area(260)); i++) { // plain stars
    const x = rng() * W, y = rng() * 0.34 * H;
    L.ctx.fillStyle = 'rgb(253,243,208)'; L.ctx.globalAlpha = rng.range(0.25, 0.8);
    L.ctx.beginPath(); L.ctx.arc(x, y, rng.range(0.8, 2.2) * S, 0, 7); L.ctx.fill();
  }
  L.ctx.globalAlpha = 1;
  const layers = [4, 6, 6, 3], x0 = 0.07 * W, dx = 0.085 * W, nodes = [];
  layers.forEach((n, li) => { const col = []; for (let k = 0; k < n; k++) col.push([x0 + li * dx + rng.gauss() * 16 * S, 0.07 * H + (k + 0.5) * (0.26 * H / n) + rng.gauss() * 14 * S + li * 6 * S]); nodes.push(col); });
  for (let li = 0; li < nodes.length - 1; li++) for (const a of nodes[li]) for (const b of nodes[li + 1]) {
    if (rng() < 0.45) continue;
    line(L.ctx, rng, curve(a, b, 0, 10), (DAY ? 1.3 : 1) * S, hex(DAY ? '#4A4D5E' : '#F7EBC4'), DAY ? rng.range(0.25, 0.45) : rng.range(0.12, 0.3), 0.5);
  }
  nodes.flat().forEach((p, i) => {
    if (DAY) { const out = i >= nodes.flat().length - 3, rr = (out ? 7 : 5) * S; line(L.ctx, rng, Array.from({ length: 20 }, (_, j) => [p[0] + Math.cos(j / 19 * 6.283) * rr, p[1] + Math.sin(j / 19 * 6.283) * rr]), 1.6 * S, hex(out ? '#B23A2E' : '#4A4D5E'), 0.8, 0.3); if (out) { L.ctx.fillStyle = 'rgba(178,58,46,0.6)'; L.ctx.beginPath(); L.ctx.arc(p[0], p[1], rr * 0.6, 0, 7); L.ctx.fill(); } return; }
    const out = i >= nodes.flat().length - 3, rr = (out ? 7 : 4.5) * S;
    const g = L.ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr * 4);
    g.addColorStop(0, out ? 'rgba(242,128,110,0.7)' : 'rgba(253,243,208,0.55)'); g.addColorStop(1, 'rgba(253,243,208,0)');
    L.ctx.fillStyle = g; L.ctx.fillRect(p[0] - rr * 4, p[1] - rr * 4, rr * 8, rr * 8);
    L.ctx.fillStyle = out ? 'rgb(246,150,128)' : 'rgb(253,246,220)'; L.ctx.beginPath(); L.ctx.arc(p[0], p[1], rr, 0, 7); L.ctx.fill();
  });
  sheet.lay(L, 0.95, 8);
}

// ---------- the pop-up landscape: three hills cut from paper, a river, a small town ----------
const hillFar = (x) => H * (0.5 + 0.05 * Math.sin(x / W * 5.2 + 1) + 0.03 * N(x * 0.004, 1));
const hillMid = (x) => H * (0.585 + 0.035 * Math.sin(x / W * 3.4 + 2.2) - 0.085 * Math.exp(-Math.pow((x / W - 0.64) / 0.1, 2)) + 0.015 * N(x * 0.006, 2));
const hillNear = (x) => H * (0.655 - 0.075 * Math.exp(-Math.pow((x / W - 0.1) / 0.14, 2)) - 0.03 * Math.exp(-Math.pow((x / W - 0.92) / 0.1, 2)) + 0.012 * N(x * 0.008, 3));
function hillShape(f) { const pts = []; for (let x = -20; x <= W + 20; x += 8) pts.push([x, f(x)]); pts.push([W + 20, PAGE_Y(W) + 2], [-20, PAGE_Y(0) + 2]); return pts; }
const HILLS = DAY ? [[hillFar, ['#9AA8C8', '#A8B4D0', '#8E9CC0'], ['#F2D6C0', '#EFCDB8'], 30], [hillMid, ['#7FA8A0', '#8CB4AA', '#729C96'], ['#F6E3B8', '#F3DDB0'], 31], [hillNear, ['#9DBA86', '#A8C290', '#8FAE7A'], ['#F6E3B8', '#F8EAC6'], 32]] : [[hillFar, ['#6A5E9E', '#7A6AA8', '#5E5594'], ['#C9789A', '#E1868C'], 30], [hillMid, ['#3F6E86', '#4A7C8E', '#36627C'], ['#F3B08E', '#E9A07E'], 31], [hillNear, ['#5E8C6E', '#6E9A78', '#4F7C62'], ['#F6C88C', '#F3B08E'], 32]];
for (const [f, pal, lit, seed] of HILLS.slice(0, 2)) {
  const L = sheet.layer(), rng = R.fork(seed), pts = hillShape(f);
  hatch(L, rng, poly(pts), [-20, Math.min(...pts.map((p) => p[1])) - 4, W + 20, PAGE_Y(0) + 4], area(16000), (x, y) => (y - f(x) < 14 * S && rng() < 0.75 ? rng.pick(C(lit)) : rng.pick(C(pal))), (x, y) => -0.05 + rng.gauss() * 0.12 + Math.atan((f(x + 4) - f(x - 4)) / 8) * 0.7, [18, 50], [4, 10], 0.95);
  line(L.ctx, rng, pts.slice(0, -2), 2 * S, hex('#26231B'), 0.35, 0.6); // cut-paper edge
  sheet.lay(L, 0.88, 6);
}
// small crayon trees scattered on the far and middle hills
{
  const L = sheet.layer(), rng = R.fork(41);
  for (let i = 0; i < area(160); i++) {
    const x = rng() * W, onMid = rng() < 0.6, f = onMid ? hillMid : hillFar, y = f(x) + rng.range(6, 40) * S;
    if (onMid && Math.abs(x / W - 0.64) < 0.07) continue;
    const r = rng.range(5, 11) * S * (onMid ? 1 : 0.7);
    for (let k = 0; k < 10; k++) mark(L.ctx, rng, x + rng.gauss() * r * 0.4, y - r + rng.gauss() * r * 0.4, rng() * 3, r * 0.9, r * 0.5, rng.pick(C(DAY ? (onMid ? ['#5E8A7E', '#6A9488', '#527E74'] : ['#7E8CB4', '#8A96BC']) : (onMid ? ['#2E5A6E', '#284F62', '#3A6A72'] : ['#4E4888', '#5A5294']))), 0.95);
    line(L.ctx, rng, [[x, y - r * 0.3], [x, y + 2 * S]], 1.4 * S, hex('#3A3046'), 0.7, 0.2);
  }
  sheet.lay(L, 0.9, 7);
}
for (const [f, pal, lit, seed] of HILLS.slice(2)) {
  const L = sheet.layer(), rng = R.fork(seed), pts = hillShape(f);
  hatch(L, rng, poly(pts), [-20, Math.min(...pts.map((p) => p[1])) - 4, W + 20, PAGE_Y(0) + 4], area(16000), (x, y) => (y - f(x) < 14 * S && rng() < 0.75 ? rng.pick(C(lit)) : rng.pick(C(pal))), (x, y) => -0.05 + rng.gauss() * 0.12 + Math.atan((f(x + 4) - f(x - 4)) / 8) * 0.7, [18, 50], [4, 10], 0.95);
  line(L.ctx, rng, pts.slice(0, -2), 2 * S, hex('#26231B'), 0.35, 0.6); // cut-paper edge
  sheet.lay(L, 0.88, 6);
}
// the town on the middle hill
{
  const L = sheet.layer(), Wn = sheet.layer(), rng = R.fork(50);
  const blds = [];
  for (let i = 0; i < 30; i++) { const x = rng.range(0.56, 0.72) * W; blds.push({ x, w: rng.range(14, 34) * S, h: rng.range(18, 50) * S * Math.max(0.35, 1 - Math.abs(x / W - 0.64) * 4), base: hillMid(x) + rng.range(2, 14) * S }); }
  blds.push({ x: 0.635 * W, w: 30 * S, h: 92 * S, base: hillMid(0.635 * W) + 6 * S, tower: true });
  blds.sort((a, b) => a.base - b.base);
  for (const b of blds) {
    const x0 = b.x - b.w / 2, y0 = b.base - b.h;
    hatch(L, rng, (c) => c.rect(x0, y0, b.w, b.h), [x0, y0, x0 + b.w, b.base], Math.max(10, (b.w * b.h) / (40 * S * S)), (x) => (x > b.x ? rng.pick(C(['#F3D6B0', '#F6C88C', '#E9B98E'])) : rng.pick(C(['#8C7FA8', '#9A86AE', '#7E72A0']))), () => Math.PI / 2 + rng.gauss() * 0.1, [8, 18], [3, 6], 1);
    if (b.tower) { // a tower with pins down both sides, like a chip standing on end
      for (let k = 0; k < 7; k++) for (const s of [-1, 1]) mark(L.ctx, rng, b.x + s * (b.w / 2 + 5 * S), y0 + 10 * S + k * 11 * S, 0, 10 * S, 3 * S, hex('#E9E0C8'), 1);
      line(L.ctx, rng, [[b.x, y0], [b.x, y0 - 22 * S]], 2 * S, hex('#26231B'), 0.8, 0.3);
      Wn.ctx.fillStyle = 'rgb(242,128,110)'; Wn.ctx.beginPath(); Wn.ctx.arc(b.x, y0 - 24 * S, 4 * S, 0, 7); Wn.ctx.fill();
    }
    const roof = rng.pick(C(['#2D3F9E', '#B23A2E', '#3A4A86']));
    hatch(L, rng, poly([[x0 - 3 * S, y0], [b.x, y0 - b.w * 0.45], [x0 + b.w + 3 * S, y0]]), [x0 - 4 * S, y0 - b.w * 0.5, x0 + b.w + 4 * S, y0], 14, () => roof, () => rng.gauss() * 0.3, [6, 14], [3, 5], 1);
    for (let k = 0; k < Math.floor(b.h / (16 * S)); k++) if (rng() < 0.6) { Wn.ctx.fillStyle = rng() < 0.8 ? 'rgb(247,210,122)' : 'rgb(245,196,81)'; Wn.ctx.fillRect(b.x + rng.range(-0.3, 0.2) * b.w, y0 + 6 * S + k * 16 * S, 5 * S, 6 * S); }
  }
  sheet.lay(L, 0.92, 7); sheet.lay(Wn, 0.95, 8, DAY ? 0.35 : 1);
}

// ---------- the open notebook ----------
const GUTTER = 0.47 * W;
{
  const L = sheet.layer(), rng = R.fork(60), ctx = L.ctx;
  const pts = []; for (let x = -10; x <= W + 10; x += 8) pts.push([x, PAGE_Y(x)]); pts.push([W + 10, H + 10], [-10, H + 10]);
  ctx.save(); ctx.beginPath(); poly(pts)(ctx); ctx.clip();
  ctx.fillStyle = 'rgb(251,244,220)'; ctx.fillRect(0, 0, W, H);
  // lamplight from the left, cooler toward the right
  const lamp = ctx.createRadialGradient(0.12 * W, 0.7 * H, 0, 0.12 * W, 0.7 * H, 0.9 * W);
  lamp.addColorStop(0, DAY ? 'rgba(248,226,170,0.25)' : 'rgba(248,214,150,0.55)'); lamp.addColorStop(1, DAY ? 'rgba(200,190,170,0.12)' : 'rgba(120,110,150,0.32)');
  ctx.fillStyle = lamp; ctx.fillRect(0, 0, W, H);
  // gutter shadow and page curl shading
  const gut = ctx.createLinearGradient(GUTTER - 0.06 * W, 0, GUTTER + 0.05 * W, 0);
  gut.addColorStop(0, 'rgba(60,50,40,0)'); gut.addColorStop(0.55, 'rgba(60,50,40,0.28)'); gut.addColorStop(0.6, 'rgba(60,50,40,0.34)'); gut.addColorStop(1, 'rgba(60,50,40,0)');
  ctx.fillStyle = gut; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  sheet.lay(L, 1.2, 4);
  // paper strokes so the page is drawn too, not flat
  const P2 = sheet.layer();
  hatch(P2, rng, poly(pts), [0, PAGE_Y(0), W, H], area(5000), (x) => rng.pick(x < GUTTER ? C(['#F8E8C2', '#FBF0D4', '#F6E2B8']) : C(['#F4ECD6', '#EFE6D0', '#F7F0DC'])), () => rng.gauss() * 0.06, [40, 120], [6, 12], 0.5);
  sheet.lay(P2, 0.7, 5, 0.6);
  // grid on the left page, ruled lines on the right
  const G = sheet.layer();
  for (let y = PAGE_Y(0) + 26 * S; y < H; y += 26 * S) {
    line(G.ctx, rng, curve([0.02 * W, y], [GUTTER - 0.01 * W, y + 4 * S], 0, 20), 1 * S, hex('#B9C6D8'), 0.55, 0.2);
    line(G.ctx, rng, curve([GUTTER + 0.012 * W, y + 3 * S], [0.99 * W, y - 2 * S], 0, 30), 1 * S, hex('#9FB3D0'), 0.6, 0.2);
  }
  for (let x = 0.02 * W; x < GUTTER - 0.01 * W; x += 26 * S) line(G.ctx, rng, [[x, PAGE_Y(x) + 10 * S], [x + 3 * S, H]], 1 * S, hex('#B9C6D8'), 0.4, 0.2);
  line(G.ctx, rng, [[GUTTER + 0.06 * W, PAGE_Y(GUTTER) + 8 * S], [GUTTER + 0.062 * W, H]], 1.4 * S, hex('#D9877E'), 0.55, 0.3); // margin line
  sheet.lay(G, 0.85, 6);
  // the shadow the pop-up casts onto the page
  const Sh = sheet.layer(); Sh.ctx.strokeStyle = 'rgba(60,40,40,0.35)'; Sh.ctx.lineWidth = 10 * S; Sh.ctx.beginPath();
  for (let x = 0; x <= W; x += 8) { const y = PAGE_Y(x) + 6 * S; x ? Sh.ctx.lineTo(x, y) : Sh.ctx.moveTo(x, y); } Sh.ctx.stroke();
  sheet.lay(Sh, 0.95, 4, 0.8);
}

// ---------- the diagram: one bit, a gate, a register, an adder ----------
const GRAPH = hex('#46454F'), BLUE = hex('#2D3F9E'), RED = hex('#B23A2E');
const bit = [0.07 * W, 0.93 * H]; const Z = 1.35;
{
  const L = sheet.layer(), rng = R.fork(70), ctx = L.ctx;
  const g = ctx.createRadialGradient(...bit, 0, ...bit, 34 * S); g.addColorStop(0, 'rgba(242,128,110,0.6)'); g.addColorStop(1, 'rgba(242,128,110,0)');
  ctx.fillStyle = g; ctx.fillRect(bit[0] - 40 * S, bit[1] - 40 * S, 80 * S, 80 * S);
  ctx.fillStyle = 'rgb(178,58,46)'; ctx.beginPath(); ctx.arc(...bit, 7 * S, 0, 7); ctx.fill();
  const circ = (cx, cy, rx, ry, col, w = 2) => line(ctx, rng, Array.from({ length: 30 }, (_, i) => [cx + Math.cos(i / 29 * 6.283) * rx, cy + Math.sin(i / 29 * 6.283) * ry]), w * S, col, 0.9, 0.5);
  circ(...bit, 13 * S, 12 * S, GRAPH);
  // a "1" and a "0" written beside it
  line(ctx, rng, [[bit[0] - 4 * S, bit[1] - 44 * S], [bit[0] + 1 * S, bit[1] - 50 * S], [bit[0] + 1 * S, bit[1] - 26 * S]], 2 * S, GRAPH, 0.85, 0.4);
  
  // an AND gate
  const gx = 0.14 * W, gy = 0.855 * H, gw = 46 * S * Z, gh = 52 * S * Z;
  line(ctx, rng, [[gx, gy - gh / 2], [gx, gy + gh / 2]], 2.2 * S, GRAPH, 0.9, 0.4);
  line(ctx, rng, [[gx, gy - gh / 2], [gx + gw * 0.5, gy - gh / 2], ...Array.from({ length: 16 }, (_, i) => { const a = -Math.PI / 2 + i / 15 * Math.PI; return [gx + gw * 0.5 + Math.cos(a) * gw * 0.5, gy + Math.sin(a) * gh / 2]; }), [gx, gy + gh / 2]], 2.2 * S, GRAPH, 0.9, 0.4);
  line(ctx, rng, curve([bit[0] + 14 * S, bit[1] - 4 * S], [gx, gy + 12 * S], -20 * S, 24), 2 * S, GRAPH, 0.85, 0.5);
  line(ctx, rng, [[gx - 40 * S, gy - 12 * S], [gx, gy - 12 * S]], 2 * S, GRAPH, 0.85, 0.4);
  // a register: eight cells, two of them filled
  const rx = 0.2 * W, ry = 0.775 * H, cw = 24 * S * Z, ch = 28 * S * Z;
  for (let k = 0; k < 8; k++) {
    line(ctx, rng, [[rx + k * cw, ry], [rx + (k + 1) * cw, ry], [rx + (k + 1) * cw, ry + ch], [rx + k * cw, ry + ch], [rx + k * cw, ry]], 1.8 * S, k === 3 || k === 6 ? BLUE : GRAPH, 0.85, 0.5);
    if (k === 3 || k === 6) for (let j = 0; j < 8; j++) mark(ctx, rng, rx + k * cw + cw / 2, ry + ch / 2, 0.8, cw * 0.8, 3 * S, BLUE, 0.6);
  }
  line(ctx, rng, curve([gx + gw, gy], [rx + 2 * cw, ry + ch], 10 * S, 24), 2 * S, GRAPH, 0.85, 0.5);
  // an adder, drawn as the usual notched trapezoid
  const ax = 0.355 * W, ay = 0.88 * H, aw = 62 * S * Z, ah = 72 * S * Z;
  line(ctx, rng, [[ax, ay - ah / 2], [ax + aw, ay - ah / 4], [ax + aw, ay + ah / 4], [ax, ay + ah / 2], [ax, ay + 10 * S], [ax + 14 * S, ay], [ax, ay - 10 * S], [ax, ay - ah / 2]], 2.4 * S, GRAPH, 0.9, 0.5);
  line(ctx, rng, curve([rx + 8 * cw, ry + ch / 2], [ax, ay - ah / 4], 16 * S, 24), 2 * S, GRAPH, 0.85, 0.5);
  // margin doodle: a tiny star, and an arrow pointing at the bit
  line(ctx, rng, curve([bit[0] + 70 * S, bit[1] + 40 * S], [bit[0] + 22 * S, bit[1] + 8 * S], -14 * S, 16), 1.6 * S, BLUE, 0.8, 0.4);
  line(ctx, rng, [[bit[0] + 30 * S, bit[1] + 6 * S], [bit[0] + 22 * S, bit[1] + 8 * S], [bit[0] + 26 * S, bit[1] + 16 * S]], 1.6 * S, BLUE, 0.8, 0.4);
  sheet.lay(L, 0.95, 7);

  // ---------- the line that becomes a railway ----------
  const T = sheet.layer(), tr = T.ctx;
  const path = [];
  const start = [ax + aw, ay], c1 = [0.58 * W, 0.99 * H], c2 = [0.75 * W, 0.9 * H], end = [0.7 * W, PAGE_Y(0.7 * W)];
  for (let i = 0; i <= 120; i++) { const t = i / 120, u = 1 - t; path.push([u * u * u * start[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * end[0], u * u * u * start[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * end[1]]); }
  // and on up into the landscape, switching back across the near hill to the town
  const yT = hillMid(0.635 * W) + 6 * S, yE = PAGE_Y(0.7 * W); const up = [end, [0.69 * W, yE - (yE - yT) * 0.25], [0.66 * W, yE - (yE - yT) * 0.45], [0.675 * W, yE - (yE - yT) * 0.65], [0.65 * W, yE - (yE - yT) * 0.85], [0.636 * W, yT]];
  for (let i = 1; i < up.length; i++) for (let k = 1; k <= 20; k++) { const t = k / 20; path.push([up[i - 1][0] + (up[i][0] - up[i - 1][0]) * t, up[i - 1][1] + (up[i][1] - up[i - 1][1]) * t]); }
  const n = path.length;
  for (let i = 1; i < n; i++) {
    const t = i / n, p = path[i], q = path[i - 1];
    const ang = Math.atan2(p[1] - q[1], p[0] - q[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
    const real = Math.min(1, Math.max(0, (t - 0.22) / 0.35));               // graphite turns into a real track
    const scale = p[1] < PAGE_Y(p[0]) ? 0.45 : 1;                           // smaller once it is in the landscape
    const gauge = (2 + real * 7) * S * scale;
    const col = mix(GRAPH, hex('#3A3046'), real);
    for (const s of real > 0.05 ? [-1, 1] : [0]) line(tr, rng, [[q[0] + nx * gauge * s, q[1] + ny * gauge * s], [p[0] + nx * gauge * s, p[1] + ny * gauge * s]], (1.8 + real * 0.8) * S * scale, col, 0.9, 0.25);
    if (real > 0.3 && i % 3 === 0) mark(tr, rng, p[0], p[1], ang + Math.PI / 2, gauge * 2.6, 3 * S * scale, hex('#8A6A4E'), 0.85 * real);
  }
  sheet.lay(T, 0.96, 7);

  // ---------- the train, carrying bits up to the town ----------
  const Tr = sheet.layer(), k0 = Math.floor(n * 0.6);
  for (let car = 0; car < 5; car++) {
    const p = path[Math.min(n - 1, k0 - car * 5)], q = path[Math.min(n - 1, k0 - car * 5 + 2)];
    const ang = Math.atan2(q[1] - p[1], q[0] - p[0]), sc = p[1] < PAGE_Y(p[0]) ? 0.5 : 1;
    const ctx2 = Tr.ctx; ctx2.save(); ctx2.translate(p[0], p[1] - 6 * S * sc); ctx2.rotate(ang);
    const w = 34 * S * sc, h = 18 * S * sc;
    ctx2.fillStyle = car === 0 ? 'rgb(178,58,46)' : 'rgb(45,63,158)'; ctx2.fillRect(-w / 2, -h, w, h);
    ctx2.strokeStyle = 'rgb(38,35,27)'; ctx2.lineWidth = 1.4 * S * sc; ctx2.strokeRect(-w / 2, -h, w, h);
    if (car === 0) { ctx2.fillRect(w * 0.15, -h - 8 * S * sc, 5 * S * sc, 8 * S * sc); }
    else { ctx2.fillStyle = 'rgb(247,210,122)'; ctx2.fillRect(-w / 2 + 3 * S * sc, -h - 4 * S * sc, w - 6 * S * sc, 4 * S * sc); }
    ctx2.restore();
  }
  // steam, drawn as soft crayon puffs
  const head = path[k0];
  for (let i = 0; i < 40; i++) mark(Tr.ctx, rng, head[0] + 6 * S + i * 1.2 * S + rng.gauss() * 4 * S, head[1] - 20 * S - i * 1.6 * S + rng.gauss() * 3 * S, rng() * 6, rng.range(4, 9) * S, rng.range(2, 4) * S, hex('#FDF3D0'), 0.6);
  sheet.lay(Tr, 0.95, 8);
}

// ---------- notes in pencil: squiggles that read as handwriting ----------
{
  const L = sheet.layer(), rng = R.fork(75);
  const scribble = (x0, y0, wdt, hgt) => {
    let x = x0; const pts = [];
    while (x < x0 + wdt) {
      const word = rng.range(18, 60) * S;
      for (let xx = x; xx < x + word; xx += 3 * S) pts.push([xx, y0 - Math.abs(Math.sin(xx * 0.32 / S + rng() * 0.6)) * hgt * rng.range(0.5, 1.1)]);
      line(L.ctx, rng, pts.splice(0), 1.5 * S, hex('#55535C'), 0.75, 0.5);
      x += word + rng.range(8, 16) * S;
    }
  };
  const gy = PAGE_Y(0.6 * W);
  for (let k = 0; k < 5; k++) scribble(0.755 * W, gy + (42 + k * 26) * S, (k === 4 ? 0.09 : 0.2) * W, 9 * S);
  scribble(0.04 * W, PAGE_Y(0.1 * W) + 52 * S, 0.16 * W, 12 * S);
  // underline under the heading, in blue pencil
  line(L.ctx, rng, curve([0.04 * W, PAGE_Y(0.1 * W) + 62 * S], [0.19 * W, PAGE_Y(0.1 * W) + 60 * S], 3 * S, 20), 2 * S, hex('#2D3F9E'), 0.8, 0.5);
  sheet.lay(L, 0.9, 7);
}
// ---------- a pencil left on the page ----------
{
  const L = sheet.layer(), rng = R.fork(80), ctx = L.ctx;
  const tip = [0.8 * W, 0.885 * H], ang = 0.24, len = 0.2 * W, wd = 30 * S;
  const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx;
  const P = (a, b) => [tip[0] + dx * a + nx * b, tip[1] + dy * a + ny * b];
  hatch(L, rng, poly([P(0, 0), P(46 * S, -wd / 2), P(46 * S, wd / 2)]), [tip[0] - 10, tip[1] - 60 * S, tip[0] + 60 * S, tip[1] + 30 * S], 80, (x, y) => (Math.hypot(x - tip[0], y - tip[1]) < 16 * S ? hex('#3A3842') : rng.pick(C(['#E9C9A0', '#DDB88A']))), () => ang, [8, 16], [3, 5], 1);
  hatch(L, rng, poly([P(46 * S, -wd / 2), P(len, -wd / 2), P(len, wd / 2), P(46 * S, wd / 2)]), [Math.min(...[0, len].map((a) => P(a, 0)[0])) - 30, Math.min(...[0, len].map((a) => P(a, 0)[1])) - 30, Math.max(...[0, len].map((a) => P(a, 0)[0])) + 30, Math.max(...[0, len].map((a) => P(a, 0)[1])) + 30], area(2200), (x, y) => { const off = (x - tip[0]) * nx + (y - tip[1]) * ny; return off < -wd * 0.18 ? rng.pick(C(['#F4D27A', '#F0C65C'])) : off > wd * 0.18 ? rng.pick(C(['#C9922E', '#D9A63A'])) : rng.pick(C(['#E9B949', '#E2AE3E'])); }, () => ang + rng.gauss() * 0.05, [20, 60], [3, 7], 1);
  hatch(L, rng, poly([P(len, -wd / 2), P(len + 26 * S, -wd / 2), P(len + 26 * S, wd / 2), P(len, wd / 2)]), [P(len, 0)[0] - 40 * S, P(len + 26 * S, 0)[1] - 40 * S, P(len + 26 * S, 0)[0] + 40 * S, P(len, 0)[1] + 40 * S], 60, () => rng.pick(C(['#B8B4AC', '#D6D2C8'])), () => ang + Math.PI / 2, [6, 12], [2, 4], 1);
  hatch(L, rng, poly([P(len + 26 * S, -wd / 2), P(len + 58 * S, -wd / 2.2), P(len + 58 * S, wd / 2.2), P(len + 26 * S, wd / 2)]), [P(len + 26 * S, 0)[0] - 50 * S, P(len + 58 * S, 0)[1] - 50 * S, P(len + 58 * S, 0)[0] + 50 * S, P(len + 26 * S, 0)[1] + 50 * S], 60, () => rng.pick(C(['#E59AA8', '#EBA8B4'])), () => ang, [6, 14], [3, 5], 1);
  line(ctx, rng, [P(46 * S, -wd / 2), P(len + 58 * S, -wd / 2.2)], 1.6 * S, hex('#26231B'), 0.7, 0.3);
  line(ctx, rng, [P(46 * S, wd / 2), P(len + 58 * S, wd / 2.2)], 1.6 * S, hex('#26231B'), 0.7, 0.3);
  line(ctx, rng, [P(46 * S, 0), P(len, 0)], 1.2 * S, hex('#B8892A'), 0.6, 0.3);
  // its shadow
  const Sd = sheet.layer(); Sd.ctx.strokeStyle = 'rgba(70,55,60,0.25)'; Sd.ctx.lineWidth = wd * 0.9; Sd.ctx.lineCap = 'round'; Sd.ctx.beginPath(); Sd.ctx.moveTo(...P(30 * S, wd * 0.9)); Sd.ctx.lineTo(...P(len + 50 * S, wd * 0.9)); Sd.ctx.stroke();
  sheet.lay(Sd, 0.95, 4, 0.8);
  sheet.lay(L, 0.95, 7);
}

// ---------- the room is dark beyond the lamp ----------
{
  const L = sheet.layer(); const v = L.ctx.createRadialGradient(0.35 * W, 0.62 * H, 0.35 * W, 0.5 * W, 0.5 * H, 0.95 * W);
  v.addColorStop(0, 'rgba(20,18,40,0)'); v.addColorStop(1, DAY ? 'rgba(60,50,40,0.18)' : 'rgba(20,18,40,0.55)'); L.ctx.fillStyle = v; L.ctx.fillRect(0, 0, W, H);
  sheet.lay(L, 1.2, 4, 0.7);
}
require('fs').mkdirSync(`${__dirname}/out`, { recursive: true });
sheet.finish(`${__dirname}/out/soul-${DAY ? 'day-' : ''}${W}`, W > 1600 ? W : 0);
console.log('drew soul', W);
