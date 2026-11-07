// Panduan bidik (khusus sentuh):
//  - serangan dasar: HANYA ujung panah (tanpa garis) di sisi pemain, terang saat tombol serang ditahan
//  - skill Q/E/R: pratinjau area/arah saat tombol skill ditahan & digeser
function drawAim() {
  if (!TOUCH || !P || S != 'play') return;
  const u = tui().u * ZK, // ukuran di layar dijaga sama (dunia di-zoom-out -> satuan dunia diperbesar)
    on = AIM.on,
    ux = Math.cos(P.a),
    uy = Math.sin(P.a),
    d = 46 * u,
    ex = P.x + ux * d,
    ey = P.y + uy * d,
    sz = 11 * u;
  g.shadowBlur = 0;
  g.strokeStyle = on && AIM.man ? '#ff2e63' : '#22d3ee';
  g.globalAlpha = on ? 0.9 : 0.35;
  g.lineWidth = 3;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(ex - ux * sz - uy * sz * 0.75, ey - uy * sz + ux * sz * 0.75);
  g.lineTo(ex, ey);
  g.lineTo(ex - ux * sz + uy * sz * 0.75, ey - uy * sz - ux * sz * 0.75);
  g.stroke();
  g.lineCap = 'butt';
  if (on) drawReticle(u);
  if (SK.on) drawSkillAim();
  if (DA.on) drawDashAim();
  g.globalAlpha = 1;
}

// pratinjau dash analog (double-tap sisi kiri): garis arah + bayangan titik tujuan. Redup saat dash masih cooldown.
function drawDashAim() {
  const a = dashAimAngle(),
    ux = Math.cos(a),
    uy = Math.sin(a),
    len = 720 * 0.16, // jarak dash sebenarnya (kecepatan x durasi, lihat update/player.js & game/player.js)
    ex = P.x + ux * len,
    ey = P.y + uy * len,
    rdy = P.dc <= 0 && !(P.dash > 0),
    c = '#ffd166';
  g.strokeStyle = c;
  g.fillStyle = c;
  g.shadowBlur = 0;
  g.lineCap = 'round';
  // garis panduan panjang (membantu membidik arah dengan presisi)
  g.globalAlpha = rdy ? 0.25 : 0.1;
  g.lineWidth = 2;
  g.setLineDash([8, 8]);
  g.beginPath();
  g.moveTo(ex, ey);
  g.lineTo(P.x + ux * len * 2.6, P.y + uy * len * 2.6);
  g.stroke();
  g.setLineDash([]);
  // jarak dash sebenarnya
  g.globalAlpha = rdy ? 0.85 : 0.3;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(P.x, P.y);
  g.lineTo(ex, ey);
  g.stroke();
  // bayangan pemain di titik tujuan
  g.globalAlpha = rdy ? 0.3 : 0.12;
  g.beginPath();
  g.arc(ex, ey, P.r, 0, TAU);
  g.fill();
  g.globalAlpha = rdy ? 0.9 : 0.3;
  g.lineWidth = 2;
  g.beginPath();
  g.arc(ex, ey, P.r, 0, TAU);
  g.stroke();
  g.lineCap = 'butt';
}

// pratinjau bidik skill yang sedang ditahan
function drawSkillAim() {
  const k = SK.k,
    t = skTarget(k),
    col = k == 'q' ? '#22d3ee' : k == 'e' ? '#ff2e63' : '#b967ff';
  g.strokeStyle = col;
  g.fillStyle = col;
  g.lineWidth = 2;
  g.setLineDash([8, 8]);
  if (k == 'e') {
    const ux = Math.cos(t.a),
      uy = Math.sin(t.a),
      w = 12 + P.sk.e * 3;
    g.globalAlpha = P.sk.e ? 0.18 : 0.08;
    g.lineWidth = w * 2;
    g.setLineDash([]);
    g.beginPath();
    g.moveTo(P.x, P.y);
    g.lineTo(P.x + ux * 1400, P.y + uy * 1400);
    g.stroke();
    g.globalAlpha = 0.6;
    g.lineWidth = 2;
    g.setLineDash([8, 8]);
    g.beginPath();
    g.moveTo(P.x, P.y);
    g.lineTo(P.x + ux * 1400, P.y + uy * 1400);
    g.stroke();
  } else {
    const r = k == 'q' ? 210 + P.sk.q * 35 : 170 + P.sk.r * 25;
    g.globalAlpha = 0.14;
    g.beginPath();
    g.arc(t.x, t.y, r, 0, TAU);
    g.fill();
    g.globalAlpha = 0.7;
    g.beginPath();
    g.arc(t.x, t.y, r, 0, TAU);
    g.stroke();
    if (t.x != P.x || t.y != P.y) {
      g.globalAlpha = 0.35;
      g.beginPath();
      g.moveTo(P.x, P.y);
      g.lineTo(t.x, t.y);
      g.stroke();
    }
  }
  g.setLineDash([]);
}

// lingkaran bidik serangan dasar: bisa digeser ke mana saja selama tombol serang ditahan
function drawReticle(u) {
  const rx = P.x + AIM.ox,
    ry = P.y + AIM.oy,
    r = reticleR(), // = radius area aim assist
    tg = AIM.tg,
    c = tg ? '#39ff88' : '#ff2e63'; // hijau = musuh terkunci
  g.strokeStyle = c;
  g.shadowColor = c;
  g.shadowBlur = 8;
  // garis putus-putus pemain -> lingkaran
  g.globalAlpha = 0.35;
  g.lineWidth = 2;
  g.setLineDash([6 * u, 8 * u]);
  g.beginPath();
  g.moveTo(P.x, P.y);
  g.lineTo(rx, ry);
  g.stroke();
  g.setLineDash([]);
  // cincin + titik tengah + 4 garis bidik
  g.globalAlpha = 0.95;
  g.lineWidth = 3;
  g.beginPath();
  g.arc(rx, ry, r, 0, TAU);
  g.stroke();
  g.lineWidth = 2;
  g.beginPath();
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    g.moveTo(rx + dx * r * 0.55, ry + dy * r * 0.55);
    g.lineTo(rx + dx * r * 1.45, ry + dy * r * 1.45);
  }
  g.stroke();
  g.fillStyle = c;
  g.beginPath();
  g.arc(rx, ry, 2.5 * u, 0, TAU);
  g.fill();
  if (tg) {
    // penanda kunci di musuh: 4 sudut braket + garis tipis dari pemain
    const e = tg.e,
      s = e.r + 7 * u,
      q = s * 0.45;
    g.globalAlpha = 0.9;
    g.lineWidth = 3;
    g.beginPath();
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      g.moveTo(e.x + sx * s, e.y + sy * (s - q));
      g.lineTo(e.x + sx * s, e.y + sy * s);
      g.lineTo(e.x + sx * (s - q), e.y + sy * s);
    }
    g.stroke();
  }
  g.shadowBlur = 0;
  g.globalAlpha = 1;
}
