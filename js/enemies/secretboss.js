// spawnSecret() - Secret Boss "Prism Sentinel": diam di tengah, hanya laser layar penuh
function spawnSecret() {
  for (const e of E) {
    pf(e.x, e.y, 8, e.c, 200, 0.5);
    O.push({ x: e.x, y: e.y, v: e.xp });
  }
  E = [];
  EB = [];
  HZ = [];
  const hp = 1100 + wave * 80;
  boss = {
    k: 'boss',
    sec: 1,
    then: wave % 5 == 0, // wave 15 & 20: setelah ini lanjut ke boss/super boss biasa
    x: W / 2,
    y: H / 2,
    hx: W / 2,
    hy: H / 2,
    r: 40,
    hp,
    mh: hp,
    sp: 0,
    c: '#ffd166',
    xp: 80,
    dm: 35,
    cd: 1,
    sm: 0,
    fl: 0,
    ph: 0,
    intro: 1.8,
    ch: 0,
    pz: 1,
    last: '',
  };
  E.push(boss);
  banner('SECRET BOSS: PRISM SENTINEL', 'berdiri di celah antar laser · perhatikan garis kuning');
  taunt = pick(SECT);
  shake = 14;
  snd(70, 0.8, 'sawtooth', 0.09);
}
