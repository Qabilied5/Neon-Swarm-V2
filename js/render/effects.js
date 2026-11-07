// Gambar hazard, pre-laser, ring, beam, petir, vortex, teks damage, partikel
function drawHazards() {
  drawLasers();
  for (const h of HZ) {
    if (h.k == 'laser') continue;
    const k = 1 - h.t / h.m;
    neon('#ff2e63');
    if (h.k == 'ring') {
      g.globalAlpha = 0.12 + 0.18 * k;
      g.beginPath();
      g.arc(h.x, h.y, h.r, 0, TAU);
      g.fill();
      g.globalAlpha = 0.8;
      g.stroke();
      g.globalAlpha = 0.5;
      g.beginPath();
      g.arc(h.x, h.y, h.r * k, 0, TAU);
      g.stroke();
    } else {
      g.globalAlpha = 0.25 + 0.5 * k;
      g.lineWidth = 2 + h.w * 0.5 * k;
      g.beginPath();
      g.moveTo(h.x, h.y);
      g.lineTo(h.x + Math.cos(h.a) * 2200, h.y + Math.sin(h.a) * 2200);
      g.stroke();
    }
  }
  g.globalAlpha = 1;
}
// Pre-laser (peringatan). TANPA shadowBlur: garis layar penuh + blur = sangat berat (frame drop).
// Glow ditiru dengan goresan berlapis; garis putus-putus digabung jadi satu path.
function drawLasers() {
  let n = 0;
  g.shadowBlur = 0;
  g.strokeStyle = '#ffd166';
  g.lineCap = 'butt';
  for (const h of HZ) {
    if (h.k != 'laser') continue;
    n++;
    const k = 1 - h.t / h.m,
      ux = Math.cos(h.a),
      uy = Math.sin(h.a),
      blink = h.t < 0.25 && Math.floor(h.t * 40) % 2;
    g.globalAlpha = 0.08 + 0.2 * k + (blink ? 0.3 : 0);
    g.lineWidth = h.w + P.r; // lebar = area yang akan terkena
    g.beginPath();
    g.moveTo(h.x - ux * LASER_LEN, h.y - uy * LASER_LEN);
    g.lineTo(h.x + ux * LASER_LEN, h.y + uy * LASER_LEN);
    g.stroke();
  }
  if (!n) return;
  g.globalAlpha = 0.9;
  g.lineWidth = 2;
  g.setLineDash([14, 10]);
  g.beginPath();
  for (const h of HZ) {
    if (h.k != 'laser') continue;
    const ux = Math.cos(h.a),
      uy = Math.sin(h.a);
    g.moveTo(h.x - ux * LASER_LEN, h.y - uy * LASER_LEN);
    g.lineTo(h.x + ux * LASER_LEN, h.y + uy * LASER_LEN);
  }
  g.stroke();
  g.setLineDash([]);
  g.globalAlpha = 1;
}
function drawRings() {
  for (const r of RG) {
    const k = 1 - r.l / r.m;
    neon(r.c);
    g.lineWidth = Math.max(0.5, r.w * (1 - k));
    g.globalAlpha = 1 - k;
    g.beginPath();
    g.arc(r.x, r.y, r.mr * Math.sin((k * Math.PI) / 2), 0, TAU);
    g.stroke();
  }
  g.globalAlpha = 1;
}
function drawBeams() {
  for (const b of BM) {
    const k = b.l / b.m,
      ux = Math.cos(b.a),
      uy = Math.sin(b.a),
      x0 = b.full ? b.x - ux * LASER_LEN : b.x,
      y0 = b.full ? b.y - uy * LASER_LEN : b.y;
    if (b.full) {
      // laser layar penuh: tanpa shadowBlur (berat), glow = goresan lebar transparan + inti putih
      g.shadowBlur = 0;
      g.strokeStyle = '#ff2e63';
      g.globalAlpha = 0.3 * k;
      g.lineWidth = 12 + (b.w || 24) * 1.4 * k;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(b.x + ux * LASER_LEN, b.y + uy * LASER_LEN);
      g.stroke();
      g.globalAlpha = k;
      g.lineWidth = 6 + (b.w || 24) * k;
      g.stroke();
    } else {
      neon('#ff2e63');
      g.globalAlpha = k;
      g.lineWidth = 6 + (b.w || 24) * k;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(b.x + ux * LASER_LEN, b.y + uy * LASER_LEN);
      g.stroke();
    }
    g.strokeStyle = '#fff';
    g.globalAlpha = k;
    g.lineWidth = 2 + 4 * k;
    g.stroke();
  }
  g.globalAlpha = 1;
}
function drawArcs() {
  for (const a of AR) {
    neon('#9be7ff');
    g.globalAlpha = a.l / 0.2;
    g.lineWidth = 2;
    g.beginPath();
    a.p.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
    g.stroke();
  }
  g.globalAlpha = 1;
}
function drawVortex() {
  for (const v of VX) {
    const k = v.l / v.m;
    neon('#b967ff', '#14001f');
    g.globalAlpha = Math.min(1, k * 3);
    g.beginPath();
    g.arc(v.x, v.y, 26 + 4 * Math.sin(T * 12), 0, TAU);
    g.fill();
    g.stroke();
    for (let i = 0; i < 3; i++) {
      g.globalAlpha = 0.35 * Math.min(1, k * 3);
      g.beginPath();
      g.arc(v.x, v.y, v.r * (0.25 + 0.75 * ((T * 0.9 + i / 3) % 1)), 0, TAU);
      g.stroke();
    }
  }
  g.globalAlpha = 1;
}
function drawFloatTexts() {
  for (const f of FT) {
    g.globalAlpha = cl(f.t * 2, 0, 1);
    tx(f.s, f.x, f.y, f.z * ZK, f.c, 'center', 6); // ukuran angka tetap terbaca saat zoom-out
  }
  g.globalAlpha = 1;
}
function drawParticles() {
  g.shadowBlur = 0;
  for (const p of PT) {
    g.globalAlpha = p.l / p.m;
    g.fillStyle = p.c;
    g.fillRect(p.x, p.y, p.s, p.s);
  }
  g.globalAlpha = 1;
}
