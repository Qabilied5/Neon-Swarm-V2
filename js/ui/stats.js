// Layar STAT: tombol STAT (di samping PAUSE) mem-pause game & menampilkan statistik pemain, semua upgrade/skill yang sudah
// diambil beserta jumlah stack dan efek angkanya saat ini. Daftar bisa digeser (scroll) dengan jari / roda mouse.
// S tetap 'pause' (ST.on = 1 hanya menandai panel terbuka), jadi semua logika pause lama ikut berlaku.
const ST = { on: 0, sy: 0, max: 0, id: null, ly: 0, y0: 0, mv: 0, tab: 0 }; // tab 0 = STATISTIK, 1 = ENCHANT (ui/enchant.js)

// efek upgrade saat ini (maks 2 baris pendek) - dibaca dari nilai P sekarang, jadi selalu sesuai stack
function statDetail(n) {
  const f1 = (v) => (+v).toFixed(1),
    sk = P.sk;
  switch (n) {
    case 'RAPID FIRE':
      return ['Tembakan ' + f1(P.rate) + '/dtk', '+25% per stack'];
    case 'DAMAGE UP':
      return ['Damage peluru ' + f1(P.dmg), '+30% per stack'];
    case 'MULTISHOT':
      return ['' + P.multi + ' peluru per tembakan'];
    case 'PIERCING':
      return ['Tembus ' + P.pier + ' musuh'];
    case 'SPEED':
      return ['Kecepatan gerak ' + Math.round(P.sp), '+15% per stack'];
    case 'ARMOR':
      return ['Max HP ' + P.mh, '+30 per stack'];
    case 'MAGNET':
      return ['Jangkauan orb ' + Math.round(P.mag) + ' px', '+60% per stack'];
    case 'DASH+':
      return ['Cooldown dash ' + P.dashCD.toFixed(2) + ' dtk'];
    case 'ORBITAL SHURIKEN':
      return ['' + P.orb + ' shuriken', orbDmg() + ' damage per kena'];
    case 'SKILL: NOVA (Q)':
      return ['Radius ' + (210 + sk.q * 35) + ' · CD ' + Math.max(3, 9 - sk.q) + ' dtk', 'Damage ' + Math.round(40 + P.dmg * 3)];
    case 'SKILL: LASER (E)':
      return ['CD ' + Math.max(3, 8 - sk.e) + ' dtk · lebar ' + (12 + sk.e * 3), 'Maks ' + LASER_DMG + ' dmg + eksekusi ' + Math.round(LASER_EXEC * 100) + '% HP'];
    case 'SKILL: BLACK HOLE (R)':
      return ['Radius ' + (170 + sk.r * 25) + ' · CD ' + Math.max(6, 14 - sk.r * 1.5) + ' dtk', 'Aktif 3,5 dtk'];
    case 'CHAIN LIGHTNING':
      return ['Jangkauan ' + (CHAIN_R0 + CHAIN_RS * P.ch) + ' px', '' + (P.ch + 1) + ' target'];
    case 'EXPLOSIVE ROUNDS':
      return ['Ledakan ' + boomR() + ' px · ' + (ev('cluster') ? 60 : 40) + '% damage', 'Stack tidak menambah efek'];
    case 'VAMPIRISM':
      return ['+' + f1(vampHeal()) + ' HP per kill', 'Naik tiap wave (sekarang ' + wave + ')'];
    case 'CRITICAL':
      return ['Peluang crit ' + Math.round(P.crit * 100) + '%', 'Damage x3.5'];
    case 'SKILL: TELEPORT (T)':
      return ['CD ' + TP_CD + ' dtk', 'Jarak maks ' + TP_RANGE + ' px'];
    case 'SUPER SHOT':
      return ['Peluang ' + Math.round(P.ss * 100) + '% per tembakan', 'Damage ' + SS_DMG];
    case 'SANDEVISTAN':
      return ['Musuh menyerang bayangan', SANDY_T + ' dtk setelah dash'];
    case 'SUPER SHIELD':
      return [P.shn > 0 ? 'Aktif: sisa ' + P.shn + '/' + shMax() + ' tahanan' : 'Hancur · pulih ' + Math.ceil(P.shc) + ' dtk', 'Damage -' + Math.round((1 - SH_RED) * 100) + '%'];
    case 'FROST ROUNDS':
      return ['Slow ' + (FROST_T + FROST_TS * P.froz).toFixed(1) + ' dtk', 'Musuh jadi ' + Math.round(FROST_SLOW * 100) + '% kecepatan'];
    case 'TOXIC ROUNDS':
      return ['Racun ' + Math.round((TOX_DPS + P.dmg * 0.3) * P.psn) + ' dmg/dtk', 'Selama ' + TOX_T + ' dtk'];
    case 'RICOCHET':
      return ['Memantul ' + P.rico + 'x di tepi layar'];
    case 'HOMING':
      return ['Belok ' + HOM_TURN * P.hom + ' rad/dtk', 'Jangkauan ' + HOM_R + ' px'];
    case 'SPIKE AURA':
      return ['Radius ' + auraR() + ' px', Math.round(AURA_DPS * P.aura) + ' dmg/dtk'];
    case 'REGEN':
      return ['+' + (REGEN_HPS * P.regen).toFixed(1) + ' HP per dtk'];
    case 'DASH STRIKE':
      return ['Dash melukai ' + Math.round(P.dmg * DSTR_MUL * P.dstr) + ' dmg', 'Sekali per musuh per dash'];
    case 'XP SURGE':
      return ['XP orb +' + Math.round(XPB_PCT * P.xpb * 100) + '%'];
    case 'BERSERK':
      return ['Damage +' + Math.round(BERS_PCT * P.bers * 100) + '% saat HP nyaris habis', 'Sekarang x' + dmgMul().toFixed(2)];
    case 'SHRAPNEL':
      return [shrN() + ' pecahan per kill', Math.round(P.dmg * SHR_DMG) + ' dmg per pecahan'];
    case 'PULSE':
      return [PLS_N + 2 * P.pls + ' peluru tiap ' + plsCd().toFixed(1) + ' dtk'];
    case 'EXECUTIONER':
      return ['Musuh mati bila HP < ' + Math.round(exeTh() * 100) + '%', 'Boss kebal'];
    case 'DRONE':
      return ['' + P.drn + ' drone', Math.round(P.dmg * DRN_DMG) + ' dmg per tembakan'];
    case 'THICK SKIN':
      return ['Damage diterima -' + Math.round(THICK_PCT * Math.min(P.thick, 8) * 100) + '%'];
    case 'DEADEYE':
      return ['Crit x' + (3.5 + DEAD_CRIT * P.dead).toFixed(1) + ' damage', 'Peluang crit ' + Math.round(P.crit * 100) + '%'];
    case 'HUNTER MARK':
      return ['Musuh bertanda +' + Math.round(MARK_PCT * P.mark * 100) + '% damage', 'Tanda ' + MARK_T + ' dtk'];
    case 'KINETIC ROUNDS':
      return ['Dorong ' + KIN_PUSH * P.kin + ' px per peluru kena', 'Boss tidak terdorong'];
    case 'THORNS':
      return ['Saat terkena: ' + Math.round(thornD()) + ' dmg', 'Radius ' + Math.round(thornR()) + ' px + dorongan'];
    case 'ADRENALINE':
      return ['Tiap kill: +' + Math.round(ADR_SPD * P.adr * 100) + '% gerak, +' + Math.round(ADR_RATE * P.adr * 100) + '% tembak', 'Selama ' + ADR_T + ' dtk'];
    case 'SCAVENGER':
      return ['Peluang orb tambahan ' + Math.round(Math.min(0.9, SCV_PCT * P.scv) * 100) + '%', '2 orb per drop'];
    case 'LUCKY CHARM':
      return ['Reroll ' + (RR_MIN + P.luck) + '-' + (RR_MAX + P.luck) + ' per level up (diundi)'];
    case 'COOLDOWN CORE':
      return ['Cooldown skill & heal -' + Math.round((1 - cdrMul()) * 100) + '%'];
    case 'REAR GUN':
      return ['' + P.rear + ' peluru ke belakang', Math.round(REAR_DMG * 100) + '% damage'];
    case 'MINE LAYER':
      return ['' + P.mine + ' ranjau per dash', 'Ledakan ' + Math.round(25 + P.dmg * 4) + ' dmg · radius ' + Math.round(mineR()) + ' px'];
    case 'INCENDIARY':
      return ['Peluang api ' + Math.round(Math.min(1, INC_CH * P.inc) * 100) + '% per kill', 'Api ' + Math.round(fireDps()) + ' dmg/dtk · ' + (FIRE_R + 6 * Math.min(P.inc, 5)) + ' px'];
    case 'SNIPER STANCE':
      return ['Diam ' + SNIP_T + ' dtk: damage +' + Math.round(SNIP_PCT * P.snip * 100) + '%', P.evt.still >= SNIP_T && P.snip ? 'Aktif sekarang' : 'Belum aktif'];
    case 'SECOND WIND':
      return [P.rvm - P.rvu > 0 ? 'Siap: bangkit ' + Math.round(REV_HP * 100) + '% HP' : 'Sudah terpakai'];
  }
  return [];
}

// upgrade yang sudah diambil, urutan sesuai daftar UP
function statEntries() {
  const r = [];
  for (const u of UP) {
    const n = P.up[u[0]] || 0;
    if (n) r.push({ name: u[0], n, skill: u[0].startsWith('SKILL'), d: statDetail(u[0]) });
  }
  for (const v of EVO) {
    const n = P.evo[v.id] || 0;
    if (n) r.push({ name: v.name, n, evo: 1, d: v.det() }); // Evo Effect (emas)
  }
  return r;
}

function statLayout() {
  const sw = UW - SAFE.l - SAFE.r,
    x0 = SAFE.l + 16,
    w = sw - 32,
    cols = sw >= 640 ? 3 : 2,
    gp = 8,
    ty = Math.max(SAFE.t + 8, 0) + 30;
  return {
    x0,
    w,
    cols,
    gp,
    cw: (w - gp * (cols - 1)) / cols,
    ch: 52,
    ty, // baris judul
    ly: Math.max(112, ty + 66), // awal daftar (di bawah baris tombol UI kanan-atas)
    lb: UH - SAFE.b - 10, // batas bawah daftar
    rx: UW - SAFE.r - 210, // batas kanan teks ringkasan (tombol UI ada di kanan)
    btn: { x: x0 + 190, y: ty - 22, w: 112, h: 30 }, // tombol LANJUT
    tabs: [
      { x: x0 + 190 + 112 + 14, y: ty - 22, w: 84, h: 30 }, // tab STAT
      { x: x0 + 190 + 112 + 14 + 84 + 8, y: ty - 22, w: 104, h: 30 }, // tab ENCHANT
    ],
  };
}

function statBtnHit(x, y) {
  const b = statLayout().btn;
  return x >= b.x - 8 && x <= b.x + b.w + 8 && y >= b.y - 8 && y <= b.y + b.h + 8;
}
// tab yang tersentuh (0 STAT / 1 ENCHANT) atau -1. Tab ENCHANT tidak ada di mode tutorial.
function statTabAt(x, y) {
  const t = statLayout().tabs;
  for (let i = 0; i < (TUT.on ? 1 : 2); i++) if (x >= t[i].x - 4 && x <= t[i].x + t[i].w + 4 && y >= t[i].y - 8 && y <= t[i].y + t[i].h + 8) return i;
  return -1;
}
// ketukan di panel STAT: LANJUT / tab / isi tab ENCHANT
function statTap(x, y) {
  if (statBtnHit(x, y)) return statClose();
  const i = statTabAt(x, y);
  if (i >= 0) {
    if (ST.tab != i) {
      ST.tab = i;
      ST.sy = 0;
    }
    return;
  }
  if (ST.tab == 1 && !TUT.on) encTap(x, y);
}
function statClose() {
  ST.on = 0;
  ST.id = null;
  if (S == 'pause') S = 'play';
}
function statOpen() {
  ST.on = 1;
  ST.sy = 0;
  ST.tab = 0;
  ST.id = null;
  PAU.conf = 0;
}
// sentuhan di panel: mulai seret (scroll) / lepas = tap tombol LANJUT bila tidak digeser
function statStart(id, y) {
  ST.id = id;
  ST.ly = ST.y0 = y;
  ST.mv = 0;
}
function statMove(y) {
  if (Math.abs(y - ST.y0) > 8) ST.mv = 1;
  ST.sy = cl(ST.sy - (y - ST.ly), 0, ST.max);
  ST.ly = y;
}
function statEnd(id, x, y, type) {
  if (id !== ST.id) return;
  ST.id = null;
  if (type == 'touchend' && !ST.mv) statTap(x, y);
}
addEventListener(
  'wheel',
  (e) => {
    if (ST.on && S == 'pause') ST.sy = cl(ST.sy + e.deltaY, 0, ST.max);
  },
  { passive: true },
);

function drawStats() {
  const L = statLayout(),
    list = statEntries(),
    rows = Math.ceil(list.length / L.cols),
    listH = L.lb - L.ly,
    total = rows * (L.ch + L.gp) - L.gp;
  if (ST.tab != 1 || TUT.on) {
    // tab ENCHANT menghitung batas scroll-nya sendiri (drawEnchant); jangan dijepit oleh daftar STAT yang pendek
    ST.max = Math.max(0, total - listH);
    ST.sy = cl(ST.sy, 0, ST.max);
  }

  g.fillStyle = 'rgba(0,0,0,.82)';
  g.fillRect(0, 0, UW, UH);
  if (TUT.on) ST.tab = 0;
  const enc = ST.tab == 1;
  tx(enc ? 'ENCHANT' : 'STATISTIK', L.x0, L.ty, Math.min(26, UH / 12), enc ? '#b967ff' : '#22d3ee', 'left', 14);

  // tombol LANJUT
  const b = L.btn;
  g.shadowColor = '#39ff88';
  g.shadowBlur = 6;
  g.fillStyle = 'rgba(10,18,32,.85)';
  g.strokeStyle = '#39ff88';
  g.lineWidth = 2;
  rrect(b.x, b.y, b.w, b.h, b.h / 2);
  g.fill();
  g.stroke();
  g.shadowBlur = 0;
  tx('LANJUT', b.x + b.w / 2, b.y + b.h / 2 + 5, 14, '#39ff88', 'center', 0);

  // tab STAT / ENCHANT (tab ENCHANT: titik emas berdenyut bila ada resep yang siap dibuat)
  if (!TUT.on) {
    [['STAT', '#22d3ee'], ['ENCHANT', '#b967ff']].forEach(([lb, c], i) => {
      const t = L.tabs[i],
        on = ST.tab == i;
      g.shadowColor = c;
      g.shadowBlur = on ? 8 : 0;
      g.fillStyle = on ? c + '44' : 'rgba(10,18,32,.85)';
      g.strokeStyle = on ? c : c + '88';
      g.lineWidth = on ? 2 : 1.5;
      rrect(t.x, t.y, t.w, t.h, t.h / 2);
      g.fill();
      g.stroke();
      g.shadowBlur = 0;
      tx(lb, t.x + t.w / 2, t.y + t.h / 2 + 5, 13, on ? '#fff' : c, 'center', 0);
      if (i == 1 && !on && encReady()) {
        g.fillStyle = '#ffd166';
        g.globalAlpha = 0.6 + 0.4 * Math.sin(T * 6);
        g.beginPath();
        g.arc(t.x + t.w - 6, t.y + 4, 5, 0, TAU);
        g.fill();
        g.globalAlpha = 1;
      }
    });
  }

  // ringkasan dasar (dua baris, dijaga tidak menabrak tombol UI di kanan)
  const sz = 12,
    mw = L.rx - L.x0,
    l1 = `HP ${Math.ceil(P.hp)}/${P.mh}  ·  LV ${P.lv}  ·  XP ${Math.floor(P.xp)}/${P.need}  ·  WAVE ${wave}`,
    l2 = `DMG ${(+P.dmg).toFixed(1)}  ·  TEMBAK ${(+P.rate).toFixed(1)}/dtk  ·  GERAK ${Math.round(P.sp)}  ·  CRIT ${Math.round(P.crit * 100)}%`;
  if (enc) {
    tx(fitText('Gabungkan 3 efek menjadi 1 EVO EFFECT yang lebih kuat.', sz, mw), L.x0, L.ty + 26, sz, '#e8f4ff', 'left', 0);
    tx(fitText('Bahan hilang (1 stack tiap bahan). Ketuk resep lalu ENCHANT.', sz, mw), L.x0, L.ty + 44, sz, '#7aa2c0', 'left', 0);
    drawEnchant();
    uiDraw();
    return;
  }
  tx(fitText(l1, sz, mw), L.x0, L.ty + 26, sz, '#e8f4ff', 'left', 0);
  tx(fitText(l2, sz, mw), L.x0, L.ty + 44, sz, '#7aa2c0', 'left', 0);

  // daftar upgrade (dipotong ke area daftar & bisa digeser)
  if (!list.length) {
    tx('Belum ada upgrade. Naik level untuk memilih kartu.', UW / 2, (L.ly + L.lb) / 2, 14, '#7aa2c0', 'center', 0);
  } else {
    g.save();
    g.beginPath();
    g.rect(L.x0 - 6, L.ly, L.w + 12, listH);
    g.clip();
    list.forEach((it, i) => {
      const x = L.x0 + (i % L.cols) * (L.cw + L.gp),
        y = L.ly + Math.floor(i / L.cols) * (L.ch + L.gp) - ST.sy;
      if (y + L.ch < L.ly || y > L.lb) return; // di luar layar
      const c = it.evo ? '#ffd166' : it.skill ? '#b967ff' : '#22d3ee';
      g.shadowBlur = 0;
      g.fillStyle = 'rgba(10,18,32,.9)';
      g.strokeStyle = c;
      g.lineWidth = 1.5;
      rrect(x, y, L.cw, L.ch, 8);
      g.fill();
      g.stroke();
      const bw = it.evo ? 46 : 34;
      g.fillStyle = '#39ff8833';
      g.strokeStyle = '#39ff88';
      rrect(x + L.cw - bw - 8, y + 7, bw, 17, 8);
      g.fill();
      g.stroke();
      tx(it.evo ? 'EVO' + (it.n > 1 ? ' x' + it.n : '') : 'x' + it.n, x + L.cw - bw / 2 - 8, y + 20, it.evo ? 10 : 12, '#39ff88', 'center', 0);
      tx(fitText(it.name, 12, L.cw - bw - 28), x + 10, y + 20, 12, c, 'left', 0);
      it.d.forEach((s, j) => tx(fitText(s, 11, L.cw - 20), x + 10, y + 36 + j * 13, 11, j ? '#7aa2c0' : '#cfe3f2', 'left', 0));
    });
    g.restore();
    if (ST.max > 0) {
      // penanda scroll
      const bh = Math.max(24, (listH * listH) / total),
        by = L.ly + (ST.sy / ST.max) * (listH - bh);
      g.fillStyle = 'rgba(122,162,192,.55)';
      rrect(UW - SAFE.r - 8, by, 3, bh, 2);
      g.fill();
    }
  }
  uiDraw(); // tombol UI (STAT / PAUSE / ...) tetap terlihat di atas panel
}
