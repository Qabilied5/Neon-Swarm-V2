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
  const kd = bossKind(wave), // 'sup' (ANNIHILATOR) | 'tank' (BEHEMOTH, wave 35+) | 'agile' (WRAITH, wave 45+)
    pw = bossPower(wave), // wave 25+: serangan lebih sakit
    base = 4500 + (wave - SUP) * 500,
    V = {
      sup: {
        hp: base,
        r: 62,
        sp: pw > 1 ? 88 : 55,
        c: '#ff2e63',
        dm: 70,
        ag: pw > 1 ? 1 : 0, // ag = seberapa sering menghindar (dodge); 0 = tidak
        tempo: pw > 1 ? 1.2 : 1, // pengali kecepatan serangan
        nm: 'ANNIHILATOR',
        sub: pw > 1 ? 'lebih buas · lebih sakit · lebih lincah' : 'hanya dia di arena · serangan brutal',
      },
      tank: {
        hp: base * TANK_HP_MUL,
        r: 96,
        sp: 44,
        c: '#ff9f1c',
        dm: 85,
        ag: 0,
        tempo: 0.9,
        nm: 'BEHEMOTH',
        sub: 'sangat tebal · menyeruduk seperti badak',
        arm: TANK_ARMOR,
      },
      agile: {
        hp: base * WRAITH_HP_MUL,
        r: 40,
        sp: 230,
        c: '#22d3ee',
        dm: 70,
        ag: 3.5,
        tempo: 2,
        nm: 'WRAITH',
        sub: 'sangat lincah · sulit dibidik',
      },
    }[kd];
  boss = {
    k: 'boss',
    sup: 1, // bendera 'sup' = boss solo (wave berhenti, kebal vortex/frost, tampilan & bar HP boss besar)
    vr: kd,
    nm: V.nm,
    pw,
    ag: V.ag,
    tempo: V.tempo,
    arm: V.arm || 0,
    x: W / 2,
    y: -(V.r + 70),
    r: V.r,
    hp: V.hp,
    mh: V.hp,
    sp: V.sp,
    c: V.c,
    xp: 100,
    dm: Math.round(V.dm * pw),
    cd: 1.5,
    sm: 0,
    fl: 0,
    ph: 0,
    at: '',
    ac: 0,
    as: 0,
    cn: 0,
    ang: 0,
    dgC: 2, // jeda dodge berikutnya
    dgT: 0, // sisa waktu dodge yang sedang berjalan
    orbs: kd == 'sup' && pw <= 1 ? 30 : 45, // jumlah orb XP saat mati
    sc: kd == 'tank' ? 2 : kd == 'agile' ? 1.5 : 1, // pengali skor kemenangan
  };
  E.push(boss);
  banner(kd == 'sup' ? 'SUPER BOSS: ANNIHILATOR' : 'BOSS: ' + V.nm, V.sub);
  taunt = pick(SUPT);
  shake = 20;
  snd(50, 0.9, 'sawtooth', 0.1);
}
