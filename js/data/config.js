// Konstanta balance: tier(wave), LET (zona maut), SUP (super boss), heal, orbital blade, wave secret boss
const BUL_SPD = 640; // kecepatan peluru pemain (dipakai tembakan & aim assist)
const tier = (w) => (w >= 11 ? 3 : w >= 6 ? 2 : 1),
  LET = 8,
  SUP = 15,
  SUPT = ['Kau hanya serpihan kode.', 'Semua pola ini untukmu.', 'Menarilah, lalu musnah.'];

// Boss solo wave tinggi (kelipatan 5 mulai wave SUP; stat varian: enemies/boss.js, pola: enemies/superboss.js)
//  wave 25-30 : ANNIHILATOR diperkuat (lebih sakit, lebih lincah: dodge cepat + seruduk + dash beruntun)
//  wave 35-40 : BEHEMOTH  - sangat tebal (HP x TANK_HP_MUL, damage diterima x TANK_ARMOR), menyeruduk seperti badak
//  wave 45+   : WRAITH    - sangat lincah (dodge terus-menerus, blink teleport, dash beruntun)
const BOSS_BUFF_WAVE = 25,
  BOSS_TANK_WAVE = 35,
  BOSS_AGILE_WAVE = 45,
  TANK_HP_MUL = 3.5, // BEHEMOTH: HP = HP super boss x angka ini
  TANK_ARMOR = 0.7; // BEHEMOTH: damage yang diterima (0.7 = berkurang 30%)
// ELIT (wave ELITE_WAVE ke atas): musuh biasa sedikit tapi sangat sakit & tebal, XP per musuh jauh lebih besar
const ELITE_WAVE = 31,
  ELITE_HP = 2.5, // pengali HP
  ELITE_GAP = 2.4, // jeda spawn (detik); wave biasa: 1.4 -> 0.5
  ELITE_R = 1.2, // pengali ukuran
  eliteCap = (w) => Math.min(5 + (((w - ELITE_WAVE) / 10) | 0), 8), // maks musuh di layar (wave biasa: sampai 22)
  elitePw = (w) => Math.min(2 + (w - ELITE_WAVE) * 0.04, 3.5), // pengali damage: tabrakan, peluru, ledakan, gelombang kejut
  eliteXp = (w) => Math.min(4 + (w - ELITE_WAVE) * 0.2, 8), // pengali XP: 4x di wave 31 naik ke 8x di wave 51
  edm = (e, x) => Math.round(x * (e.pw || 1)); // damage serangan musuh x pengali elit
const bossKind = (w) => (w >= BOSS_AGILE_WAVE ? 'agile' : w >= BOSS_TANK_WAVE ? 'tank' : 'sup'),
  bossPower = (w) => (w >= BOSS_BUFF_WAVE ? Math.min(1.3 + (w - BOSS_BUFF_WAVE) * 0.03, 2.2) : 1); // pengali damage serangan boss

// Vampirism: HP per kill = level * VAMP_BASE * (1 + (wave-1) * VAMP_WAVE) -> makin besar tiap wave
// (wave 1 = x1, wave 10 = x2.35, wave 20 = x3.85 dengan VAMP_WAVE 0.15)
const VAMP_BASE = 1,
  VAMP_WAVE = 0.15,
  VAMP_PHX = 1.5, // Phoenix Heart: pengali heal vampirism
  vampHeal = () => P.vamp * VAMP_BASE * (1 + (wave - 1) * VAMP_WAVE) * (ev('phoenix') ? VAMP_PHX : 1);

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
  AURA_R0 = 95, AURA_RS = 32, AURA_DPS = 24, // Spike Aura: radius = R0 + RS*stack, damage/dtk = DPS*stack
  REGEN_HPS = 0.7, // Regen: HP/dtk per stack
  DSTR_MUL = 3, // Dash Strike: damage = dmg * DSTR_MUL * stack
  XPB_PCT = 0.25, // XP Surge: tambahan XP per stack
  BERS_PCT = 0.35, // Berserk: +damage per stack saat HP mendekati 0
  SHR_N = 5, SHR_DMG = 0.8, // Shrapnel: pecahan = SHR_N + 2*stack, damage = dmg * SHR_DMG
  PLS_CD0 = 7, PLS_N = 10, PLS_DMG = 0.9, // Pulse: jeda = PLS_CD0 - 0.9*stack (min 2.5), peluru = PLS_N + 2*stack
  EXE_PCT = 0.1, // Executioner: musuh biasa mati bila HP < EXE_PCT*stack
  DRN_CD = 0.85, DRN_DMG = 0.7, // Drone: jeda tembak & damage (x dmg)
  THICK_PCT = 0.12, // Thick Skin: pengurang damage per stack
  THICK_MAX = 0.75, // Thick Skin: batas total pengurangan damage
  REV_HP = 0.4; // Second Wind: HP setelah bangkit (x max HP)

// ===== Efek gelombang 2 & Evo baru (logika: combat/evo.js) =====
const DEAD_CRIT = 0.5, // Deadeye: tambahan pengali crit per stack (dasar x3.5), +5% peluang crit per stack
  MARK_T = 4, MARK_PCT = 0.3, // Hunter Mark: lama tanda (dtk) & tambahan damage diterima per stack
  KIN_PUSH = 14, // Kinetic Rounds: dorongan (px) per stack tiap peluru kena
  THORN_DMG = 20, THORN_R = 120, // Thorns: damage per stack (+ dmg x3) & radius saat pemain terkena serangan
  ADR_T = 2, ADR_SPD = 0.08, ADR_RATE = 0.06, // Adrenaline: lama buff setelah kill, +gerak & +tembak per stack
  SCV_PCT = 0.22, // Scavenger: peluang drop orb XP tambahan per stack
  SCV_ORBS = 3, // Scavenger: jumlah orb per drop
  GOLD_ORB_MUL = 2, // GOLD RUSH: jumlah orb tambahan per drop jadi x2 (SCV_ORBS 3 -> 6 orb, sama seperti sebelumnya)
  LUCK_RR = 2, // Lucky Charm: tambahan reroll per stack tiap naik level
  CDR_PCT = 0.1, // Cooldown Core: pengurang cooldown skill & heal per stack (maks 60%)
  REAR_DMG = 0.6, // Rear Gun: damage peluru belakang (x damage biasa)
  MINE_R = 130, MINE_RS = 14, MINE_T = 16, // Mine Layer: radius ledakan dasar, tambahan radius per stack & umur ranjau
  INC_CH = 0.28, FIRE_R = 68, FIRE_T = 4.5, FIRE_DPS = 14, // Incendiary: peluang api per stack, radius, lama, damage/dtk dasar
  SNIP_T = 0.4, SNIP_PCT = 0.45, // Sniper Stance: diam minimal SNIP_T dtk -> +damage per stack
  ZN_MAX = 40; // batas jumlah kolam api + ranjau sekaligus

// REROLL kartu level-up: tiap naik level diundi acak RR_MIN..RR_MAX kali reroll (peluang sama rata), ditambah Lucky Charm.
// Tidak menumpuk (sisa hangus saat kartu dipilih).
const RR_MIN = 1,
  RR_MAX = 3,
  rrRoll = () => RR_MIN + ((Math.random() * (RR_MAX - RR_MIN + 1)) | 0);

// REKOMENDASI Evo (tombol di tab ENCHANT): bahan Evo yang belum dimiliki mendapat bobot muncul x(1 + REC_BOOST) di kartu level-up.
// Tanpa rekomendasi, semua upgrade berbobot sama (acak adil).
const REC_BOOST = 0.15;
