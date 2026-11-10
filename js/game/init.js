// init() = reset & mulai game, banner() = teks tengah layar
// Stat dasar yang dibentuk oleh upgrade/evo. Disatukan di sini supaya rebuild() bisa menghitung ulang dari nol
// (dipakai Enchant Table saat bahan dihapus & Evo ditambahkan).
const baseStats = () => ({
  sp: 230, dmg: 10, rate: 3.2, multi: 1, pier: 0, mag: 90, dashCD: 1.3, mh: 100, orb: 0,
  sk: { q: 0, e: 0, r: 0, tp: 0 }, // tp = Teleport (T)
  ch: 0, boom: 0, vamp: 0, crit: 0.08, ss: 0, sandy: 0, sh: 0,
  froz: 0, psn: 0, rico: 0, hom: 0, aura: 0, regen: 0, dstr: 0, xpb: 0, bers: 0, shr: 0, pls: 0, exe: 0, drn: 0, thick: 0, rvm: 0,
});
// Hitung ulang semua stat dari P.up (upgrade) + P.evo (Evo Effect). HP, XP, cooldown & posisi tidak berubah.
function rebuild() {
  const hp = P.hp, shn = P.shn, shc = P.shc, had = P.sh;
  Object.assign(P, baseStats());
  for (const u of UP) for (let n = P.up[u[0]] || 0; n > 0; n--) u[2]();
  for (const v of EVO) for (let n = P.evo[v.id] || 0; n > 0; n--) v.apply();
  P.hp = Math.min(P.mh, hp);
  if (P.sh) {
    P.shn = had ? Math.min(shn, shMax()) : shMax();
    P.shc = had ? shc : 0;
  } else P.shn = P.shc = 0;
}
function init() {
  TUT.on = 0; // mode tutorial dinyalakan lagi oleh tutStart() setelah init()
  P = {
    x: W / 2,
    y: H / 2,
    r: 12,
    hp: 100,
    dc: 0,
    dash: 0,
    ddx: 0,
    ddy: 0,
    inv: 0,
    ot: 0,
    fire: 0,
    xp: 0,
    lv: 1,
    need: 6,
    a: 0,
    ...baseStats(), // stat dari upgrade & evo (di bawah); dihitung ulang oleh rebuild() setelah Enchant
    evo: {}, // stack Evo Effect { id: n } (data/evo.js)
    evt: { pls: 3, drn: 0.5, sing: 5, judge: 4 }, // timer efek otomatis
    drp: 0, // sudut orbit drone
    rvu: 0, // jumlah Second Wind yang sudah terpakai
    rgc: 0, // penghitung tembakan Railgun
    dsId: 0, // id dash (Dash Strike)
    up: {}, // jumlah stack tiap upgrade yang sudah diambil: { 'MAGNET': 2, ... } (badge naik level di kartu)
    cd: { q: 0, e: 0, r: 0, c: 0, tp: 0 },
    cm: { q: 9, e: 8, r: 14, c: HEAL_CD, tp: TP_CD }, // cooldown maksimum terakhir tiap skill (setCd) - pembagi UI cooldown
    shn: 0, // sisa serangan yang bisa ditahan shield (0 = hancur / sedang pulih)
    shc: 0, // detik sampai shield aktif lagi
    shf: 0, // kilatan saat shield terkena
  };
  DC = null;
  GH = [];
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
  HL = [];
  hlWave = 0;
  hlAt = -1;
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
  lbBegin(); // snapshot leaderboard untuk notif "mengalahkan skor"
  banner('WAVE 1');
}
const banner = (m, b = '') => {
  msg = m;
  sub = b;
  msgT = 2.8;
};
