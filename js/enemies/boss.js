// spawnBoss() & spawnSuper() - kemunculan boss
function spawnBoss() {
  const hp = 700 * (wave / 5);
  boss = {
    k: 'boss',
    x: W / 2,
    y: -80,
    r: 44,
    hp,
    mh: hp,
    sp: 60,
    c: '#ff2e63',
    xp: 40,
    dm: 25,
    cd: 2,
    sm: 5,
    fl: 0,
    ph: 0,
  };
  E.push(boss);
  banner('BOSS: OVERLORD');
  taunt = pick(TAUNT);
  snd(90, 0.6, 'sawtooth', 0.08);
  ai(
    `Kamu bos AI jahat di game arcade neon. Tulis SATU kalimat ejekan pendek (maks 12 kata) bahasa Indonesia untuk pemain di wave ${wave}.`,
  ).then((r) => {
    if (r && boss) taunt = r;
  });
}
function spawnSuper() {
  for (const e of E) {
    pf(e.x, e.y, 8, e.c, 200, 0.5);
    O.push({ x: e.x, y: e.y, v: e.xp });
  }
  E = [];
  EB = [];
  HZ = [];
  const hp = 4500 + (wave - SUP) * 500;
  boss = {
    k: 'boss',
    sup: 1,
    x: W / 2,
    y: -130,
    r: 62,
    hp,
    mh: hp,
    sp: 55,
    c: '#ff2e63',
    xp: 100,
    dm: 70,
    cd: 1.5,
    sm: 0,
    fl: 0,
    ph: 0,
    at: '',
    ac: 0,
    as: 0,
    cn: 0,
    ang: 0,
  };
  E.push(boss);
  banner('SUPER BOSS: ANNIHILATOR', 'hanya dia di arena · serangan brutal');
  taunt = pick(SUPT);
  shake = 20;
  snd(50, 0.9, 'sawtooth', 0.1);
}
