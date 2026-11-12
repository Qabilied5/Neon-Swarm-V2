// Daftar upgrade level-up (UP) - tambah upgrade baru di sini
// Format: [nama, deskripsi, efek, kunci ikon SVG, instan?]. Ikon didefinisikan di render/icons.js (ICON).
// Upgrade yang muncul lagi setelah pernah diambil menampilkan badge hijau "LV n > n+1" (stack dihitung di P.up).
// Elemen ke-5 = 1 untuk upgrade instan yang tidak menumpuk (tanpa badge); saat ini belum ada yang memakainya.
// Elemen ke-6 (opsional) = batas stack: setelah tercapai upgrade tidak muncul lagi di kartu (mis. skill Q/E/R/Teleport, Dash+, Sandevistan, Super Shield).
const UP = [
  ['RAPID FIRE', '+25% kecepatan tembak', () => (P.rate *= 1.25), 'rapid'],
  ['DAMAGE UP', '+30% damage peluru', () => (P.dmg *= 1.3), 'damage'],
  ['MULTISHOT', '+1 peluru menyebar', () => P.multi++, 'multi'],
  ['PIERCING', 'peluru tembus +1 musuh', () => P.pier++, 'pierce'],
  ['SPEED', '+15% kecepatan gerak', () => (P.sp *= 1.15), 'speed'],
  [
    'ARMOR',
    '+30 max HP, heal penuh',
    () => {
      P.mh += 30;
      P.hp = P.mh;
    },
    'armor',
  ],
  ['MAGNET', 'jangkauan orb +60%', () => (P.mag *= 1.6), 'magnet'],
  ['DASH+', 'cooldown dash -25%', () => (P.dashCD *= 0.75), 'dashup', 0, 1],
  ['ORBITAL SHURIKEN', 'shuriken memutar, 30 dmg/hit; mulai 2, tiap stack +1', () => (P.orb = P.orb ? P.orb + 1 : ORB_START), 'orbital'],
  ['SKILL: NOVA (Q)', 'shockwave: melukai & mendorong semua musuh sekitar', () => P.sk.q++, 'nova', 0, 1],
  ['SKILL: LASER (E)', 'musuh terjauh kena 90% HP; makin jauh damage makin besar', () => P.sk.e++, 'laser', 0, 1],
  ['SKILL: BLACK HOLE (R)', 'lubang hitam menyedot & melukai musuh', () => P.sk.r++, 'hole', 0, 1],
  ['CHAIN LIGHTNING', 'petir ke musuh dekat; tiap stack +jangkauan & +1 target', () => P.ch++, 'chain'],
  ['EXPLOSIVE ROUNDS', 'peluru meledak area kecil', () => P.boom++, 'boom'],
  ['VAMPIRISM', 'setiap kill memulihkan HP (makin besar tiap wave)', () => P.vamp++, 'vamp'],
  ['CRITICAL', '+20% peluang crit (damage x3.5)', () => (P.crit += 0.2), 'crit'],
  ['SKILL: TELEPORT (T)', 'pindah instan ke titik bidik, cooldown 40 detik', () => P.sk.tp++, 'teleport', 0, 1],
  ['SUPER SHOT', '+5% peluang peluru super (damage 100) tiap tembakan', () => (P.ss += SS_CHANCE), 'supershot', 0, 6],
  ['SANDEVISTAN', 'musuh menyerang bayangan awal dash selama 1,5 dtk', () => P.sandy++, 'sande', 0, 1],
  // SUPER SHIELD: hanya muncul 1x (batas stack 1), tidak bisa di-stack. Logika: hurt() di game/player.js, pemulihan: updShield() di update/fx.js
  [
    'SUPER SHIELD',
    '-50% damage, tahan 3 serangan, pulih 20s',
    () => {
      if (P.sh) return;
      P.sh = 1;
      P.shn = shMax();
      P.shc = 0;
    },
    'shield',
    0,
    1,
  ],
  // ===== Efek tambahan (bahan dasar Evo Effect, lihat data/evo.js). Logika: combat/evo.js + hook di damage/bullets/enemies =====
  ['FROST ROUNDS', 'peluru memperlambat musuh (makin lama tiap stack)', () => P.froz++, 'frost', 0, 4],
  ['TOXIC ROUNDS', 'peluru meracuni: damage berkala 3 detik', () => P.psn++, 'toxic'],
  ['RICOCHET', 'peluru memantul di tepi layar +1 kali', () => P.rico++, 'ricochet', 0, 4],
  ['HOMING', 'peluru membelok mengejar musuh terdekat', () => P.hom++, 'homing', 0, 4],
  ['SPIKE AURA', 'aura lebih luas & lebih sakit melukai musuh yang mendekat', () => P.aura++, 'aura'],
  ['REGEN', 'pulihkan HP perlahan terus-menerus', () => P.regen++, 'regen', 0, 6],
  ['DASH STRIKE', 'dash melukai musuh yang dilewati', () => P.dstr++, 'dstrike', 0, 4],
  ['XP SURGE', '+25% XP dari tiap orb', () => P.xpb++, 'xpsurge', 0, 5],
  ['BERSERK', 'makin sedikit HP, makin besar damage', () => P.bers++, 'berserk', 0, 5],
  ['SHRAPNEL', 'musuh mati meledak jadi pecahan peluru', () => P.shr++, 'shrapnel'],
  ['PULSE', 'semburan peluru melingkar otomatis berkala', () => P.pls++, 'pulse', 0, 5],
  ['EXECUTIONER', 'musuh biasa ber-HP rendah langsung mati', () => P.exe++, 'exec', 0, 3],
  ['DRONE', 'drone pendamping menembak musuh terdekat', () => P.drn++, 'drone', 0, 4],
  ['THICK SKIN', '-12% damage yang diterima (maks 75% total)', () => P.thick++, 'thick', 0, 5],
  ['SECOND WIND', 'bangkit 1x saat HP habis (40% HP)', () => P.rvm++, 'revive', 0, 1],
  // ===== Efek gelombang 2 (juga bahan Evo baru). Logika: combat/evo.js + hook di damage/bullets/enemies/player =====
  [
    'DEADEYE',
    'damage crit +0,5x & +5% peluang crit',
    () => {
      P.dead++;
      P.crit += 0.05;
    },
    'deadeye',
    0,
    5,
  ],
  ['HUNTER MARK', 'peluru menandai musuh: damage diterima +30% selama 4 dtk', () => P.mark++, 'mark', 0, 4],
  ['KINETIC ROUNDS', 'peluru mendorong musuh ke belakang', () => P.kin++, 'kinetic', 0, 4],
  ['THORNS', 'saat kamu terkena serangan, musuh sekitar terluka & terdorong', () => P.thorn++, 'thorns', 0, 5],
  ['ADRENALINE', 'tiap kill: +8% gerak & +6% tembak selama 2 dtk', () => P.adr++, 'adrenaline', 0, 5],
  ['SCAVENGER', '22% peluang kill menjatuhkan 3 orb XP tambahan', () => P.scv++, 'scavenger', 0, 6],
  ['LUCKY CHARM', '+2 reroll kartu tiap naik level', () => P.luck++, 'luck', 0, 3],
  ['COOLDOWN CORE', 'cooldown skill & heal -10%', () => P.cdr++, 'cdcore', 0, 5],
  ['REAR GUN', 'peluru juga ditembakkan ke belakang (60% damage)', () => P.rear++, 'reargun', 0, 4],
  ['MINE LAYER', 'dash meninggalkan ranjau berledakan luas (radius makin besar tiap stack)', () => P.mine++, 'mine', 0, 4],
  ['INCENDIARY', 'musuh mati (28%) meninggalkan kolam api luas yang membakar lebih lama & lebih sakit', () => P.inc++, 'incend', 0, 5],
  ['SNIPER STANCE', 'diam di tempat 0,4 dtk: damage peluru +45%', () => P.snip++, 'sniper', 0, 4],
];
