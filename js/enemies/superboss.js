// AI & pola serangan Super Boss (sup())
function sup(e, dt, d, ux, uy) {
  e.ph += dt;
  if (e.ph < 2) {
    e.y += 90 * dt;
    return;
  }
  const r = e.hp / e.mh,
    rg = r < 0.3 ? 1.7 : r < 0.6 ? 1.3 : 1;
  if (r < 0.6 && !e.p2) {
    e.p2 = 1;
    banner('FASE 2', 'Annihilator semakin buas');
    shake = 20;
    snd(60, 0.5, 'sawtooth', 0.09);
  }
  if (r < 0.3 && !e.p3) {
    e.p3 = 1;
    banner('FASE 3: AMUK!', 'bertahan atau musnah');
    shake = 24;
    snd(50, 0.6, 'sawtooth', 0.1);
  }
  const m = d > 360 ? 1 : d < 240 ? -0.7 : 0,
    sp = e.sp * rg;
  if (m) {
    e.x += ux * sp * m * dt;
    e.y += uy * sp * m * dt;
  } else {
    e.x += -uy * sp * 0.6 * dt;
    e.y += ux * sp * 0.6 * dt;
  }
  e.x = cl(e.x, e.r, W - e.r);
  e.y = cl(e.y, e.r, H - e.r);
  const A = Math.atan2(P.y - e.y, P.x - e.x),
    sh = (a, v, dm, rr = 6) =>
      EB.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: rr, d: dm, life: 6 });
  if (!e.at) {
    e.cd -= dt;
    if (e.cd <= 0) {
      e.at = pick(['spiral', 'rings', 'aim', 'beams', 'slam']);
      e.ac = { spiral: 3.2, rings: 2.4, aim: 2.4, beams: 2.5, slam: 3 }[e.at];
      e.as = 0;
      e.cn = 0;
      snd(80, 0.3, 'sawtooth', 0.07);
    }
    return;
  }
  e.ac -= dt;
  e.as -= dt;
  if (e.at == 'spiral' && e.as <= 0) {
    e.as = mob(0.16, 0.09) / rg;
    const sn = mob(3, 4);
    for (let j = 0; j < sn; j++) sh(e.ang + (j * TAU) / sn, mob(180, 210), 14);
    e.ang += 0.23;
  } else if (e.at == 'rings' && e.as <= 0) {
    e.as = 0.6 / rg;
    e.cn++;
    const o = R(0, TAU);
    const rn = mob(18, 32);
    for (let j = 0; j < rn; j++) sh(o + (j * TAU) / rn, mob(140, 160) + e.cn * 22, 16, 7);
  } else if (e.at == 'aim' && e.as <= 0) {
    e.as = mob(0.6, 0.4) / rg;
    const an = mob(1, 2);
    for (let j = -an; j <= an; j++) sh(A + j * mob(0.16, 0.13), mob(360, 440), 20, 7);
  } else if (e.at == 'beams' && e.as <= 0) {
    e.as = 0.85 / rg;
    for (const o of rg > 1 ? [-0.45, 0, 0.45] : [0])
      HZ.push({ k: 'beam', x: e.x, y: e.y, a: A + o, w: 26, t: 0.8, m: 0.8, d: 55 });
  } else if (e.at == 'slam' && e.as <= 0) {
    e.as = 0.7 / rg;
    for (let j = 0; j < (rg > 1 ? 2 : 1); j++)
      HZ.push({
        k: 'ring',
        x: P.x + (j ? R(-200, 200) : R(-30, 30)),
        y: P.y + (j ? R(-200, 200) : R(-30, 30)),
        r: 125,
        t: 0.9,
        m: 0.9,
        d: 45,
      });
  }
  if (e.ac <= 0) {
    e.at = '';
    e.cd = 1.3 / rg;
  }
}
