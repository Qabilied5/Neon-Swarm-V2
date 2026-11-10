// Skill aktif: nova() Q, laser() E, hole() R, teleport() T
// setCd(k, detik): mulai cooldown skill k & catat nilai maksimumnya (P.cm) supaya UI cooldown (lingkaran / kotak) akurat
function setCd(k, v) {
  P.cd[k] = P.cm[k] = v * cdrMul(); // COOLDOWN CORE / TEMPORAL ENGINE
}
// cx,cy opsional: pusat ledakan (default = posisi pemain)
function nova(cx = P.x, cy = P.y) {
  if (!P.sk.q || P.cd.q > 0) return;
  setCd('q', Math.max(3, 9 - P.sk.q));
  const r = 210 + P.sk.q * 35,
    d = 40 + P.dmg * 3;
  RG.push(
    { x: cx, y: cy, r: 0, mr: r, c: '#22d3ee', w: 8, l: 0.55, m: 0.55 },
    { x: cx, y: cy, r: 0, mr: r * 0.7, c: '#fff', w: 3, l: 0.4, m: 0.4 },
  );
  for (const e of E) {
    const dd = Math.hypot(e.x - cx, e.y - cy) || 1;
    if (dd < r + e.r) {
      hit(e, d);
      if (e.k != 'boss') {
        e.x += ((e.x - cx) / dd) * 110;
        e.y += ((e.y - cy) / dd) * 110;
      }
    }
  }
  for (let i = EB.length - 1; i >= 0; i--)
    if (Math.hypot(EB[i].x - cx, EB[i].y - cy) < r) {
      pf(EB[i].x, EB[i].y, 3, '#ff2e63', 100, 0.3);
      EB.splice(i, 1);
    }
  shake = Math.max(shake, 9);
  pf(cx, cy, 40, '#22d3ee', 420, 0.7);
  snd(120, 0.4, 'sawtooth', 0.08);
  if (TUT.on) tutSkill('q');
}
// ang opsional: arah laser (default = arah bidik pemain P.a)
function laser(ang = P.a) {
  if (!P.sk.e || P.cd.e > 0) return;
  setCd('e', Math.max(3, 8 - P.sk.e));
  if (ang == null) ang = P.a;
  P.a = ang;
  const ux = Math.cos(ang),
    uy = Math.sin(ang);
  const hits = []; // musuh yang terkena sinar + jaraknya sepanjang sinar
  for (const e of E) {
    const px = e.x - P.x,
      py = e.y - P.y,
      t = px * ux + py * uy;
    if (t > 0 && Math.abs(px * uy - py * ux) < e.r + 12 + P.sk.e * 3) hits.push({ e, t });
  }
  // EKSEKUSI: musuh biasa (bukan boss) yang paling belakang/terjauh di sinar
  let far = null;
  for (const h of hits) if (h.e.k != 'boss' && (!far || h.t > far.t)) far = h;
  for (const h of hits) {
    // damage naik sesuai jarak: LASER_DMG (100) di jarak >= LASER_FAR, minimum LASER_MIN x LASER_DMG di dekat pemain.
    // Musuh terjauh mendapat tambahan LASER_EXEC x max HP (hampir pasti musnah). Boss: hanya damage jarak (maks 100). Semua bisa crit (hit()).
    let d = LASER_DMG * cl(h.t / LASER_FAR, LASER_MIN, 1);
    if (h == far) d += LASER_EXEC * h.e.mh;
    hit(h.e, d);
  }
  if (far) {
    RG.push({ x: far.e.x, y: far.e.y, r: 0, mr: far.e.r * 3 + 20, c: '#ff2e63', w: 4, l: 0.35, m: 0.35 });
    pf(far.e.x, far.e.y, 14, '#ff2e63', 260, 0.5);
    if (FT.length < 80) FT.push({ x: far.e.x, y: far.e.y - far.e.r - 14, t: 0.9, s: 'EKSEKUSI!', c: '#ff2e63', z: 16 });
  }
  BM.push({ x: P.x, y: P.y, a: ang, l: 0.35, m: 0.35, ramp: 1 });
  for (let i = 0; i < 30; i++) pf(P.x + ux * i * 40, P.y + uy * i * 40, 1, '#ff2e63', 90, 0.5);
  shake = Math.max(shake, 12);
  snd(70, 0.35, 'sawtooth', 0.09);
  snd(1200, 0.2, 'square', 0.03);
  if (TUT.on) tutSkill('e');
}
// x,y opsional: titik pusat black hole (default = posisi kursor / bidik)
function hole(x = M.x, y = M.y) {
  if (!P.sk.r || P.cd.r > 0) return;
  setCd('r', Math.max(6, 14 - P.sk.r * 1.5));
  VX.push({ x: cl(x, 0, W), y: cl(y, 0, H), l: 3.5, m: 3.5, r: 170 + P.sk.r * 25 });
  snd(80, 0.6, 'sine', 0.09);
  if (TUT.on) tutSkill('r');
}

// Teleport (T / tombol sentuh): pindah instan ke titik bidik (maks TP_RANGE), cooldown TP_CD detik, kebal sesaat saat tiba
// x,y opsional: titik tujuan (default = posisi kursor)
function teleport(x = M.x, y = M.y) {
  if (!P.sk.tp || P.cd.tp > 0) return;
  const dx = x - P.x,
    dy = y - P.y,
    d = Math.hypot(dx, dy);
  if (d < 25) return; // titik terlalu dekat: jangan buang cooldown
  const k = Math.min(1, TP_RANGE / d),
    ox = P.x,
    oy = P.y,
    nx = cl(P.x + dx * k, P.r, W - P.r),
    ny = cl(P.y + dy * k, P.r, H - P.r);
  setCd('tp', TP_CD);
  for (let i = 0; i <= 14; i++) pf(ox + ((nx - ox) * i) / 14, oy + ((ny - oy) * i) / 14, 2, '#ff9f1c', 90, 0.45); // jejak warp
  RG.push(
    { x: ox, y: oy, r: 0, mr: 70, c: '#ff9f1c', w: 5, l: 0.35, m: 0.35 },
    { x: nx, y: ny, r: 0, mr: 110, c: '#ff9f1c', w: 6, l: 0.45, m: 0.45 },
    { x: nx, y: ny, r: 0, mr: 60, c: '#fff', w: 2, l: 0.3, m: 0.3 },
  );
  pf(ox, oy, 24, '#ff9f1c', 300, 0.6);
  pf(nx, ny, 30, '#ffd166', 360, 0.7);
  P.x = nx;
  P.y = ny;
  P.inv = Math.max(P.inv, 0.3);
  shake = Math.max(shake, 5);
  snd(300, 0.25, 'sine', 0.07);
  snd(1100, 0.2, 'triangle', 0.05);
}

// Heal (C): pulihkan HEAL_PCT dari max HP, cooldown HEAL_CD detik
function heal() {
  if (P.cd.c > 0) return;
  setCd('c', HEAL_CD);
  const amt = Math.round(P.mh * HEAL_PCT);
  P.hp = Math.min(P.mh, P.hp + amt);
  RG.push({ x: P.x, y: P.y, r: 0, mr: 90, c: '#39ff88', w: 6, l: 0.5, m: 0.5 });
  pf(P.x, P.y, 30, '#39ff88', 260, 0.7);
  FT.push({ x: P.x, y: P.y - P.r - 10, t: 1, s: '+' + amt + ' HP', c: '#39ff88', z: 18 });
  snd(520, 0.3, 'triangle', 0.07);
  snd(780, 0.3, 'sine', 0.05);
}
