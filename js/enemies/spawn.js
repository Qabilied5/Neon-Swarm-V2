// spawn(), edge(), evolve() (evolusi tier), blast() (ledakan bomber)
function spawn(k, x, y, sc = 1) {
  const d = ET[k],
    hp = d.hp * sc;
  E.push({
    k,
    x,
    y,
    r: d.r,
    hp,
    mh: hp,
    sp: d.sp * (1 + wave * 0.02),
    c: d.c,
    xp: d.xp,
    dm: d.dm,
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
