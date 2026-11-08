// Ikon SVG: ikon upgrade (kartu level-up) dan ikon tombol dash/skill/heal (sentuh + desktop).
// Bahasa visual mengikuti isi game: pemain = segitiga cyan, orb XP = berlian kuning, musuh = poligon merah, peluru = garis hijau.
// Kanvas ikon 64x64. Tambah ikon baru: satu entri di ICON (fungsi yang mengembalikan string elemen SVG), lalu pakai kuncinya di
// data/upgrades.js (elemen ke-4 tiap upgrade) atau di TBTN (field i, ui/touch-layout.js).
const IC = { b: '#4da3ff', c: '#22d3ee', y: '#ffd166', g: '#39ff88', r: '#ff2e63', p: '#b967ff', w: '#e8f4ff', o: '#ff9f1c' };

// ---- pembangun elemen SVG ----
const _p = (x, y) => x.toFixed(1) + ',' + y.toFixed(1);
const sPoly = (x, y, r, n, rot = 0) =>
  Array.from({ length: n }, (_, i) => _p(x + r * Math.cos(rot + (i * 2 * Math.PI) / n), y + r * Math.sin(rot + (i * 2 * Math.PI) / n))).join(' ');
const sStar = (x, y, r, r2, n, rot = 0) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const rr = i % 2 ? r2 : r,
      a = rot + (i * Math.PI) / n;
    return _p(x + rr * Math.cos(a), y + rr * Math.sin(a));
  }).join(' ');
const shp = (pts, c, fo = 0.25, o = 1) => `<polygon points="${pts}" fill="${c}" fill-opacity="${fo}" stroke="${c}" stroke-opacity="${o}"/>`;
const ply = (x, y, r = 9, a = 0, o = 1) => shp(sPoly(x, y, r, 3, a), IC.c, 0.3, o); // pemain (menghadap sudut a)
const orb = (x, y, r = 5) => shp(sPoly(x, y, r, 4), IC.y, 0.45); // orb XP
const foe = (x, y, r = 8, c = IC.r) => shp(sPoly(x, y, r, 6, Math.PI / 6), c, 0.25); // musuh
const ln = (x1, y1, x2, y2, c, w = 2.5, o = 1, d = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}"${d ? ` stroke-dasharray="${d}"` : ''}/>`;
const arw = (x1, y1, x2, y2, c, h = 6, w = 2.5, o = 1) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    ln(x1, y1, x2, y2, c, w, o) +
    `<polyline points="${_p(x2 - h * Math.cos(a - 0.55), y2 - h * Math.sin(a - 0.55))} ${_p(x2, y2)} ${_p(x2 - h * Math.cos(a + 0.55), y2 - h * Math.sin(a + 0.55))}" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}"/>`
  );
};
const cir = (x, y, r, c, w = 2.5, o = 1, d = '') =>
  `<circle cx="${x}" cy="${y}" r="${r}" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}"${d ? ` stroke-dasharray="${d}"` : ''}/>`;
const pln = (pts, c, w = 2.5, o = 1) => `<polyline points="${pts}" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}"/>`;
// garis zig-zag (petir) dari titik 1 ke titik 2
const zig = (x1, y1, x2, y2, n, amp) => {
  const dx = x2 - x1,
    dy = y2 - y1,
    L = Math.hypot(dx, dy),
    pts = [_p(x1, y1)];
  for (let i = 1; i < n; i++) pts.push(_p(x1 + (dx * i) / n + (-dy / L) * (i % 2 ? amp : -amp), y1 + (dy * i) / n + (dx / L) * (i % 2 ? amp : -amp)));
  pts.push(_p(x2, y2));
  return pts.join(' ');
};
// spiral masuk ke pusat (lubang hitam)
const spiral = (a0) =>
  Array.from({ length: 29 }, (_, i) => {
    const t = i / 28,
      a = a0 + t * 5,
      r = 28 - 20 * t;
    return _p(32 + r * Math.cos(a), 32 + r * Math.sin(a));
  }).join(' ');
const blade = (a) => {
  const px = 32 + 22 * Math.cos(a),
    py = 32 + 22 * Math.sin(a),
    tx_ = -Math.sin(a),
    ty_ = Math.cos(a),
    nx = Math.cos(a),
    ny = Math.sin(a);
  return shp(
    [_p(px + tx_ * 9, py + ty_ * 9), _p(px + nx * 3.5, py + ny * 3.5), _p(px - tx_ * 9, py - ty_ * 9), _p(px - nx * 3.5, py - ny * 3.5)].join(' '),
    IC.w,
    0.35,
  );
};

// ---- daftar ikon (kunci dipakai upgrades.js & TBTN.i) ----
const ICON = {
  // upgrade
  rapid: () =>
    ply(14, 32, 10) + ln(28, 20, 44, 20, IC.g) + ln(34, 32, 58, 32, IC.g, 3) + ln(28, 44, 44, 44, IC.g) + ln(50, 20, 54, 20, IC.g, 2.5, 0.6) + ln(50, 44, 54, 44, IC.g, 2.5, 0.6),
  damage: () => shp(sStar(30, 36, 22, 10, 8, -Math.PI / 8), IC.y, 0.3) + shp(sPoly(30, 36, 5, 4), IC.w, 0.6) + arw(54, 26, 54, 8, IC.g, 6),
  multi: () =>
    ply(12, 32, 9) +
    [-0.45, 0, 0.45]
      .map((a) => ln(22 + 8 * Math.cos(a), 32 + 8 * Math.sin(a), 22 + 36 * Math.cos(a), 32 + 36 * Math.sin(a), IC.g, a ? 2.5 : 3.2))
      .join(''),
  pierce: () => foe(24, 32, 10) + foe(46, 32, 10) + arw(2, 32, 62, 32, IC.g, 7, 3),
  speed: () => ply(42, 32, 11) + ln(6, 22, 24, 22, IC.c, 2.5, 0.35) + ln(2, 32, 28, 32, IC.c, 3, 0.65) + ln(6, 42, 24, 42, IC.c, 2.5, 0.35),
  armor: () =>
    `<path d="M32 5 L55 13 V31 C55 45 45 55 32 60 C19 55 9 45 9 31 V13 Z" fill="${IC.c}" fill-opacity=".15" stroke="${IC.c}"/>` +
    ln(32, 22, 32, 42, IC.g, 3.5) +
    ln(22, 32, 42, 32, IC.g, 3.5),
  // magnet: pemain menghisap orb XP dari empat penjuru
  magnet: () =>
    ply(32, 32, 10, -Math.PI / 2) +
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]
      .map(([s, t]) => orb(32 + s * 24, 32 + t * 24, 5) + arw(32 + s * 19, 32 + t * 19, 32 + s * 10, 32 + t * 10, IC.y, 5, 2.5, 0.9))
      .join(''),
  dashup: () =>
    ply(44, 32, 10) +
    ply(30, 32, 10, 0, 0.35) +
    ply(17, 32, 10, 0, 0.18) +
    cir(51, 12, 8, IC.y) +
    ln(51, 12, 51, 7, IC.y) +
    ln(51, 12, 55, 14, IC.y),
  orbital: () =>
    ply(32, 32, 8, -Math.PI / 2) +
    cir(32, 32, 22, IC.c, 2, 0.4, '3 4') +
    shp(sStar(52, 20, 10, 3.5, 4, 0.5), IC.y, 0.4) +
    shp(sStar(12, 44, 10, 3.5, 4, 1.1), IC.y, 0.4),
  repair: () =>
    `<path d="M32 56 C8 40 6 22 18 15 C25 11 32 16 32 22 C32 16 39 11 46 15 C58 22 56 40 32 56 Z" fill="${IC.r}" fill-opacity=".2" stroke="${IC.r}"/>` +
    ln(32, 26, 32, 42, IC.g, 3.5) +
    ln(24, 34, 40, 34, IC.g, 3.5),
  chain: () =>
    ln(3, 60, 8, 54, IC.g, 3.2) +
    pln(zig(12, 48, 32, 14, 5, 4), IC.y, 3) +
    pln(zig(32, 14, 54, 42, 5, 4), IC.y, 3) +
    foe(12, 48, 7) +
    foe(32, 14, 7) +
    foe(54, 42, 7),
  boom: () => ln(4, 32, 22, 32, IC.g, 3.5) + shp(sStar(42, 32, 20, 9, 9), IC.o, 0.3) + shp(sStar(42, 32, 10, 5, 7, 0.3), IC.y, 0.5),
  vamp: () =>
    `<path d="M8 12 Q32 26 56 12" stroke="${IC.r}"/>` +
    shp('18,17.5 28,19.5 24,40', IC.w, 0.5) +
    shp('36,19.5 46,17.5 40,40', IC.w, 0.5) +
    `<path d="M24 46 C24 46 19 52 19 55 A5 5 0 0 0 29 55 C29 52 24 46 24 46 Z" fill="${IC.r}" fill-opacity=".35" stroke="${IC.r}"/>` +
    `<path d="M41 50 C41 50 38 54 38 56 A3 3 0 0 0 44 56 C44 54 41 50 41 50 Z" fill="${IC.r}" fill-opacity=".35" stroke="${IC.r}"/>`,
  crit: () =>
    cir(32, 32, 20, IC.c, 2.5, 0.8) +
    ln(32, 4, 32, 12, IC.c) +
    ln(32, 52, 32, 60, IC.c) +
    ln(4, 32, 12, 32, IC.c) +
    ln(52, 32, 60, 32, IC.c) +
    shp(sStar(32, 32, 13, 5, 4, Math.PI / 4), IC.y, 0.45),
  // skill aktif (juga ikon tombol Q/E/R)
  nova: () =>
    ply(32, 32, 7, -Math.PI / 2) +
    cir(32, 32, 12, IC.c, 2.5, 0.95) +
    cir(32, 32, 20, IC.c, 2.5, 0.6) +
    cir(32, 32, 28, IC.c, 2.5, 0.3) +
    foe(8, 8, 4.5) +
    foe(56, 8, 4.5) +
    foe(8, 56, 4.5) +
    foe(56, 56, 4.5),
  teleport: () =>
    ply(12, 48, 8, -Math.PI / 4, 0.3) +
    cir(12, 48, 13, IC.o, 2, 0.35, '3 4') +
    arw(23, 38, 36, 25, IC.o, 7, 3, 0.9) +
    ply(48, 16, 9, -Math.PI / 4) +
    cir(48, 16, 12, IC.o, 2.5, 0.9) +
    cir(48, 16, 17, IC.o, 2, 0.35),
  laser: () => ply(10, 32, 8) + foe(26, 32, 6) + foe(40, 32, 6) + foe(54, 32, 6) + ln(18, 32, 63, 32, IC.r, 8, 0.55) + ln(18, 32, 63, 32, IC.w, 2.5),
  hole: () =>
    pln(spiral(0), IC.p) +
    pln(spiral(Math.PI), IC.p, 2.5, 0.6) +
    `<circle cx="32" cy="32" r="6" fill="#04060d" stroke="${IC.p}"/>` +
    foe(52, 15, 3.5) +
    foe(12, 49, 3.5),
  // efek: peluru super (emas, berekor) & Sandevistan (bayangan dash merah/cyan)
  supershot: () =>
    ln(2, 32, 30, 32, IC.y, 3.5, 0.7) +
    ln(6, 24, 26, 24, IC.y, 2.5, 0.35) +
    ln(6, 40, 26, 40, IC.y, 2.5, 0.35) +
    shp(sStar(46, 32, 17, 8, 8, 0.2), IC.y, 0.25) +
    shp(sPoly(46, 32, 6, 4), IC.w, 0.8),
  sande: () =>
    shp(sPoly(48, 32, 9, 3, 0), IC.c, 0.3) +
    shp(sPoly(34, 32, 9, 3, 0), IC.r, 0.2, 0.6) +
    shp(sPoly(21, 32, 9, 3, 0), IC.c, 0.12, 0.35) +
    shp(sPoly(10, 32, 8, 3, 0), IC.r, 0.08, 0.2) +
    cir(10, 32, 13, IC.r, 2, 0.5, '3 4'),
  // efek: Super Shield (perisai biru + 3 titik = 3 serangan tertahan)
  shield: () =>
    shp('32,6 54,14 54,33 32,58 10,33 10,14', IC.b, 0.22) +
    shp('32,14 47,19 47,32 32,49 17,32 17,19', IC.b, 0.1, 0.5) +
    `<circle cx="22" cy="30" r="3" fill="${IC.b}" stroke="none"/><circle cx="32" cy="30" r="3" fill="${IC.b}" stroke="none"/><circle cx="42" cy="30" r="3" fill="${IC.b}" stroke="none"/>`,
  // lencana "upgrade bisa di-stack" (dua chevron naik, hijau)
  levelup: () => cir(32, 32, 27, IC.g, 2.5, 0.9) + `<circle cx="32" cy="32" r="27" fill="${IC.g}" fill-opacity=".15" stroke="none"/>` + pln('20,34 32,22 44,34', IC.g, 4) + pln('20,47 32,35 44,47', IC.g, 4, 0.55),
  // tombol
  dash: () => ply(44, 32, 10) + ply(30, 32, 10, 0, 0.35) + ply(17, 32, 10, 0, 0.18),
  heal: () => shp('25,10 39,10 39,25 54,25 54,39 39,39 39,54 25,54 25,39 10,39 10,25 25,25', IC.g, 0.3),
};

// ---- pemuat & penggambar ----
const ICO = {}; // cache gambar per kunci
function icoImg(k) {
  let o = ICO[k];
  if (!o) {
    if (!ICON[k] || typeof Image == 'undefined') return null;
    o = ICO[k] = { img: new Image(), ok: false };
    o.img.onload = () => (o.ok = true);
    o.img.src =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="128" height="128" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${ICON[k]()}</svg>`,
      );
  }
  return o.ok ? o.img : null;
}
// gambar ikon k berpusat di (x,y) selebar s px; gc = warna glow. false bila belum siap / tidak ada (pemanggil memakai teks)
function drawIcon(k, x, y, s, gc = IC.c, glow = 0) {
  const img = icoImg(k);
  if (!img) return false;
  g.shadowColor = gc;
  g.shadowBlur = glow;
  g.drawImage(img, x - s / 2, y - s / 2, s, s);
  g.shadowBlur = 0;
  return true;
}
// ikon di dalam tombol lingkaran TBTN (b.i = kunci ikon, b.r = radius)
const btnGlyph = (b, glow = 0) => drawIcon(b.i, b.x, b.y, b.r * 1.35, b.c, glow);
for (const k in ICON) icoImg(k); // muat semua di awal agar siap sebelum dipakai
