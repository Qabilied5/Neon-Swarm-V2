// Konstanta balance: tier(wave), LET (zona maut), SUP (super boss), heal, orbital blade, wave secret boss
const BUL_SPD = 640; // kecepatan peluru pemain (dipakai tembakan & aim assist)
const tier = (w) => (w >= 11 ? 3 : w >= 6 ? 2 : 1),
  LET = 8,
  SUP = 15,
  SUPT = ['Kau hanya serpihan kode.', 'Semua pola ini untukmu.', 'Menarilah, lalu musnah.'];

// Vampirism: HP per kill = level * VAMP_BASE * (1 + (wave-1) * VAMP_WAVE) -> makin besar tiap wave
// (wave 1 = x1, wave 10 = x2.35, wave 20 = x3.85 dengan VAMP_WAVE 0.15)
const VAMP_BASE = 1,
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
const ORB_R = 150,
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

// ===== Efek baru & Evo Effect (lihat data/upgrades.js, data/evo.js, combat/evo.js) =====
// Frost: lama slow = FROST_T + FROST_TS*stack (dtk); musuh melambat ke FROST_SLOW x kecepatan. Toxic: dps = (TOX_DPS + dmg*0.3) * stack selama TOX_T dtk.
const FROST_T = 1.2, FROST_TS = 0.4, FROST_SLOW = 0.55,
  TOX_T = 3, TOX_DPS = 5,
  HOM_R = 320, HOM_TURN = 4, // Homing: jangkauan cari musuh (px) & kecepatan belok (rad/dtk per stack)
  AURA_R0 = 80, AURA_RS = 22, AURA_DPS = 14, // Spike Aura: radius = R0 + RS*stack, damage/dtk = DPS*stack
  REGEN_HPS = 0.7, // Regen: HP/dtk per stack
  DSTR_MUL = 3, // Dash Strike: damage = dmg * DSTR_MUL * stack
  XPB_PCT = 0.25, // XP Surge: tambahan XP per stack
  BERS_PCT = 0.35, // Berserk: +damage per stack saat HP mendekati 0
  SHR_N = 5, SHR_DMG = 0.8, // Shrapnel: pecahan = SHR_N + 2*stack, damage = dmg * SHR_DMG
  PLS_CD0 = 7, PLS_N = 10, PLS_DMG = 0.9, // Pulse: jeda = PLS_CD0 - 0.9*stack (min 2.5), peluru = PLS_N + 2*stack
  EXE_PCT = 0.1, // Executioner: musuh biasa mati bila HP < EXE_PCT*stack
  DRN_CD = 0.85, DRN_DMG = 0.7, // Drone: jeda tembak & damage (x dmg)
  THICK_PCT = 0.08, // Thick Skin: pengurang damage per stack
  REV_HP = 0.4; // Second Wind: HP setelah bangkit (x max HP)

// ===== Efek gelombang 2 & Evo baru (logika: combat/evo.js) =====
const DEAD_CRIT = 0.5, // Deadeye: tambahan pengali crit per stack (dasar x3.5), +5% peluang crit per stack
  MARK_T = 3, MARK_PCT = 0.15, // Hunter Mark: lama tanda (dtk) & tambahan damage diterima per stack
  KIN_PUSH = 14, // Kinetic Rounds: dorongan (px) per stack tiap peluru kena
  THORN_DMG = 20, THORN_R = 120, // Thorns: damage per stack (+ dmg x3) & radius saat pemain terkena serangan
  ADR_T = 2, ADR_SPD = 0.08, ADR_RATE = 0.06, // Adrenaline: lama buff setelah kill, +gerak & +tembak per stack
  SCV_PCT = 0.12, // Scavenger: peluang drop orb XP tambahan per stack
  GOLD_ORB_MUL = 3, // GOLD RUSH: jumlah orb tambahan per drop jadi x3 (2 -> 6 orb); turunkan ke 2 kalau terlalu banyak
  CDR_PCT = 0.1, // Cooldown Core: pengurang cooldown skill & heal per stack (maks 60%)
  REAR_DMG = 0.6, // Rear Gun: damage peluru belakang (x damage biasa)
  MINE_R = 90, MINE_T = 16, // Mine Layer: radius ledakan & umur ranjau
  INC_CH = 0.15, FIRE_R = 50, FIRE_T = 3, FIRE_DPS = 8, // Incendiary: peluang api per stack, radius, lama, damage/dtk dasar
  SNIP_T = 0.5, SNIP_PCT = 0.25, // Sniper Stance: diam minimal SNIP_T dtk -> +damage per stack
  ZN_MAX = 40; // batas jumlah kolam api + ranjau sekaligus

// REROLL kartu level-up: tiap naik level diundi acak RR_MIN..RR_MAX kali reroll (peluang sama rata), ditambah Lucky Charm.
// Tidak menumpuk (sisa hangus saat kartu dipilih).
const RR_MIN = 1,
  RR_MAX = 3,
  rrRoll = () => RR_MIN + ((Math.random() * (RR_MAX - RR_MIN + 1)) | 0);

// REKOMENDASI Evo (tombol di tab ENCHANT): bahan Evo yang belum dimiliki mendapat bobot muncul x(1 + REC_BOOST) di kartu level-up.
// Tanpa rekomendasi, semua upgrade berbobot sama (acak adil).
const REC_BOOST = 0.15;
