// spawn(), edge(), evolve() (evolusi tier), blast() (ledakan bomber)
function spawn(k, x, y, sc = 1) {
  const el = wave >= ELITE_WAVE, // wave 31+: musuh elit (lihat data/config.js)
    pw = el ? elitePw(wave) : 1,
    d = ET[k],
    hp = el ? eliteHp(wave) : d.hp * sc; // elit: 15.000 - 35.000 HP (setara boss)
  E.push({
    k,
    x,
    y,
    r: d.r * (el ? ELITE_R : 1),
    hp,
    mh: hp,
    sp: el ? d.sp * ELITE_SPD : d.sp * (1 + wave * 0.02), // elit: super cepat
    spm: el ? 1.5 : 1, // pengali kecepatan lunge/dash khusus
    bs: el ? ELITE_BS : 1, // pengali kecepatan peluru bawaan tipe
    c: d.c,
    xp: el ? Math.round(d.xp * eliteXp(wave)) : d.xp,
    dm: Math.round(d.dm * pw),
    pw,
    cd: R(1, 2),
    fl: 0,
  });
}
function edge() {
  const s = (Math.random() * 4) | 0;
  return s == 0
    ? [R(0, W), -30]
    : s == 1
      ? [W + 30, R(0, H)]
      : s == 2
        ? [R(0, W), H + 30]
        : [-30, R(0, H)];
}
function evolve() {
  for (let i = E.length - 1; i >= 0; i--) {
    const e = E[i];
    if (e.k == 'boss') continue;
    pf(e.x, e.y, 10, e.c, 220, 0.5);
    RG.push({ x: e.x, y: e.y, r: 0, mr: e.r * 3, c: e.c, w: 3, l: 0.3, m: 0.3 });
    O.push({ x: e.x, y: e.y, v: e.xp });
    E.splice(i, 1);
  }
  EB = [];
  shake = 14;
  snd(70, 0.5, 'sawtooth', 0.08);
}
function blast(x, y, r, d) {
  RG.push({ x, y, r: 0, mr: r, c: '#e8ff3a', w: 8, l: 0.35, m: 0.35 });
  pf(x, y, 24, '#ff9f1c', 320, 0.6);
  shake = Math.max(shake, 8);
  snd(90, 0.3, 'sawtooth', 0.08);
  if (Math.hypot(P.x - x, P.y - y) < r + P.r * 0.5) hurt(d);
}
