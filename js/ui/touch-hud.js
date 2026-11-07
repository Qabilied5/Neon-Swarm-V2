// Gambar kontrol sentuh: hanya tombol dash, skill & heal.
// Stik gerak dan area serang sengaja TANPA UI: sentuh di mana saja di dalam areanya (garis tepi area opsional: HC.show).
function touchHud() {
  g.shadowBlur = 0;
  if (HC.show) {
    drawZone('move', false); // garis tepi area gerak / serang (opsi di editor HUD)
    drawZone('aim', false);
  }
  for (const b of vbtns()) drawTBtn(b);
  g.globalAlpha = 1;
}
function drawTBtn(b) {
  const on = true, // tombol yang digambar selalu sudah terbuka (yang terkunci disembunyikan, lihat vbtns)
    skill = b.k == 'q' || b.k == 'e' || b.k == 'r', // Q/E/R: opacity 10%
    cd = b.k == 'dash' ? P.dc : P.cd[b.k],
    mx = b.k == 'dash' ? P.dashCD : b.k == 'c' ? HEAL_CD : 9,
    rdy = on && cd <= 0,
    pr = (TPR[b.k] || 0) > T,
    aiming = SK.on && SK.k == b.k,
    r = b.r * (pr ? 1.12 : 1),
    // skill: 10% (naik sedikit saat ditekan / dibidik agar ada umpan balik); belum terbuka lebih redup
    al = skill ? (pr || aiming ? 0.6 : 0.1) : 0.9;
  g.globalAlpha = al;
  g.fillStyle = pr ? b.c + '55' : '#0a1220';
  g.strokeStyle = b.c;
  g.lineWidth = 3;
  g.shadowColor = b.c;
  g.shadowBlur = rdy && !skill ? 10 : 0;
  g.beginPath();
  g.arc(b.x, b.y, r, 0, TAU);
  g.fill();
  g.stroke();
  g.shadowBlur = 0;
  if (on && cd > 0) {
    g.fillStyle = 'rgba(0,0,0,.65)';
    g.beginPath();
    g.moveTo(b.x, b.y);
    g.arc(b.x, b.y, r, -Math.PI / 2, -Math.PI / 2 + TAU * cl(cd / mx, 0, 1));
    g.fill();
  }
  if (aiming) {
    // knob bidik skill mengikuti jari + cincin jangkauan geser
    g.strokeStyle = b.c;
    g.fillStyle = b.c;
    g.globalAlpha = 0.35;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(b.x, b.y, tui().atk.aimR, 0, TAU);
    g.stroke();
    g.globalAlpha = 0.85;
    g.beginPath();
    g.arc(b.x + SK.kx, b.y + SK.ky, b.r * 0.45, 0, TAU);
    g.fill();
  }
  g.globalAlpha = skill ? Math.min(1, al + 0.1) : 1; // label ikut transparan pada tombol skill
  const big = b.k == 'dash' ? 13 : 20;
  if (b.k == 'c' && cd > 0)
    tx(String(Math.ceil(cd)), b.x, b.y + 6, 16, b.c, 'center', 0); // sisa detik heal
  else tx(b.l, b.x, b.y + big * 0.3, big, on ? b.c : '#2a4560', 'center', rdy && !skill ? 8 : 0);
  g.globalAlpha = 1;
}
