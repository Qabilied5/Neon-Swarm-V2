// Peluru musuh & hazard (ring/beam/laser) musuh
function updEnemyBullets(dt) {
  for (let i = EB.length - 1; i >= 0; i--) {
    const b = EB[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (Math.hypot(P.x - b.x, P.y - b.y) < P.r + b.r) {
      hurt(b.d);
      b.life = 0;
    }
    if (b.life <= 0 || b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 30) EB.splice(i, 1);
  }
}
function updHazards(dt) {
  let lz = 0; // bunyi laser cukup sekali per frame
  for (let i = HZ.length - 1; i >= 0; i--) {
    const h = HZ[i];
    h.t -= dt;
    if (h.t <= 0) {
      if (h.k == 'ring') {
        RG.push({ x: h.x, y: h.y, r: 0, mr: h.r, c: '#ff2e63', w: 8, l: 0.3, m: 0.3 });
        pf(h.x, h.y, 14, '#ff9f1c', 260, 0.5);
        if (Math.hypot(P.x - h.x, P.y - h.y) < h.r + P.r * 0.5) hurt(h.d);
        shake = Math.max(shake, 6);
      } else if (h.k == 'laser') {
        BM.push({ x: h.x, y: h.y, a: h.a, l: 0.4, m: 0.4, full: 1, w: h.w });
        const dist = Math.abs((P.x - h.x) * Math.sin(h.a) - (P.y - h.y) * Math.cos(h.a));
        if (dist < h.w * 0.5 + P.r * 0.5) hurt(h.d);
        shake = Math.max(shake, 8);
        if (!lz) {
          lz = 1;
          snd(100, 0.25, 'sawtooth', 0.07);
        }
      } else {
        BM.push({ x: h.x, y: h.y, a: h.a, l: 0.35, m: 0.35 });
        const ux = Math.cos(h.a),
          uy = Math.sin(h.a),
          px = P.x - h.x,
          py = P.y - h.y;
        if (px * ux + py * uy > 0 && Math.abs(px * uy - py * ux) < h.w * 0.6 + P.r) hurt(h.d);
        shake = Math.max(shake, 10);
      }
      if (h.k != 'laser') snd(100, 0.2, 'sawtooth', 0.06);
      HZ.splice(i, 1);
    }
  }
}
