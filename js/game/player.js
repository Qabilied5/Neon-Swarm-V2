// Aksi pemain: dash(), hurt(), die()
// Arah dash: tombol WASD / stik kiri sentuh; jika tidak ada input -> arah gerak terakhir (sentuh) atau arah hadap.
function dash() {
  if (P.dc > 0 || P.dash > 0) return;
  let dx = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0),
    dy = (K.KeyS ? 1 : 0) - (K.KeyW ? 1 : 0);
  if (JS.on && Math.hypot(JS.x, JS.y) > 0.2) {
    dx = JS.x;
    dy = JS.y;
  }
  if (!dx && !dy) {
    if (TOUCH && (LM.x || LM.y)) {
      dx = LM.x;
      dy = LM.y;
    } else {
      dx = Math.cos(P.a);
      dy = Math.sin(P.a);
    }
  }
  const l = Math.hypot(dx, dy);
  P.ddx = dx / l;
  P.ddy = dy / l;
  if (P.sandy) {
    // SANDEVISTAN: bayangan di posisi awal dash; musuh menargetkannya selama SANDY_T detik (lihat tgt() di core/state.js)
    DC = { x: P.x, y: P.y, a: P.a, t: SANDY_T, m: SANDY_T };
    GH.push({ x: P.x, y: P.y, a: P.a, t: 0.5, m: 0.5 });
    RG.push({ x: P.x, y: P.y, r: 0, mr: 60, c: '#22d3ee', w: 4, l: 0.35, m: 0.35 });
    pf(P.x, P.y, 12, '#ff2e63', 200, 0.4);
    snd(420, 0.2, 'triangle', 0.05);
  }
  P.dash = 0.16;
  P.dc = P.dashCD;
  P.inv = 0.3;
  snd(200, 0.15, 'sawtooth', 0.05);
  if (TUT.on) tutDash();
}
function hurt(d, c) {
  if (P.inv > 0) {
    if (TUT.on) tutBlocked(); // tutorial: tampilkan efek KEBAL saat serangan tertahan dash
    return;
  }
  if (c && wave >= LET) d = Math.max(d, Math.ceil(P.mh / 3));
  if (P.sh && P.shn > 0) {
    d = Math.max(1, Math.ceil(d * SH_RED)); // SUPER SHIELD: damage dikurangi 50%
    shieldHit();
  }
  P.hp -= d;
  if (TUT.on && P.hp < 1) P.hp = P.mh; // tutorial: tidak bisa mati
  P.inv = 0.7;
  shake = 10;
  flash = 0.25;
  snd(110, 0.2, 'sawtooth', 0.07);
  pf(P.x, P.y, 14, '#ff2e63');
  if (P.hp <= 0) die();
}
// SUPER SHIELD: satu serangan tertahan -> sisa berkurang; habis = hancur, aktif lagi setelah SH_CD detik (updShield di update/fx.js)
function shieldHit() {
  P.shn--;
  P.shf = 0.3;
  RG.push({ x: P.x, y: P.y, r: P.r, mr: P.r + 34, c: '#4da3ff', w: 3, l: 0.3, m: 0.3 });
  if (P.shn > 0) {
    snd(520, 0.12, 'triangle', 0.05);
    if (FT.length < 80) FT.push({ x: P.x, y: P.y - P.r - 14, t: 0.8, s: 'SHIELD ' + P.shn + '/' + SH_HITS, c: '#4da3ff', z: 14 });
  } else {
    P.shc = SH_CD;
    pf(P.x, P.y, 26, '#4da3ff', 320, 0.7);
    RG.push({ x: P.x, y: P.y, r: P.r, mr: P.r + 80, c: '#4da3ff', w: 5, l: 0.5, m: 0.5 });
    snd(160, 0.3, 'sawtooth', 0.07);
    FT.push({ x: P.x, y: P.y - P.r - 14, t: 1.1, s: 'SHIELD HANCUR', c: '#ff8da1', z: 16 });
  }
}
function die() {
  S = 'dead';
  deadT = 0.9;
  lbDie(); // simpan hasil run untuk tombol KIRIM SKOR
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
