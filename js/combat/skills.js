// Skill aktif: nova() Q, laser() E, hole() R
// cx,cy opsional: pusat ledakan (default = posisi pemain)
function nova(cx = P.x, cy = P.y) {
  if (!P.sk.q || P.cd.q > 0) return;
  P.cd.q = Math.max(3, 9 - P.sk.q);
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
}
// ang opsional: arah laser (default = arah bidik pemain P.a)
function laser(ang = P.a) {
  if (!P.sk.e || P.cd.e > 0) return;
  P.cd.e = Math.max(3, 8 - P.sk.e);
  if (ang == null) ang = P.a;
  P.a = ang;
  const ux = Math.cos(ang),
    uy = Math.sin(ang),
    d = 70 + P.dmg * 5;
  for (const e of E) {
    const px = e.x - P.x,
      py = e.y - P.y;
    if (px * ux + py * uy > 0 && Math.abs(px * uy - py * ux) < e.r + 12 + P.sk.e * 3) hit(e, d);
  }
  BM.push({ x: P.x, y: P.y, a: ang, l: 0.35, m: 0.35 });
  for (let i = 0; i < 30; i++) pf(P.x + ux * i * 40, P.y + uy * i * 40, 1, '#ff2e63', 90, 0.5);
  shake = Math.max(shake, 12);
  snd(70, 0.35, 'sawtooth', 0.09);
  snd(1200, 0.2, 'square', 0.03);
}
// x,y opsional: titik pusat black hole (default = posisi kursor / bidik)
function hole(x = M.x, y = M.y) {
  if (!P.sk.r || P.cd.r > 0) return;
  P.cd.r = Math.max(6, 14 - P.sk.r * 1.5);
  VX.push({ x: cl(x, 0, W), y: cl(y, 0, H), l: 3.5, m: 3.5, r: 170 + P.sk.r * 25 });
  snd(80, 0.6, 'sine', 0.09);
}

// Heal (C): pulihkan HEAL_PCT dari max HP, cooldown HEAL_CD detik
function heal() {
  if (P.cd.c > 0) return;
  P.cd.c = HEAL_CD;
  const amt = Math.round(P.mh * HEAL_PCT);
  P.hp = Math.min(P.mh, P.hp + amt);
  RG.push({ x: P.x, y: P.y, r: 0, mr: 90, c: '#39ff88', w: 6, l: 0.5, m: 0.5 });
  pf(P.x, P.y, 30, '#39ff88', 260, 0.7);
  FT.push({ x: P.x, y: P.y - P.r - 10, t: 1, s: '+' + amt + ' HP', c: '#39ff88', z: 18 });
  snd(520, 0.3, 'triangle', 0.07);
  snd(780, 0.3, 'sine', 0.05);
}
