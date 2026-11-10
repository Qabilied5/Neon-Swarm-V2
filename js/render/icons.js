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
  // ---- efek tambahan ----
  frost: () => ln(32, 6, 32, 58, IC.c, 3) + ln(9, 19, 55, 45, IC.c, 3) + ln(9, 45, 55, 19, IC.c, 3) + shp(sPoly(32, 32, 8, 6), IC.w, 0.45) + pln('26,10 32,16 38,10', IC.c, 2.5) + pln('26,54 32,48 38,54', IC.c, 2.5),
  toxic: () =>
    `<path d="M32 6 C32 6 12 30 12 42 A20 20 0 0 0 52 42 C52 30 32 6 32 6 Z" fill="${IC.g}" fill-opacity=".2" stroke="${IC.g}"/>` +
    cir(26, 42, 4, IC.g, 2.5, 0.9) + cir(39, 36, 3, IC.g, 2.5, 0.9) + cir(36, 48, 2.5, IC.g, 2, 0.7),
  ricochet: () => ln(4, 56, 60, 56, IC.c, 3, 0.6) + pln('6,8 30,52 54,14', IC.g, 3) + foe(54, 14, 6) + shp(sPoly(30, 52, 4, 4), IC.y, 0.6),
  homing: () => `<path d="M8 54 C6 24 40 56 50 22" stroke="${IC.g}" stroke-width="3" fill="none"/>` + arw(48, 28, 51, 19, IC.g, 6, 3) + foe(52, 14, 8) + cir(52, 14, 13, IC.r, 2, 0.5, '3 3'),
  aura: () => ply(32, 32, 8, -Math.PI / 2) + cir(32, 32, 24, IC.r, 2.5, 0.8, '4 3') + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ln(32 + 24 * Math.cos((i * Math.PI) / 4), 32 + 24 * Math.sin((i * Math.PI) / 4), 32 + 30 * Math.cos((i * Math.PI) / 4), 32 + 30 * Math.sin((i * Math.PI) / 4), IC.r, 3)).join(''),
  regen: () => shp('27,12 37,12 37,27 52,27 52,37 37,37 37,52 27,52 27,37 12,37 12,27 27,27', IC.g, 0.3) + cir(32, 32, 28, IC.g, 2, 0.45, '5 5') + pln('50,10 56,10 56,16', IC.g, 3),
  dstrike: () => ply(12, 32, 8) + ln(22, 32, 36, 32, IC.c, 3, 0.5) + foe(46, 32, 9) + ln(36, 16, 52, 48, IC.w, 3.5) + ln(44, 14, 60, 46, IC.w, 2, 0.5),
  xpsurge: () => orb(32, 34, 12) + orb(12, 16, 5) + orb(52, 20, 5) + orb(48, 52, 4) + arw(32, 18, 32, 4, IC.g, 6, 3),
  berserk: () => shp(sStar(32, 32, 26, 13, 7, -Math.PI / 2), IC.r, 0.28) + shp(sStar(32, 32, 13, 6, 7, -Math.PI / 2 + 0.2), IC.o, 0.55) + shp(sPoly(32, 32, 4, 4), IC.w, 0.8),
  shrapnel: () => shp(sStar(32, 32, 9, 4.5, 6), IC.o, 0.5) + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ln(32 + 15 * Math.cos((i * Math.PI) / 4 + 0.2), 32 + 15 * Math.sin((i * Math.PI) / 4 + 0.2), 32 + 27 * Math.cos((i * Math.PI) / 4 + 0.2), 32 + 27 * Math.sin((i * Math.PI) / 4 + 0.2), IC.g, 3)).join(''),
  pulse: () => cir(32, 32, 6, IC.g, 3.5) + cir(32, 32, 15, IC.g, 2.5, 0.65) + cir(32, 32, 24, IC.g, 2.5, 0.35) + ln(32, 4, 32, 10, IC.y, 3) + ln(32, 54, 32, 60, IC.y, 3) + ln(4, 32, 10, 32, IC.y, 3) + ln(54, 32, 60, 32, IC.y, 3),
  exec: () => foe(32, 32, 14) + cir(32, 32, 26, IC.r, 2, 0.5) + ln(20, 20, 44, 44, IC.r, 4) + ln(44, 20, 20, 44, IC.r, 4),
  drone: () => shp(sPoly(32, 32, 9, 4, Math.PI / 4), IC.c, 0.35) + [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => ln(32 + a * 8, 32 + b * 8, 32 + a * 17, 32 + b * 17, IC.c, 2.5) + cir(32 + a * 20, 32 + b * 20, 5, IC.c, 2.5, 0.8)).join('') + ln(32, 44, 32, 60, IC.g, 3),
  thick: () => pln('10,18 32,6 54,18', IC.b, 4) + pln('10,32 32,20 54,32', IC.b, 4, 0.75) + pln('10,46 32,34 54,46', IC.b, 4, 0.5) + `<circle cx="32" cy="54" r="3" fill="${IC.b}" stroke="none"/>`,
  revive: () => `<path d="M32 58 C8 42 6 24 18 17 C25 13 32 18 32 24 C32 18 39 13 46 17 C58 24 56 42 32 58 Z" fill="${IC.r}" fill-opacity=".22" stroke="${IC.r}"/>` + `<ellipse cx="32" cy="7" rx="13" ry="4" stroke="${IC.y}" stroke-width="3" fill="none"/>` + ln(32, 28, 32, 44, IC.g, 3) + ln(24, 36, 40, 36, IC.g, 3),
  // ---- efek gelombang 2 ----
  deadeye: () => cir(32, 32, 20, IC.r, 2.5, 0.9) + ln(32, 4, 32, 18, IC.r, 3) + ln(32, 46, 32, 60, IC.r, 3) + ln(4, 32, 18, 32, IC.r, 3) + ln(46, 32, 60, 32, IC.r, 3) + shp(sStar(32, 32, 9, 3.5, 4, 0), IC.y, 0.7),
  mark: () => foe(32, 32, 12) + pln('8,20 8,8 20,8', IC.r, 3) + pln('44,8 56,8 56,20', IC.r, 3) + pln('8,44 8,56 20,56', IC.r, 3) + pln('44,56 56,56 56,44', IC.r, 3) + shp(sPoly(32, 32, 3, 4), IC.r, 0.9),
  kinetic: () => arw(4, 32, 32, 32, IC.g, 8, 3.5) + ln(6, 22, 20, 22, IC.g, 2.5, 0.5) + ln(6, 42, 20, 42, IC.g, 2.5, 0.5) + foe(46, 32, 11) + pln('58,22 62,32 58,42', IC.w, 2.5, 0.6),
  thorns: () => shp(sStar(32, 32, 27, 14, 8, 0.2), IC.o, 0.25) + ply(32, 32, 8, -Math.PI / 2),
  adrenaline: () => shp('37,4 17,36 30,36 25,60 47,26 34,26', IC.y, 0.4) + ln(6, 20, 14, 20, IC.c, 2.5, 0.6) + ln(4, 34, 12, 34, IC.c, 2.5, 0.4),
  scavenger: () => foe(22, 22, 11) + ln(14, 14, 30, 30, IC.r, 3.5) + ln(30, 14, 14, 30, IC.r, 3.5) + orb(44, 44, 8) + orb(54, 30, 4) + orb(30, 54, 4),
  luck: () => cir(24, 24, 9, IC.g, 2.5, 0.9) + cir(40, 24, 9, IC.g, 2.5, 0.9) + cir(24, 40, 9, IC.g, 2.5, 0.9) + cir(40, 40, 9, IC.g, 2.5, 0.9) + ln(40, 40, 52, 58, IC.g, 3.5),
  cdcore: () => cir(32, 32, 24, IC.p, 3) + ln(32, 32, 32, 14, IC.w, 3) + ln(32, 32, 45, 39, IC.w, 3) + pln('50,4 58,10 52,18', IC.p, 3) + shp(sPoly(32, 32, 3, 4), IC.p, 0.8),
  reargun: () => ply(40, 32, 10, 0) + ln(26, 32, 4, 32, IC.g, 3.5) + ln(26, 24, 10, 18, IC.g, 2.5, 0.6) + ln(26, 40, 10, 46, IC.g, 2.5, 0.6),
  mine: () => cir(32, 34, 13, IC.o, 3) + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ln(32 + 13 * Math.cos((i * Math.PI) / 4), 34 + 13 * Math.sin((i * Math.PI) / 4), 32 + 21 * Math.cos((i * Math.PI) / 4), 34 + 21 * Math.sin((i * Math.PI) / 4), IC.o, 3)).join('') + shp(sPoly(32, 34, 5, 4), IC.r, 0.8) + ln(32, 6, 32, 14, IC.y, 3),
  incend: () => `<path d="M32 5 C38 18 52 26 50 42 A18 18 0 0 1 14 42 C14 32 22 28 24 17 C27 23 30 22 32 5 Z" fill="${IC.o}" fill-opacity=".28" stroke="${IC.o}"/>` + `<path d="M32 30 C36 38 42 40 41 47 A9 9 0 0 1 23 47 C23 42 28 40 32 30 Z" fill="${IC.y}" fill-opacity=".5" stroke="${IC.y}"/>`,
  sniper: () => cir(32, 32, 22, IC.y, 2.5) + cir(32, 32, 9, IC.y, 2, 0.6) + ln(32, 2, 32, 14, IC.y, 3) + ln(32, 50, 32, 62, IC.y, 3) + ln(2, 32, 14, 32, IC.y, 3) + ln(50, 32, 62, 32, IC.y, 3) + shp(sPoly(32, 32, 2.5, 4), IC.r, 0.9),
};

// ---- ikon Evo Effect: cincin emas bertitik + ikon bahan utama diperkecil + bintang aksen berwarna ----
const evIco = (base, c) => () =>
  cir(32, 32, 29, IC.y, 2, 0.7, '2 4') +
  `<g transform="translate(9.6 9.6) scale(0.7)">${ICON[base]()}</g>` +
  shp(sStar(52, 12, 7, 3, 4, 0), c, 0.75) +
  shp(sStar(12, 52, 5, 2, 4, 0), c, 0.55);
Object.assign(ICON, {
  evStorm: evIco('chain', IC.y),
  evPlague: evIco('toxic', IC.g),
  evSing: evIco('hole', IC.p),
  evRail: evIco('pierce', IC.y),
  evBlade: evIco('orbital', IC.o),
  evAegis: evIco('shield', IC.b),
  evReaper: evIco('exec', IC.r),
  evBliz: evIco('frost', IC.c),
  evHive: evIco('drone', IC.c),
  evPhoenix: evIco('revive', IC.o),
  evCluster: evIco('shrapnel', IC.o),
  evOver: evIco('rapid', IC.r),
  evChronos: evIco('sande', IC.p),
  evJudge: evIco('laser', IC.y),
  evSeeker: evIco('homing', IC.g),
  evAscend: evIco('xpsurge', IC.y),
  evHead: evIco('deadeye', IC.r),
  evInferno: evIco('incend', IC.o),
  evBulwark: evIco('thorns', IC.o),
  evBlitz: evIco('adrenaline', IC.c),
  evGold: evIco('scavenger', IC.y),
  evCross: evIco('reargun', IC.g),
  evTrap: evIco('mine', IC.o),
  evGrav: evIco('kinetic', IC.p),
  evTemp: evIco('cdcore', IC.p),
  evFrostfire: evIco('incend', IC.c),
  // meja enchant (tab ENCHANT): buku terbuka + simbol melayang
  enchant: () => `<path d="M6 44 L32 52 L58 44 L58 24 L32 32 L6 24 Z" fill="${IC.p}" fill-opacity=".2" stroke="${IC.p}"/>` + ln(32, 32, 32, 52, IC.p, 2.5) + shp(sStar(32, 12, 8, 3, 4, 0), IC.y, 0.7) + shp(sStar(16, 14, 4, 1.5, 4, 0), IC.c, 0.7) + shp(sStar(48, 16, 4, 1.5, 4, 0), IC.c, 0.7),
});

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
