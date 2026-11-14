// Logika efek baru (Frost, Toxic, Ricochet, Homing, Aura, Drone, dst) & Evo Effect.
// Hook ada di: damage.js (hit/kill/boom), bullets.js, enemies.js, player.js (dash/hurt), update/player.js (tembak), update/pickups.js (level up).

// ---- pembantu nilai ----
const exeTh = () => Math.min(0.5, EXE_PCT * P.exe + (ev('reaper') ? 0.1 : 0)), // ambang eksekusi (fraksi HP)
  auraR = () => AURA_R0 + AURA_RS * P.aura,
  plsCd = () => Math.max(2.5, PLS_CD0 - 0.9 * P.pls),
  shrN = () => SHR_N + 2 * P.shr + (ev('cluster') ? 4 : 0),
  adrOn = () => (P.evt.adr > 0 ? P.adr : 0), // stack Adrenaline yang sedang aktif (0 bila buff habis)
  rateMul = () => (ev('over') && P.hp < P.mh * 0.6 ? 1.5 : 1) * (1 + ADR_RATE * adrOn()), // Overclock (HP < 60% = x1,5) + Adrenaline
  spdMul = () => 1 + ADR_SPD * adrOn(), // Adrenaline: pengali kecepatan gerak
  stance = () => (P.snip && P.evt.still >= SNIP_T ? 1 + SNIP_PCT * P.snip : 1), // Sniper Stance
  dmgMul = () => (1 + BERS_PCT * P.bers * (1 - P.hp / P.mh)) * stance() * ascMul(), // Berserk + Sniper Stance + Ascendant
  ascMul = () => (ev('ascend') ? 1 + 0.04 * (P.lv - 1) : 1), // Ascendant: +4% damage tiap level (naik terus)
  ascR = () => Math.min(700, 400 + 10 * P.lv), // Ascendant: radius ledakan level up
  ascD = () => 150 + P.dmg * 8 + P.lv * 15, // Ascendant: damage ledakan level up (naik tiap level)
  cdrMul = () => 1 - Math.min(0.6, CDR_PCT * P.cdr + (ev('temporal') ? 0.1 : 0)), // Cooldown Core
  fireDps = () => (FIRE_DPS + P.dmg * 0.6) * (1 + 0.25 * (Math.max(1, P.inc) - 1)), // Incendiary: damage api/dtk
  mineR = () => (MINE_R + MINE_RS * Math.max(0, P.mine - 1)) * (ev('trap') ? 1.4 : 1), // Mine Layer: radius ledakan (naik tiap stack)
  thornR = () => THORN_R + 12 * P.thorn + (ev('bulwark') ? 110 : 0), // Thorns: radius
  thornD = () => THORN_DMG * P.thorn + P.dmg * 3 + (ev('bulwark') ? 40 : 0); // Thorns: damage

// peluru pemain serba guna. o: sp kecepatan, r, p tembus, life, rc pantulan, hm homing tambahan, c warna, mini (anak Seeker)
function mkB(x, y, a, d, o = {}) {
  if (B.length > 420) return;
  const sp = o.sp || BUL_SPD;
  B.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: o.r || 4, d, p: o.p || 0, life: o.life || 1.1, h: new Set(), rc: o.rc || 0, hm: o.hm || 0, c: o.c, mini: o.mini || 0 });
}

// ledakan area + dorongan: dipakai Aegis, Phoenix, Ascendant, Singularity
function shock(cx, cy, r, d, c = '#22d3ee') {
  RG.push({ x: cx, y: cy, r: 0, mr: r, c, w: 6, l: 0.5, m: 0.5 }, { x: cx, y: cy, r: 0, mr: r * 0.6, c: '#fff', w: 2, l: 0.35, m: 0.35 });
  for (const e of E) {
    const dd = Math.hypot(e.x - cx, e.y - cy) || 1;
    if (dd < r + e.r) {
      hit(e, d);
      if (e.k != 'boss') {
        e.x += ((e.x - cx) / dd) * 80;
        e.y += ((e.y - cy) / dd) * 80;
      }
    }
  }
  pf(cx, cy, 24, c, 320, 0.6);
  shake = Math.max(shake, 6);
  snd(140, 0.3, 'sawtooth', 0.06);
}

// ---- dipanggil dari hit(e, d, crit) ----
let _busy = 0;
function hitFx(e, d, c) {
  // EXECUTIONER / SOUL REAPER: musuh biasa ber-HP rendah langsung mati
  if (P.exe && e.k != 'boss' && !(e.pw > 1) && e.hp > 0 && e.hp < e.mh * exeTh()) { // elit (e.pw > 1) kebal eksekusi seperti boss
    e.hp = 0;
    if (FT.length < 80) FT.push({ x: e.x, y: e.y - e.r - 12, t: 0.8, s: '☠', c: '#ff2e63', z: 18 });
    if (ev('reaper')) P.hp = Math.min(P.mh, P.hp + 3);
  }
  // HEADHUNTER: crit pada musuh bertanda = headshot (+120% damage), tanda diperpanjang
  if (c && ev('headhunter') && e.mk > 0 && e.hp > 0) {
    e.hp -= d * 1.2;
    e.mk = MARK_T;
    if (FT.length < 80) FT.push({ x: e.x, y: e.y - e.r - 26, t: 0.8, s: 'HEADSHOT', c: '#ff2e63', z: 14 });
  }
  // STORM CALLER: crit memanggil petir ke 4 musuh terdekat
  if (c && ev('storm') && !_busy) {
    _busy = 1;
    let f = e;
    for (const o of E.filter((o) => o != e && Math.hypot(o.x - e.x, o.y - e.y) < 260)
      .sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))
      .slice(0, 4)) {
      hit(o, d * 0.7);
      AR.push({ p: [[f.x, f.y], [(f.x + o.x) / 2 + R(-14, 14), (f.y + o.y) / 2 + R(-14, 14)], [o.x, o.y]], l: 0.22 });
      f = o;
    }
    snd(1000, 0.06, 'sawtooth', 0.03);
    _busy = 0;
  }
}

// ---- dipanggil dari kill(e) ----
function killFx(e) {
  // ADRENALINE (+ BLITZKRIEG): tiap kill memicu buff gerak & tembak
  if (P.adr) P.evt.adr = ADR_T + (ev('blitz') ? 1 : 0);
  if (ev('blitz')) P.dc = Math.max(0, P.dc - 0.4);
  // SCAVENGER (+ GOLD RUSH): orb XP tambahan
  // elit (wave 31+) + GOLD RUSH: orb tambahan SELALU jatuh -> XP elit (sudah 4-8x) dikali lagi oleh Gold Rush
  if (P.scv && (Math.random() < Math.min(0.9, SCV_PCT * P.scv) || (ev('gold') && e.pw > 1 && e.k != 'boss'))) {
    const n = SCV_ORBS * (ev('gold') ? GOLD_ORB_MUL : 1), // GOLD RUSH: orb tambahan melimpah
      sp = ev('gold') ? 26 : 14;
    for (let j = 0; j < n; j++) O.push({ x: e.x + R(-sp, sp), y: e.y + R(-sp, sp), v: Math.max(1, e.xp) });
  }
  if (ev('gold')) {
    score += Math.round(e.xp * 5); // +50% skor dasar kill
    if (HL.length < 2 && Math.random() < 0.06) HL.push({ x: cl(e.x, 30, W - 30), y: cl(e.y, 30, H - 30), ph: R(0, TAU) });
  }
  // INCENDIARY (+ INFERNO): kolam api; INFERNO juga meledak
  if (P.inc || ev('inferno')) {
    const inf = ev('inferno');
    if (inf || Math.random() < INC_CH * P.inc) addFire(e.x, e.y);
    if (inf) {
      RG.push({ x: e.x, y: e.y, r: 0, mr: 95, c: '#ff6a00', w: 4, l: 0.3, m: 0.3 });
      for (const o of E) if (o != e && Math.hypot(o.x - e.x, o.y - e.y) < 95 + o.r) hit(o, 30 + P.dmg * 2);
    }
  }
  // HEADHUNTER: tanda menular ke musuh sekitar saat musuh bertanda mati
  if (ev('headhunter') && e.mk > 0) for (const o of E) if (o != e && Math.hypot(o.x - e.x, o.y - e.y) < 280) o.mk = MARK_T + 2;
  if (P.shr) {
    // SHRAPNEL (+ CLUSTER BOMB)
    const n = shrN(),
      k = ev('cluster') ? 1.4 : 1,
      a0 = R(0, TAU);
    for (let j = 0; j < n; j++) mkB(e.x, e.y, a0 + (j * TAU) / n, P.dmg * SHR_DMG * k, { sp: 430, life: 0.5, c: '#ff9f1c', r: 3 });
  }
  if (ev('plague') && e.pt > 0) {
    // PLAGUE BEARER: racun menyebar & memulihkan HP
    for (const o of E) if (o != e && Math.hypot(o.x - e.x, o.y - e.y) < 170) {
      o.pt = TOX_T;
      o.pd = Math.max(o.pd || 0, e.pd || 0);
    }
    P.hp = Math.min(P.mh, P.hp + 2);
    RG.push({ x: e.x, y: e.y, r: 0, mr: 170, c: '#7cff3a', w: 4, l: 0.35, m: 0.35 });
    pf(e.x, e.y, 10, '#7cff3a', 200, 0.5);
  }
}

// ---- KOLAM API (Incendiary / Inferno / Frostfire) & RANJAU (Mine Layer / Trapmaster) ----
// Disimpan di P.zn (ikut direset oleh init). Kolam api hanya memberi status terbakar (e.bt/e.bd) - damage-nya dihitung di updEnemies.
function addFire(x, y) {
  if (P.zn.length >= ZN_MAX) P.zn.shift();
  const inf = ev('inferno'),
    T0 = FIRE_T + (inf ? 1.5 : 0);
  P.zn.push({ k: 'fire', x, y, r: FIRE_R + (inf ? 30 : 0) + 6 * Math.min(P.inc, 5), l: T0, m: T0, dps: fireDps() });
}
function layMines() {
  for (let j = 0; j < P.mine; j++) {
    if (P.zn.length >= ZN_MAX) P.zn.shift();
    P.zn.push({ k: 'mine', x: P.x + R(-22, 22), y: P.y + R(-22, 22), l: MINE_T, m: MINE_T, arm: 0.5 });
  }
}
function mineBoom(z) {
  const r = mineR(),
    d = 25 + P.dmg * 4 * (ev('trap') ? 1.3 : 1);
  RG.push({ x: z.x, y: z.y, r: 0, mr: r, c: '#ff9f1c', w: 5, l: 0.35, m: 0.35 });
  for (const e of E) if (Math.hypot(e.x - z.x, e.y - z.y) < r + e.r) hit(e, d);
  if (ev('trap')) {
    // TRAPMASTER: petir ke 3 musuh terdekat dari ranjau
    let f = z;
    for (const o of [...E].sort((a, b) => Math.hypot(a.x - z.x, a.y - z.y) - Math.hypot(b.x - z.x, b.y - z.y)).slice(0, 3)) {
      if (Math.hypot(o.x - z.x, o.y - z.y) > 300) break;
      hit(o, d * 0.6);
      AR.push({ p: [[f.x, f.y], [(f.x + o.x) / 2 + R(-14, 14), (f.y + o.y) / 2 + R(-14, 14)], [o.x, o.y]], l: 0.22 });
      f = o;
    }
  }
  pf(z.x, z.y, 18, '#ff9f1c', 300, 0.5);
  shake = Math.max(shake, 5);
  snd(110, 0.25, 'sawtooth', 0.07);
}
function updZones(dt) {
  for (let i = P.zn.length - 1; i >= 0; i--) {
    const z = P.zn[i];
    z.l -= dt;
    if (z.k == 'fire') {
      for (const e of E)
        if (Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r) {
          e.bt = 0.5;
          e.bd = Math.max(e.bd || 0, z.dps);
          if (ev('frostfire')) e.slw = Math.max(e.slw || 0, 0.4);
        }
      if (Math.random() < dt * 9) pf(z.x + R(-z.r, z.r) * 0.7, z.y + R(-z.r, z.r) * 0.7, 1, Math.random() < 0.5 ? '#ff9f1c' : '#ff2e63', 50, 0.4);
    } else if ((z.arm -= dt) <= 0 && E.some((e) => Math.hypot(e.x - z.x, e.y - z.y) < 34 + e.r)) {
      mineBoom(z);
      z.l = 0;
    }
    if (z.l <= 0) P.zn.splice(i, 1);
  }
}

// ---- THORNS / BULWARK: dipanggil dari hurt() saat pemain benar-benar terkena serangan ----
function thornFx() {
  const bw = ev('bulwark');
  if (!P.thorn && !bw) return;
  const r = thornR(),
    d = thornD();
  if (bw) {
    shock(P.x, P.y, r, d, '#ff9f1c');
    P.hp = Math.min(P.mh, P.hp + 4);
    return;
  }
  RG.push({ x: P.x, y: P.y, r: 0, mr: r, c: '#ff9f1c', w: 4, l: 0.35, m: 0.35 });
  for (const e of E) {
    const dd = Math.hypot(e.x - P.x, e.y - P.y) || 1;
    if (dd < r + e.r) {
      hit(e, d);
      if (e.k != 'boss') {
        e.x += ((e.x - P.x) / dd) * 50;
        e.y += ((e.y - P.y) / dd) * 50;
      }
    }
  }
  pf(P.x, P.y, 10, '#ff9f1c', 240, 0.4);
}

// ---- REAR GUN / CROSSFIRE: peluru tambahan di sekitar tembakan utama ----
function extraFire() {
  const d = P.dmg * dmgMul(),
    o = { p: P.pier, rc: P.rico },
    ox = (a) => [P.x + Math.cos(a) * 14, P.y + Math.sin(a) * 14];
  for (let j = 0; j < P.rear; j++) {
    const a = P.a + Math.PI + (j - (P.rear - 1) / 2) * 0.25;
    mkB(...ox(a), a, d * REAR_DMG, o);
  }
  if (ev('cross'))
    for (const q of [-1, 1]) {
      const a = P.a + (q * Math.PI) / 2;
      mkB(...ox(a), a, d * 0.5, o);
    }
}

// ---- TEMPORAL ENGINE: dipanggil dari dash() ----
function temporalFx() {
  for (const k in P.cd) P.cd[k] = Math.max(0, P.cd[k] - 1.5);
  for (let j = 0; j < 12; j++) mkB(P.x, P.y, (j * TAU) / 12 + P.ot, P.dmg * 0.9, { sp: 520, life: 0.8, p: 1, c: '#b967ff' });
  RG.push({ x: P.x, y: P.y, r: 10, mr: 90, c: '#b967ff', w: 3, l: 0.3, m: 0.3 });
}

// ---- dipanggil dari hurt(): Second Wind / Phoenix Heart. true = berhasil bangkit ----
function tryRevive() {
  if (TUT.on || P.rvm - P.rvu <= 0) return false;
  P.rvu++;
  const ph = ev('phoenix');
  P.hp = P.mh * (ph ? 0.6 : REV_HP);
  P.inv = 2;
  RG.push({ x: P.x, y: P.y, r: 0, mr: 200, c: '#ffd166', w: 8, l: 0.6, m: 0.6 });
  pf(P.x, P.y, 40, '#ff9f1c', 420, 0.9);
  FT.push({ x: P.x, y: P.y - P.r - 16, t: 1.4, s: ph ? 'PHOENIX!' : 'BANGKIT!', c: '#ffd166', z: 22 });
  if (ph) shock(P.x, P.y, 320, 200 + P.dmg * 5, '#ff9f1c');
  banner(ph ? 'PHOENIX HEART' : 'SECOND WIND', 'bangkit dari kematian');
  snd(440, 0.4, 'triangle', 0.08);
  snd(880, 0.4, 'sine', 0.06);
  return true;
}

// ---- update per frame (dipanggil upd()) ----
function updEvo(dt) {
  const ev_ = P.evt;
  if (P.regen && P.hp < P.mh) P.hp = Math.min(P.mh, P.hp + REGEN_HPS * P.regen * dt);
  // SNIPER STANCE: hitung lama diam
  ev_.still = Math.hypot(P.x - ev_.lx, P.y - ev_.ly) > 0.4 ? 0 : ev_.still + dt;
  ev_.lx = P.x;
  ev_.ly = P.y;
  // ADRENALINE: jejak partikel selama buff; BLITZKRIEG: tubuh melukai musuh dekat
  if (ev_.adr > 0) {
    ev_.adr -= dt;
    if (PT.length < 400 && Math.random() < 0.5) PT.push({ x: P.x, y: P.y, vx: 0, vy: 0, l: 0.3, m: 0.3, c: '#7cffcb', s: 4 });
    if (ev('blitz'))
      for (const e of E)
        if (Math.hypot(e.x - P.x, e.y - P.y) < 52 + e.r) {
          e.hp -= P.dmg * 5 * dt;
          e.fl = Math.max(e.fl, 0.03);
        }
  }
  updZones(dt); // kolam api & ranjau
  // PULSE: semburan peluru melingkar
  if (P.pls && (ev_.pls -= dt) <= 0) {
    ev_.pls = plsCd();
    const n = PLS_N + 2 * P.pls;
    for (let j = 0; j < n; j++) mkB(P.x, P.y, (j * TAU) / n + P.ot, P.dmg * PLS_DMG, { sp: 520, life: 0.9, p: 1, c: '#7cffcb' });
    RG.push({ x: P.x, y: P.y, r: 10, mr: 70, c: '#7cffcb', w: 3, l: 0.3, m: 0.3 });
  }
  // DRONE (+ HIVE MIND)
  if (P.drn) {
    P.drp += dt * 0.8;
    if ((ev_.drn -= dt) <= 0) {
      ev_.drn = DRN_CD / (ev('hive') ? 1.7 : 1);
      for (let j = 0; j < P.drn; j++) {
        const [dx, dy] = dronePos(j);
        let tg = null,
          td = 650;
        for (const e of E) {
          const d = Math.hypot(e.x - dx, e.y - dy);
          if (d < td) {
            td = d;
            tg = e;
          }
        }
        if (tg) mkB(dx, dy, Math.atan2(tg.y - dy, tg.x - dx), P.dmg * DRN_DMG * (ev('hive') ? 2 : 1), { sp: 600, c: '#22d3ee', hm: ev('hive') ? 4 : 0, life: 1, p: ev('hive') ? 1 : 0 });
      }
    }
  }
  // SINGULARITY: black hole otomatis, runtuh jadi ledakan
  if (ev('sing') && E.length && (ev_.sing -= dt) <= 0) {
    ev_.sing = 9;
    const t = pick(E);
    VX.push({ x: cl(t.x, 0, W), y: cl(t.y, 0, H), l: 4, m: 4, r: 260, col: 1 });
    snd(80, 0.6, 'sine', 0.09);
  }
  // JUDGEMENT: serangan orbital ke 3 musuh terkuat
  if (ev('judge') && E.length && (ev_.judge -= dt) <= 0) {
    ev_.judge = 6;
    for (const e of [...E].sort((a, b) => b.mh - a.mh).slice(0, 3)) {
      hit(e, 120 + P.dmg * 8);
      RG.push({ x: e.x, y: e.y, r: 0, mr: e.r * 3 + 30, c: '#ffd166', w: 6, l: 0.4, m: 0.4 });
      for (let i = 0; i < 10; i++) pf(e.x, e.y - i * 28, 1, '#ffd166', 60, 0.5);
      FT.push({ x: e.x, y: e.y - e.r - 14, t: 0.9, s: 'JUDGEMENT', c: '#ffd166', z: 14 });
    }
    shake = Math.max(shake, 10);
    snd(70, 0.35, 'sawtooth', 0.09);
  }
}
// posisi drone ke-j (mengorbit pemain)
function dronePos(j) {
  const a = P.drp + (j * TAU) / Math.max(1, P.drn);
  return [P.x + Math.cos(a) * 52, P.y + Math.sin(a) * 52];
}

// RAILGUN: sinar menembus semua musuh di garis bidik
function railShot() {
  const ux = Math.cos(P.a),
    uy = Math.sin(P.a);
  for (const e of E) {
    const px = e.x - P.x,
      py = e.y - P.y;
    if (px * ux + py * uy > 0 && Math.abs(px * uy - py * ux) < e.r + 14) hit(e, 80 + P.dmg * 6);
  }
  BM.push({ x: P.x, y: P.y, a: P.a, l: 0.3, m: 0.3 });
  for (let i = 0; i < 16; i++) pf(P.x + ux * i * 50, P.y + uy * i * 50, 1, '#ffd166', 80, 0.4);
  shake = Math.max(shake, 5);
  snd(90, 0.25, 'sawtooth', 0.08);
  snd(1300, 0.12, 'square', 0.03);
}

// Aura (Spike Aura / Blizzard): dipanggil per musuh dari updEnemies
function auraTick(e, dp, dt) {
  if (!P.aura) return;
  const bz = ev('bliz');
  if (dp < auraR() + e.r) {
    e.hp -= AURA_DPS * P.aura * dt;
    e.fl = Math.max(e.fl, 0.03);
  }
  if (bz && dp < auraR() + 80 + e.r) e.slw = Math.max(e.slw || 0, 0.3);
}
