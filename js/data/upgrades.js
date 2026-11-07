// Daftar upgrade level-up (UP) - tambah upgrade baru di sini
const UP = [
  ['RAPID FIRE', '+25% kecepatan tembak', () => (P.rate *= 1.25)],
  ['DAMAGE UP', '+30% damage peluru', () => (P.dmg *= 1.3)],
  ['MULTISHOT', '+1 peluru menyebar', () => P.multi++],
  ['PIERCING', 'peluru tembus +1 musuh', () => P.pier++],
  ['SPEED', '+15% kecepatan gerak', () => (P.sp *= 1.15)],
  [
    'ARMOR',
    '+30 max HP, heal penuh',
    () => {
      P.mh += 30;
      P.hp = P.mh;
    },
  ],
  ['MAGNET', 'jangkauan orb +60%', () => (P.mag *= 1.6)],
  ['DASH+', 'cooldown dash -25%', () => (P.dashCD *= 0.75)],
  ['ORBITAL BLADE', '+1 bilah mengorbit', () => P.orb++],
  ['REPAIR', 'pulihkan 50 HP', () => (P.hp = Math.min(P.mh, P.hp + 50))],
  ['SKILL: NOVA (Q)', 'shockwave: melukai & mendorong semua musuh sekitar', () => P.sk.q++],
  ['SKILL: LASER (E)', 'sinar menembus semua musuh ke arah kursor', () => P.sk.e++],
  ['SKILL: BLACK HOLE (R)', 'lubang hitam menyedot & melukai musuh', () => P.sk.r++],
  ['CHAIN LIGHTNING', 'peluru memicu petir ke musuh terdekat', () => P.ch++],
  ['EXPLOSIVE ROUNDS', 'peluru meledak area kecil', () => P.boom++],
  ['VAMPIRISM', 'setiap kill memulihkan HP (makin besar tiap wave)', () => P.vamp++],
  ['CRITICAL', '+20% peluang crit (damage x3.5)', () => (P.crit += 0.2)],
];
