// Konstanta balance: tier(wave), LET (zona maut), SUP (super boss), heal, orbital blade, wave secret boss
const BUL_SPD = 640; // kecepatan peluru pemain (dipakai tembakan & aim assist)
const tier = (w) => (w >= 11 ? 3 : w >= 6 ? 2 : 1),
  LET = 8,
  SUP = 15,
  SUPT = ['Kau hanya serpihan kode.', 'Semua pola ini untukmu.', 'Menarilah, lalu musnah.'];

// Vampirism: HP per kill = level * VAMP_BASE * (1 + (wave-1) * VAMP_WAVE) -> makin besar tiap wave
// (wave 1 = x1, wave 10 = x2.35, wave 20 = x3.85 dengan VAMP_WAVE 0.15)
const VAMP_BASE = 0.6,
  VAMP_WAVE = 0.15,
  vampHeal = () => P.vamp * VAMP_BASE * (1 + (wave - 1) * VAMP_WAVE);

// Versi HP (layar sentuh): peluru musuh jarak jauh dikurangi supaya tidak membingungkan.
// mob(nilaiHP, nilaiDesktop) -> pilih nilai sesuai perangkat
const mob = (m, d) => (TOUCH ? m : d);

// Heal (tombol C): cooldown dalam detik & persentase max HP yang dipulihkan
const HEAL_CD = 60,
  HEAL_PCT = 0.3;

// Orbital blade: jarak orbit dari pemain, radius tabrakan, radius gambar
const ORB_R = 100,
  ORB_HIT = 13,
  ORB_SIZE = 10;

// Secret boss muncul di wave ini (wave 15 & 20 lanjut ke super boss setelah dikalahkan)
const SEC_WAVES = [6, 11, 15, 20];

// Panjang setengah garis laser layar penuh (px) - cukup untuk menutup layar 4K
const LASER_LEN = 2600;
