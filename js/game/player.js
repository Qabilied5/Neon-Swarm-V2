// Aksi pemain: dash(), hurt(), die()
// ang opsional (radian): arah dash bebas/analog (dipakai double-tap sisi kiri layar sentuh)
function dash(ang) {
  if (P.dc > 0 || P.dash > 0) return;
  let dx = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0),
    dy = (K.KeyS ? 1 : 0) - (K.KeyW ? 1 : 0);
  if (JS.on && Math.hypot(JS.x, JS.y) > 0.2) {
    dx = JS.x;
    dy = JS.y;
  }
  if (ang != null) {
    dx = Math.cos(ang);
    dy = Math.sin(ang);
  }
  if (!dx && !dy) {
    dx = Math.cos(P.a);
    dy = Math.sin(P.a);
  }
  const l = Math.hypot(dx, dy);
  P.ddx = dx / l;
  P.ddy = dy / l;
  P.dash = 0.16;
  P.dc = P.dashCD;
  P.inv = 0.3;
  snd(200, 0.15, 'sawtooth', 0.05);
}
function hurt(d, c) {
  if (P.inv > 0) return;
  if (c && wave >= LET) d = Math.max(d, Math.ceil(P.mh / 3));
  P.hp -= d;
  P.inv = 0.7;
  shake = 10;
  flash = 0.25;
  snd(110, 0.2, 'sawtooth', 0.07);
  pf(P.x, P.y, 14, '#ff2e63');
  if (P.hp <= 0) die();
}
function die() {
  S = 'dead';
  deadT = 0.9;
  pf(P.x, P.y, 60, '#22d3ee', 400, 1);
  if (score > best) {
    best = score;
    try {
      localStorage.setItem('ns_best', best);
    } catch (e) {}
  }
  epi = pick(EPI);
  ai(
    `Tulis SATU kalimat epitaf lucu dan pendek (maks 12 kata) bahasa Indonesia untuk pemain game arcade yang mati di wave ${wave} dengan skor ${score}.`,
  ).then((r) => {
    if (r) epi = r;
  });
}
