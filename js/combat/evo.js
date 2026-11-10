// Logika efek baru (Frost, Toxic, Ricochet, Homing, Aura, Drone, dst) & Evo Effect.
// Hook ada di: damage.js (hit/kill/boom), bullets.js, enemies.js, player.js (dash/hurt), update/player.js (tembak), update/pickups.js (level up).

// ---- pembantu nilai ----
const exeTh = () => Math.min(0.5, EXE_PCT * P.exe + (ev('reaper') ? 0.1 : 0)), // ambang eksekusi (fraksi HP)
  auraR = () => AURA_R0 + AURA_RS * P.aura,
  plsCd = () => Math.max(2.5, PLS_CD0 - 0.9 * P.pls),
  shrN = () => SHR_N + 2 * P.shr + (ev('cluster') ? 4 : 0),
  rateMul = () => (ev('over') && P.hp < P.mh * 0.5 ? 1.3 : 1), // Overclock
  dmgMul = () => 1 + BERS_PCT * P.bers * (1 - P.hp / P.mh); // Berserk

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
  if (P.exe && e.k != 'boss' && e.hp > 0 && e.hp < e.mh * exeTh()) {
    e.hp = 0;
    if (FT.length < 80) FT.push({ x: e.x, y: e.y - e.r - 12, t: 0.8, s: '☠', c: '#ff2e63', z: 18 });
    if (ev('reaper')) P.hp = Math.min(P.mh, P.hp + 3);
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
      ev_.drn = DRN_CD / (ev('hive') ? 1.4 : 1);
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
        if (tg) mkB(dx, dy, Math.atan2(tg.y - dy, tg.x - dx), P.dmg * DRN_DMG, { sp: 600, c: '#22d3ee', hm: ev('hive') ? 3 : 0, life: 1 });
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
