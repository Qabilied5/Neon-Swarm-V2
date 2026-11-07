// init() = reset & mulai game, banner() = teks tengah layar
function init() {
  P = {
    x: W / 2,
    y: H / 2,
    r: 12,
    hp: 100,
    mh: 100,
    sp: 230,
    dmg: 10,
    rate: 3.2,
    multi: 1,
    pier: 0,
    mag: 90,
    dashCD: 1.3,
    dc: 0,
    dash: 0,
    ddx: 0,
    ddy: 0,
    inv: 0,
    orb: 0,
    ot: 0,
    fire: 0,
    xp: 0,
    lv: 1,
    need: 6,
    a: 0,
    sk: { q: 0, e: 0, r: 0 },
    cd: { q: 0, e: 0, r: 0, c: 0 },
    ch: 0,
    boom: 0,
    vamp: 0,
    crit: 0.08,
  };
  B = [];
  E = [];
  EB = [];
  O = [];
  PT = [];
  HZ = [];
  RG = [];
  AR = [];
  FT = [];
  BM = [];
  VX = [];
  combo = 0;
  comboT = 0;
  stop = 0;
  t = 0;
  wave = 1;
  waveT = 0;
  score = 0;
  kills = 0;
  spawnT = 1;
  boss = null;
  nextBoss = 0;
  taunt = '';
  epi = '';
  S = 'play';
  banner('WAVE 1');
}
const banner = (m, b = '') => {
  msg = m;
  sub = b;
  msgT = 2.8;
};
