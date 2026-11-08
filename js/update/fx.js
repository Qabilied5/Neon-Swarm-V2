// Partikel, vortex black hole, timer efek, combo
function updParticles(dt) {
  for (let i = PT.length - 1; i >= 0; i--) {
    const p = PT[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.96;
    p.vy *= 0.96;
    if ((p.l -= dt) <= 0) PT.splice(i, 1);
  }
}
function updVortex(dt) {
  for (const v of VX) {
    v.l -= dt;
    for (const e of E) {
      const dx = v.x - e.x,
        dy = v.y - e.y,
        d = Math.hypot(dx, dy) || 1;
      if (d < v.r) {
        const f = e.sup || e.sec ? 0 : e.k == 'boss' ? 0.25 : 1;
        e.x += (dx / d) * 170 * f * dt;
        e.y += (dy / d) * 170 * f * dt;
        e.hp -= (25 + P.dmg * 2.5) * dt;
        e.fl = 0.04;
      }
    }
    const a = R(0, TAU);
    if (PT.length < 500)
      PT.push({
        x: v.x + Math.cos(a) * v.r,
        y: v.y + Math.sin(a) * v.r,
        vx: -Math.cos(a) * v.r * 1.6,
        vy: -Math.sin(a) * v.r * 1.6,
        l: 0.6,
        m: 0.6,
        c: '#b967ff',
        s: 3,
      });
  }
}
// Sandevistan: hitung mundur bayangan target musuh & pudarkan jejak bayangan dash
function updDecoy(dt) {
  if (DC && (DC.t -= dt) <= 0) {
    pf(DC.x, DC.y, 14, '#22d3ee', 220, 0.5);
    RG.push({ x: DC.x, y: DC.y, r: 0, mr: 50, c: '#22d3ee', w: 3, l: 0.3, m: 0.3 });
    DC = null;
  }
  if (GH.length) {
    for (const o of GH) o.t -= dt;
    GH = GH.filter((o) => o.t > 0);
  }
}
// SUPER SHIELD: setelah hancur, hitung mundur lalu aktif lagi dengan SH_HITS penuh
function updShield(dt) {
  if (!P.sh) return;
  if (P.shf > 0) P.shf -= dt;
  if (P.shn <= 0 && P.shc > 0 && (P.shc -= dt) <= 0) {
    P.shc = 0;
    P.shn = SH_HITS;
    RG.push({ x: P.x, y: P.y, r: P.r + 40, mr: P.r, c: '#4da3ff', w: 4, l: 0.4, m: 0.4 });
    pf(P.x, P.y, 14, '#4da3ff', 200, 0.5);
    FT.push({ x: P.x, y: P.y - P.r - 14, t: 1, s: 'SHIELD AKTIF', c: '#4da3ff', z: 16 });
    snd(740, 0.2, 'triangle', 0.06);
  }
}
function updTimers(dt) {
  updDecoy(dt);
  updShield(dt);
  for (const a of RG) a.l -= dt;
  for (const a of AR) a.l -= dt;
  for (const a of BM) a.l -= dt;
  for (const f of FT) {
    f.t -= dt;
    f.y -= 34 * dt;
  }
  RG = RG.filter((a) => a.l > 0);
  AR = AR.filter((a) => a.l > 0);
  BM = BM.filter((a) => a.l > 0);
  FT = FT.filter((f) => f.t > 0);
  VX = VX.filter((v) => v.l > 0);
  if (comboT > 0) {
    comboT -= dt;
    if (comboT <= 0) combo = 0;
  }
  shake *= 0.9;
  if (msgT > 0) msgT -= dt;
  if (flash > 0) flash -= dt;
}
