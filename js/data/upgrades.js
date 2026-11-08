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
  ['SKILL: LASER (E)', 'sinar tembus; makin jauh musuh, damage makin besar (maks 100)', () => P.sk.e++, 'laser', 0, 1],
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
      P.shn = SH_HITS;
      P.shc = 0;
    },
    'shield',
    0,
    1,
  ],
];
