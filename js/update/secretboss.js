// AI Secret Boss: diam, menembakkan pola laser layar penuh dengan pre-laser (garis kuning peringatan)

// Satu laser = garis tak terbatas melewati (x,y) dengan sudut a. t = waktu peringatan sebelum menembak.
function addLaser(x, y, a, w, t, d) {
  HZ.push({ k: 'laser', x, y, a, w, d, t, m: t });
}

// Laser sejajar memenuhi layar. gap = lebar celah aman antar laser. stag = jeda tembak antar laser.
// Mengembalikan waktu tembak laser terakhir.
function laserComb(a, w, gap, warn, d, stag) {
  const nx = -Math.sin(a),
    ny = Math.cos(a),
    pitch = w + gap,
    ext = (Math.abs(nx) * W) / 2 + (Math.abs(ny) * H) / 2 + w / 2;
  let i = 0,
    last = warn;
  for (let o = -ext - pitch + R(0, pitch); o < ext + pitch; o += pitch) {
    if (Math.abs(o) > ext) continue;
    last = warn + i++ * stag;
    addLaser(W / 2 + nx * o, H / 2 + ny * o, a, w, last, d);
  }
  return last;
}

// Laser menembus boss ke segala arah (n garis = 2n sinar), celah aman di antara sinar.
function laserStar(e, n, rot, w, warn, d) {
  for (let i = 0; i < n; i++) addLaser(e.x, e.y, rot + (i * Math.PI) / n, w, warn, d);
  return warn;
}

const SEC_PATTERNS = {
  vert: (p) => laserComb(Math.PI / 2, p.w, p.gap, p.warn, p.d, 0),
  horz: (p) => laserComb(0, p.w, p.gap, p.warn, p.d, 0),
  diag: (p) => laserComb(Math.PI / 4, p.w, p.gap, p.warn, p.d, 0),
  diag2: (p) => laserComb(-Math.PI / 4, p.w, p.gap, p.warn, p.d, 0),
  sweepV: (p) => laserComb(Math.PI / 2, p.w, p.gap, p.warn, p.d, 0.14),
  sweepH: (p) => laserComb(0, p.w, p.gap, p.warn, p.d, 0.14),
  star: (p) => laserStar(p.e, 4, R(0, Math.PI / 4), 48, p.warn, p.d),
  grid: (p) =>
    Math.max(
      laserComb(Math.PI / 2, p.w, p.gap + 70, p.warn + 0.25, p.d, 0),
      laserComb(0, p.w, p.gap + 70, p.warn + 0.25, p.d, 0),
    ),
};
// Pola yang tersedia per fase (HP boss makin rendah = pola makin banyak & cepat)
const SEC_PHASES = [
  ['vert', 'horz', 'diag', 'star'],
  ['vert', 'horz', 'diag', 'diag2', 'star', 'sweepV', 'sweepH'],
  ['vert', 'horz', 'diag', 'diag2', 'star', 'sweepV', 'sweepH', 'grid'],
];

function secretBoss(e, dt) {
  e.x = e.hx; // tidak bergerak
  e.y = e.hy;
  e.ph += dt;
  if (e.ch > 0) e.ch -= dt;
  if (e.intro > 0) {
    e.intro -= dt;
    return;
  }
  const r = e.hp / e.mh,
    pz = r < 0.3 ? 3 : r < 0.6 ? 2 : 1;
  if (pz > e.pz) {
    e.pz = pz;
    banner(pz == 2 ? 'FASE 2' : 'FASE 3: AMUK!', 'laser semakin rapat & cepat');
    shake = 18;
    snd(60, 0.5, 'sawtooth', 0.09);
  }
  e.cd -= dt;
  if (e.cd > 0) return;
  const p = {
      e,
      w: 56,
      warn: Math.max(0.9, 1.7 - pz * 0.2 - wave * 0.01),
      gap: Math.max(96, 150 - wave * 1.5 - (pz - 1) * 10),
      d: 30 + wave * 2,
    },
    pool = SEC_PHASES[pz - 1].filter((k) => k != e.last),
    k = pick(pool);
  e.last = k;
  const lastFire = SEC_PATTERNS[k](p);
  e.ch = p.warn;
  e.cd = lastFire + (pz == 1 ? 0.9 : pz == 2 ? 0.6 : 0.3);
  snd(880, 0.15, 'square', 0.03); // bunyi peringatan
}
