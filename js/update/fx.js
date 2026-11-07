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
function updTimers(dt) {
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
