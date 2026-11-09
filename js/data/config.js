// Konstanta balance: tier(wave), LET (zona maut), SUP (super boss), heal, orbital blade, wave secret boss
const BUL_SPD = 640; // kecepatan peluru pemain (dipakai tembakan & aim assist)
const tier = (w) => (w >= 11 ? 3 : w >= 6 ? 2 : 1),
  LET = 8,
  SUP = 15,
  SUPT = ['Kau hanya serpihan kode.', 'Semua pola ini untukmu.', 'Menarilah, lalu musnah.'];

// Vampirism: HP per kill = level * VAMP_BASE * (1 + (wave-1) * VAMP_WAVE) -> makin besar tiap wave
// (wave 1 = x1, wave 10 = x2.35, wave 20 = x3.85 dengan VAMP_WAVE 0.15)
const VAMP_BASE = 1, // HP per kill per level (level = P.vamp) WAVE 1 : 1, WAVE 10 : 2.35, WAVE 20 : 3.85
  VAMP_WAVE = 0.15,
  vampHeal = () => P.vamp * VAMP_BASE * (1 + (wave - 1) * VAMP_WAVE);

// Versi HP (layar sentuh): peluru musuh jarak jauh dikurangi supaya tidak membingungkan.
// mob(nilaiHP, nilaiDesktop) -> pilih nilai sesuai perangkat
const mob = (m, d) => (TOUCH ? m : d);

// Heal (tombol C): cooldown dalam detik & persentase max HP yang dipulihkan
const HEAL_CD = 60,
  HEAL_PCT = 0.3;

// Orbital Shuriken: jarak orbit dari pemain, radius tabrakan, radius gambar, damage per kena,
// jeda kena ulang pada musuh yang sama (per shuriken), jumlah shuriken saat pertama diambil (stack berikutnya +1)
const ORB_R = 250,
  ORB_HIT = 20,
  ORB_SIZE = 16,
  ORB_DMG = 30,
  ORB_HITCD = 0.4,
  ORB_START = 2;

// Chain Lightning: jangkauan sambaran = CHAIN_R0 + CHAIN_RS * stack (stack 1 = 190px), jumlah target = stack + 1
const CHAIN_R0 = 145,
  CHAIN_RS = 45;

// Laser (E): damage = LASER_DMG pada jarak >= LASER_FAR dari pemain, makin dekat makin kecil (minimum LASER_MIN x LASER_DMG).
// Eksekusi: musuh BIASA yang paling belakang (terjauh) di sinar menerima tambahan LASER_EXEC x max HP-nya (boss tidak: damage boss maks LASER_DMG).
const LASER_DMG = 100,
  LASER_FAR = 700,
  LASER_MIN = 0.1,
  LASER_EXEC = 0.9;

// Secret boss muncul di wave ini (wave 15 & 20 lanjut ke super boss setelah dikalahkan)
const SEC_WAVES = [6, 11, 15, 20];

// Skill & efek baru
const TP_CD = 15, // Teleport (T): cooldown (detik)
  TP_RANGE = 550, // jarak teleport maksimum (px dunia); titik bidik yang lebih jauh dijepit ke jarak ini
  SS_CHANCE = 0.05, // Super Shot: peluang per tembakan, bertambah segini tiap stack upgrade
  SS_DMG = 100, // damage peluru super (tetap, tidak dikali P.dmg)
  SANDY_T = 1.5, // Sandevistan: lama musuh menargetkan bayangan awal dash (detik)
  SH_HITS = 3, // Super Shield: jumlah serangan musuh yang sanggup ditahan sebelum hancur
  SH_CD = 20, // Super Shield: detik sampai aktif lagi setelah hancur
  SH_RED = 0.5; // Super Shield: damage yang tetap diterima saat shield aktif (0.5 = dikurangi 50%)

// Laser (E) - bidik sentuh seperti Teleport: jarak geser jari = jarak titik bidik dari pemain (maks LASER_AIM px dunia).
// Sinar tetap menembus lurus ke arah titik bidik; jarak hanya mengatur posisi penanda di pratinjau.
const LASER_AIM = 450;

// Free Heal: objek melayang yang memulihkan HP tetap. Muncul acak mulai wave FH_WAVE, maks 1 per wave,
// di detik acak FH_MIN..FH_MAX sejak awal wave (1 wave = 22 detik). Item yang tidak diambil hilang saat wave berganti.
const FH_HP = 20,
  FH_WAVE = 10,
  FH_MIN = 2,
  FH_MAX = 18;

// Panjang setengah garis laser layar penuh (px) - cukup untuk menutup layar 4K
const LASER_LEN = 2600;
