// Daftar upgrade level-up (UP) - tambah upgrade baru di sini
// Format: [nama, deskripsi, efek, kunci ikon SVG]. Ikon didefinisikan di render/icons.js (ICON).
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
  ['DASH+', 'cooldown dash -25%', () => (P.dashCD *= 0.75), 'dashup'],
  ['ORBITAL BLADE', '+1 bilah mengorbit', () => P.orb++, 'orbital'],
  ['REPAIR', 'pulihkan 50 HP', () => (P.hp = Math.min(P.mh, P.hp + 50)), 'repair'],
  ['SKILL: NOVA (Q)', 'shockwave: melukai & mendorong semua musuh sekitar', () => P.sk.q++, 'nova'],
  ['SKILL: LASER (E)', 'sinar menembus semua musuh ke arah kursor', () => P.sk.e++, 'laser'],
  ['SKILL: BLACK HOLE (R)', 'lubang hitam menyedot & melukai musuh', () => P.sk.r++, 'hole'],
  ['CHAIN LIGHTNING', 'peluru memicu petir ke musuh terdekat', () => P.ch++, 'chain'],
  ['EXPLOSIVE ROUNDS', 'peluru meledak area kecil', () => P.boom++, 'boom'],
  ['VAMPIRISM', 'setiap kill memulihkan HP (makin besar tiap wave)', () => P.vamp++, 'vamp'],
  ['CRITICAL', '+20% peluang crit (damage x3.5)', () => (P.crit += 0.2), 'crit'],
];
