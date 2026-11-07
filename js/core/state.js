// Semua variabel state global game (P, E, B, wave, score, S=state layar, dll)
const K = {},
  M = { x: 0, y: 0 }, // posisi mouse di koordinat DUNIA (untuk bidik)
  MU = { x: 0, y: 0 }; // posisi mouse di koordinat LAYAR (untuk UI: hover kartu, tombol)
let TOUCH = matchMedia('(pointer:coarse)').matches,
  fsTried = 0;
const JS = { on: 0, id: null, ox: 0, oy: 0, x: 0, y: 0 }; // stik kiri (gerak)
const AIM = { on: 0, id: null, man: 0, x: 1, y: 0, kx: 0, ky: 0, ox: 0, oy: 0, lx: 0, ly: 0, dist: 0 }; // tombol serang kanan: tahan + geser = gerakkan lingkaran bidik. ox,oy = offset lingkaran dari pemain, lx,ly = posisi jari terakhir, dist = jarak terakhir
// Bidik skill (Q/E/R): tahan tombol skill lalu geser untuk mengarahkan, lepas untuk menembakkan.
// k = tombol aktif, man = 1 jika digeser keluar deadzone, x,y = arah, d = jarak 0..1, kx,ky = posisi knob
const SK = { on: 0, id: null, k: null, man: 0, x: 1, y: 0, d: 0, kx: 0, ky: 0 };
let HZ = [],
  RG = [],
  AR = [],
  FT = [],
  BM = [],
  VX = [],
  combo = 0,
  comboT = 0,
  stop = 0;
let S = 'menu',
  P,
  B = [],
  E = [],
  EB = [],
  O = [],
  PT = [],
  t = 0,
  T = 0,
  wave = 1,
  waveT = 0,
  score = 0,
  kills = 0,
  spawnT = 0,
  boss = null,
  nextBoss = 0, // timer: boss biasa muncul setelah secret boss kalah (wave 15 & 20)
  cards = [],
  shake = 0,
  msg = '',
  sub = '',
  msgT = 0,
  taunt = '',
  epi = '',
  deadT = 0,
  flash = 0,
  mute = false,
  best = 0;
try {
  best = +localStorage.getItem('ns_best') || 0;
} catch (e) {}
