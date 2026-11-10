// EVO EFFECT - hasil Enchant Table (menu STAT > ENCHANT): 3 efek dasar (1 stack tiap bahan) -> 1 Evo Effect, bahan hilang.
// Evo TIDAK muncul di kartu level-up; hanya bisa dibuat lewat Enchant. Stack Evo disimpan di P.evo { id: jumlah }.
// Format: id, name, rec = 3 nama upgrade (harus persis nama di UP), desc = ringkasan, icon = kunci ikon (render/icons.js),
//   apply = tambahan stat PER STACK (dipanggil ulang oleh rebuild() di game/init.js), det = 2 baris detail untuk menu STAT.
// Efek khusus tiap Evo (selain stat) dijalankan lewat ev(id) di combat/evo.js, damage.js, bullets.js, enemies.js, player.js, dst.
// Tambah Evo baru: satu entri di sini + satu ikon (evIco) di render/icons.js.
const ev = (id) => (P && P.evo && P.evo[id]) || 0;
const shMax = () => SH_HITS + (ev('aegis') ? 3 : 0), // Super Shield: jumlah tahanan
  shCd = () => SH_CD - (ev('aegis') ? 10 : 0), // Super Shield: waktu pulih
  orbR = () => ORB_R * (ev('blade') ? 1.35 : 1), // Orbital Shuriken: jari-jari orbit
  orbDmg = () => ORB_DMG * (ev('blade') ? 2 : 1), // Orbital Shuriken: damage per kena
  boomR = () => (ev('cluster') ? 90 : 46); // Explosive Rounds: radius ledakan
const EVO = [
  {
    id: 'storm',
    name: 'STORM CALLER',
    rec: ['CHAIN LIGHTNING', 'CRITICAL', 'RAPID FIRE'],
    desc: 'tiap CRIT memanggil badai petir ke 4 musuh; +25% tembak, +20% crit',
    icon: 'evStorm',
    apply: () => {
      P.rate *= 1.25;
      P.crit += 0.2;
    },
    det: () => ['CRIT -> petir 4 target (70% dmg)', 'Tembak ' + P.rate.toFixed(1) + '/dtk · crit ' + Math.round(P.crit * 100) + '%'],
  },
  {
    id: 'plague',
    name: 'PLAGUE BEARER',
    rec: ['TOXIC ROUNDS', 'VAMPIRISM', 'EXPLOSIVE ROUNDS'],
    desc: 'racun menular: musuh mati meracuni sekitarnya & memulihkan HP',
    icon: 'evPlague',
    apply: () => {
      P.psn += 2;
      P.vamp++;
      P.boom++;
    },
    det: () => ['Musuh teracun mati: racun menyebar 170 px', '+2 HP per kill teracun'],
  },
  {
    id: 'sing',
    name: 'SINGULARITY',
    rec: ['SKILL: BLACK HOLE (R)', 'SKILL: NOVA (Q)', 'MAGNET'],
    desc: 'black hole raksasa otomatis tiap 9 dtk, runtuh jadi ledakan nova',
    icon: 'evSing',
    apply: () => {
      P.mag *= 1.6;
    },
    det: () => ['Black hole 260 px tiap 9 dtk (4 dtk)', 'Runtuh: ' + Math.round(150 + P.dmg * 6) + ' dmg area'],
  },
  {
    id: 'rail',
    name: 'RAILGUN',
    rec: ['PIERCING', 'SUPER SHOT', 'DAMAGE UP'],
    desc: 'tiap tembakan ke-4 = sinar rail menembus SEMUA musuh',
    icon: 'evRail',
    apply: () => {
      P.pier += 2;
      P.ss += 0.1;
      P.dmg *= 1.3;
    },
    det: () => ['Tembakan ke-4: sinar ' + Math.round(80 + P.dmg * 6) + ' dmg', 'Tembus semua musuh di garis'],
  },
  {
    id: 'blade',
    name: 'BLADE TEMPEST',
    rec: ['ORBITAL SHURIKEN', 'SPEED', 'MULTISHOT'],
    desc: '+3 shuriken, damage x2, orbit lebih lebar; +15% gerak, +1 peluru',
    icon: 'evBlade',
    apply: () => {
      P.orb += 3;
      P.sp *= 1.15;
      P.multi++;
    },
    det: () => ['' + P.orb + ' shuriken · ' + orbDmg() + ' dmg/kena', 'Orbit ' + Math.round(orbR()) + ' px'],
  },
  {
    id: 'aegis',
    name: 'AEGIS PROTOCOL',
    rec: ['SUPER SHIELD', 'ARMOR', 'THICK SKIN'],
    desc: 'shield tahan 6 serangan, pulih 10 dtk, memantulkan shockwave',
    icon: 'evAegis',
    apply: () => {
      P.mh += 30;
      P.thick += 2;
      if (!P.sh) {
        P.sh = 1;
        P.shn = shMax();
        P.shc = 0;
      }
    },
    det: () => ['Shield ' + shMax() + ' tahanan · pulih ' + shCd() + ' dtk', 'Tiap tahanan: shockwave ' + Math.round(40 + P.dmg * 3) + ' dmg'],
  },
  {
    id: 'reaper',
    name: 'SOUL REAPER',
    rec: ['EXECUTIONER', 'CRITICAL', 'BERSERK'],
    desc: 'eksekusi musuh ber-HP rendah (+10%), tiap eksekusi memulihkan HP',
    icon: 'evReaper',
    apply: () => {
      P.exe += 2;
      P.crit += 0.15;
      P.bers++;
    },
    det: () => ['Eksekusi < ' + Math.round(exeTh() * 100) + '% HP musuh', '+3 HP per eksekusi'],
  },
  {
    id: 'bliz',
    name: 'BLIZZARD AURA',
    rec: ['FROST ROUNDS', 'SPIKE AURA', 'DASH+'],
    desc: 'badai es: musuh dekat melambat & membeku, aura makin luas',
    icon: 'evBliz',
    apply: () => {
      P.froz += 2;
      P.aura += 2;
      P.dashCD *= 0.75;
    },
    det: () => ['Aura ' + Math.round(auraR() + 80) + ' px: slow + ' + Math.round(AURA_DPS * P.aura) + ' dmg/dtk', 'Cooldown dash ' + P.dashCD.toFixed(2) + ' dtk'],
  },
  {
    id: 'hive',
    name: 'HIVE MIND',
    rec: ['DRONE', 'HOMING', 'PULSE'],
    desc: '+3 drone, peluru drone mengejar target, semburan pulse lebih sering',
    icon: 'evHive',
    apply: () => {
      P.drn += 3;
      P.hom += 2;
      P.pls++;
    },
    det: () => ['' + P.drn + ' drone · peluru homing', 'Pulse tiap ' + plsCd().toFixed(1) + ' dtk'],
  },
  {
    id: 'phoenix',
    name: 'PHOENIX HEART',
    rec: ['SECOND WIND', 'REGEN', 'VAMPIRISM'],
    desc: 'bangkit 2x dengan ledakan api, regen kuat, +1 vampirism',
    icon: 'evPhoenix',
    apply: () => {
      P.rvm += 2;
      P.regen += 3;
      P.vamp++;
    },
    det: () => ['Bangkit ' + Math.max(0, P.rvm - P.rvu) + 'x tersisa · HP 60%', 'Ledakan api ' + Math.round(200 + P.dmg * 5) + ' dmg · regen ' + (REGEN_HPS * P.regen).toFixed(1) + '/dtk'],
  },
  {
    id: 'cluster',
    name: 'CLUSTER BOMB',
    rec: ['SHRAPNEL', 'EXPLOSIVE ROUNDS', 'RICOCHET'],
    desc: 'ledakan peluru 2x lebih luas; pecahan kill +4 & lebih kuat',
    icon: 'evCluster',
    apply: () => {
      P.shr += 2;
      P.boom++;
      P.rico += 2;
    },
    det: () => ['Ledakan 90 px · 60% damage', 'Pecahan per kill: ' + shrN()],
  },
  {
    id: 'over',
    name: 'OVERCLOCK',
    rec: ['RAPID FIRE', 'BERSERK', 'XP SURGE'],
    desc: '+60% tembak, berserk kuat, +50% XP; HP < 50% = tembak x1.3',
    icon: 'evOver',
    apply: () => {
      P.rate *= 1.6;
      P.bers += 2;
      P.xpb += 2;
    },
    det: () => ['Tembak ' + (P.rate * rateMul()).toFixed(1) + '/dtk (sekarang)', 'HP < 50%: tembak x1.3'],
  },
  {
    id: 'chrono',
    name: 'CHRONOS',
    rec: ['SANDEVISTAN', 'SKILL: TELEPORT (T)', 'DASH+'],
    desc: 'tiap dash menghentikan waktu: musuh 420 px melambat 3 dtk, kebal lebih lama',
    icon: 'evChronos',
    apply: () => {
      P.sandy = 1;
      P.dashCD *= 0.5;
      P.dstr += 2;
    },
    det: () => ['Dash: slow musuh 420 px (3 dtk)', 'Cooldown dash ' + P.dashCD.toFixed(2) + ' dtk · kebal 0,7 dtk'],
  },
  {
    id: 'judge',
    name: 'JUDGEMENT',
    rec: ['SKILL: LASER (E)', 'SUPER SHOT', 'PULSE'],
    desc: 'serangan orbital otomatis tiap 6 dtk menghantam 3 musuh terkuat',
    icon: 'evJudge',
    apply: () => {
      P.ss += 0.15;
      P.crit += 0.1;
    },
    det: () => ['3 musuh terkuat tiap 6 dtk', Math.round(120 + P.dmg * 8) + ' damage per sambaran'],
  },
  {
    id: 'seeker',
    name: 'SEEKER SWARM',
    rec: ['HOMING', 'RICOCHET', 'PIERCING'],
    desc: 'tiap peluru kena pecah jadi 2 peluru pemburu',
    icon: 'evSeeker',
    apply: () => {
      P.hom += 3;
      P.rico += 2;
      P.pier += 2;
    },
    det: () => ['Kena: +2 peluru pemburu (50% dmg)', 'Homing ' + P.hom + ' · tembus ' + P.pier],
  },
  {
    id: 'ascend',
    name: 'ASCENDANT',
    rec: ['XP SURGE', 'MAGNET', 'REGEN'],
    desc: 'tiap LEVEL UP: pulihkan 50% HP + ledakan cahaya; +75% XP, magnet kuat',
    icon: 'evAscend',
    apply: () => {
      P.xpb += 3;
      P.mag *= 1.6;
      P.regen += 2;
    },
    det: () => ['Level up: +50% HP & nova ' + Math.round(60 + P.dmg * 4) + ' dmg', 'XP +' + Math.round(XPB_PCT * P.xpb * 100) + '% · regen ' + (REGEN_HPS * P.regen).toFixed(1) + '/dtk'],
  },
  // ===== Evo gelombang 2 =====
  {
    id: 'headhunter',
    name: 'HEADHUNTER',
    rec: ['DEADEYE', 'HUNTER MARK', 'SNIPER STANCE'],
    desc: 'CRIT pada musuh bertanda = headshot bonus; tanda menular saat musuh mati',
    icon: 'evHead',
    apply: () => {
      P.dead += 2;
      P.crit += 0.1;
      P.mark++;
      P.snip++;
    },
    det: () => ['CRIT ke musuh bertanda: +80% damage (headshot)', 'Tanda menular 200 px saat mati · crit ' + Math.round(P.crit * 100) + '%'],
  },
  {
    id: 'inferno',
    name: 'INFERNO',
    rec: ['INCENDIARY', 'EXPLOSIVE ROUNDS', 'SPIKE AURA'],
    desc: 'tiap musuh mati meledak & meninggalkan kolam api besar yang lama',
    icon: 'evInferno',
    apply: () => {
      P.inc += 2;
      P.boom++;
      P.aura++;
    },
    det: () => ['Kill: ledakan 95 px + kolam api ' + (FIRE_R + 30 + 6 * Math.min(P.inc, 5)) + ' px', 'Api ' + Math.round(fireDps()) + ' dmg/dtk selama ' + (FIRE_T + 1.5) + ' dtk'],
  },
  {
    id: 'bulwark',
    name: 'BULWARK',
    rec: ['THORNS', 'THICK SKIN', 'REGEN'],
    desc: 'terkena serangan memicu ledakan duri besar & memulihkan HP',
    icon: 'evBulwark',
    apply: () => {
      P.thorn += 2;
      P.thick++;
      P.regen++;
    },
    det: () => ['Terkena: duri ' + Math.round(thornR()) + ' px · ' + Math.round(thornD()) + ' dmg', '+4 HP tiap kena · regen ' + (REGEN_HPS * P.regen).toFixed(1) + '/dtk'],
  },
  {
    id: 'blitz',
    name: 'BLITZKRIEG',
    rec: ['ADRENALINE', 'SPEED', 'DASH STRIKE'],
    desc: 'tiap kill memangkas cooldown dash; saat adrenalin aktif tubuhmu melukai musuh',
    icon: 'evBlitz',
    apply: () => {
      P.adr += 2;
      P.sp *= 1.15;
      P.dstr++;
    },
    det: () => ['Kill: cooldown dash -0,4 dtk', 'Adrenalin aktif: aura tabrak ' + Math.round(P.dmg * 5) + ' dmg/dtk'],
  },
  {
    id: 'gold',
    name: 'GOLD RUSH',
    rec: ['SCAVENGER', 'XP SURGE', 'LUCKY CHARM'],
    desc: 'drop orb melimpah, skor kill +50%, kadang menjatuhkan Free Heal',
    icon: 'evGold',
    apply: () => {
      P.scv += 2;
      P.xpb++;
      P.luck++;
    },
    det: () => ['Orb tambahan ' + Math.round(Math.min(0.9, SCV_PCT * P.scv) * 100) + '% · skor kill +50%', '6% kill menjatuhkan Free Heal · reroll ' + (RR_MIN + P.luck) + '-' + (RR_MAX + P.luck) + '/level'],
  },
  {
    id: 'cross',
    name: 'CROSSFIRE',
    rec: ['REAR GUN', 'MULTISHOT', 'RICOCHET'],
    desc: 'menembak ke 4 arah: depan, belakang, dan kedua sisi',
    icon: 'evCross',
    apply: () => {
      P.rear++;
      P.multi++;
      P.rico += 2;
    },
    det: () => ['Belakang x' + P.rear + ' (' + Math.round(REAR_DMG * 100) + '%) + 2 sisi (50%)', 'Pantul ' + P.rico + 'x di tepi layar'],
  },
  {
    id: 'trap',
    name: 'TRAPMASTER',
    rec: ['MINE LAYER', 'SHRAPNEL', 'CHAIN LIGHTNING'],
    desc: 'ranjau lebih banyak & lebih luas, ledakannya menyambar 3 musuh dengan petir',
    icon: 'evTrap',
    apply: () => {
      P.mine += 2;
      P.shr++;
      P.ch++;
    },
    det: () => ['' + P.mine + ' ranjau per dash · radius ' + Math.round(mineR()), 'Ledakan: petir ke 3 musuh (60% dmg)'],
  },
  {
    id: 'graviton',
    name: 'GRAVITON',
    rec: ['KINETIC ROUNDS', 'MAGNET', 'FROST ROUNDS'],
    desc: 'tiap peluru kena menyedot musuh sekitar ke titik tumbukan',
    icon: 'evGrav',
    apply: () => {
      P.kin += 2;
      P.mag *= 1.4;
      P.froz++;
    },
    det: () => ['Kena: sedot musuh 170 px ke titik tumbukan', 'Dorongan ' + KIN_PUSH * P.kin + ' px · slow ' + (FROST_T + FROST_TS * P.froz).toFixed(1) + ' dtk'],
  },
  {
    id: 'temporal',
    name: 'TEMPORAL ENGINE',
    rec: ['COOLDOWN CORE', 'DASH+', 'PULSE'],
    desc: 'tiap dash melepas pulse peluru & memangkas semua cooldown 1,5 dtk',
    icon: 'evTemp',
    apply: () => {
      P.cdr += 2;
      P.dashCD *= 0.85;
      P.pls++;
    },
    det: () => ['Dash: 12 peluru melingkar + semua CD -1,5 dtk', 'Cooldown skill -' + Math.round((1 - cdrMul()) * 100) + '% · dash ' + P.dashCD.toFixed(2) + ' dtk'],
  },
  {
    id: 'frostfire',
    name: 'FROSTFIRE',
    rec: ['FROST ROUNDS', 'INCENDIARY', 'HUNTER MARK'],
    desc: 'peluru membakar & membekukan; musuh beku + terbakar menerima damage +50%',
    icon: 'evFrostfire',
    apply: () => {
      P.froz++;
      P.inc++;
      P.mark++;
    },
    det: () => ['Beku + terbakar: damage diterima x1,5 (SHATTER)', 'Kolam api memperlambat musuh · bakar ' + Math.round(FIRE_DPS + P.dmg * 0.5) + ' dmg/dtk'],
  },
];
const EVO_BY_ID = {};
for (const v of EVO) EVO_BY_ID[v.id] = v;
