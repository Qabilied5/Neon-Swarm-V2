// AI per tipe musuh + tabrakan dengan pemain + orbital blade
function updEnemies(dt) {
  for (let i = E.length - 1; i >= 0; i--) {
    const e = E[i],
      d = Math.hypot(P.x - e.x, P.y - e.y) || 1,
      ux = (P.x - e.x) / d,
      uy = (P.y - e.y) / d;
    if (e.fl > 0) e.fl -= dt;
    if (e.k == 'shooter') {
      const m = d > 280 ? 1 : d < 200 ? -1 : 0;
      e.x += ux * e.sp * m * dt;
      e.y += uy * e.sp * m * dt;
      e.cd -= dt;
      if (e.cd < 0) {
        e.cd = mob(3, 2); // HP: tembak lebih jarang & peluru lebih lambat
        const sv = mob(190, 230);
        EB.push({ x: e.x, y: e.y, vx: ux * sv, vy: uy * sv, r: 5, d: 10, life: 4 });
      }
    } else if (e.k == 'boss' && e.sec) secretBoss(e, dt);
    else if (e.k == 'boss' && e.sup) sup(e, dt, d, ux, uy);
    else if (e.k == 'boss') {
      e.ph += dt;
      if (d > 270) {
        e.x += ux * e.sp * dt;
        e.y += uy * e.sp * dt;
      } else {
        e.x += -uy * e.sp * dt;
        e.y += ux * e.sp * dt;
      }
      e.cd -= dt;
      if (e.cd < 0) {
        e.cd = mob(3, 2.2);
        const n = mob(Math.min(8 + (wave >> 1), 14), 14 + wave); // HP: jumlah peluru ~ setengah
        for (let j = 0; j < n; j++) {
          const a = (j * TAU) / n + e.ph;
          EB.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(a) * mob(165, 190),
            vy: Math.sin(a) * mob(165, 190),
            r: 6,
            d: 12,
            life: 5,
          });
        }
        snd(140, 0.2, 'sawtooth', 0.05);
      }
      e.sm -= dt;
      if (e.sm < 0) {
        e.sm = 6;
        for (let j = 0; j < 3; j++)
          spawn('drone', e.x + R(-60, 60), e.y + R(-60, 60), 1 + wave * 0.1);
      }
    } else if (e.k == 'striker') {
      if (e.st == 1) {
        e.tm -= dt;
        if (e.tm <= 0) {
          e.st = 2;
          e.tm = 0.38;
        }
      } else if (e.st == 2) {
        e.x += e.lx * 640 * dt;
        e.y += e.ly * 640 * dt;
        e.tm -= dt;
        if (e.tm <= 0) {
          e.st = 0;
          e.cd = R(2.2, 3.2);
        }
      } else {
        e.x += ux * e.sp * dt;
        e.y += uy * e.sp * dt;
        e.cd -= dt;
        if (e.cd < 0 && d < 300) {
          e.st = 1;
          e.tm = 0.55;
          e.lx = ux;
          e.ly = uy;
        }
      }
    } else if (e.k == 'bomber') {
      if (e.fuse > 0) {
        e.fuse -= dt;
        if (e.fuse <= 0) {
          blast(e.x, e.y, 100, 40);
          e.hp = 0;
        }
      } else {
        e.x += ux * e.sp * dt;
        e.y += uy * e.sp * dt;
        if (d < 120) e.fuse = 0.8;
      }
    } else if (e.k == 'gunner') {
      const m = d > 340 ? 1 : d < 230 ? -1 : 0;
      e.x += ux * e.sp * m * dt;
      e.y += uy * e.sp * m * dt;
      e.cd -= dt;
      if (e.cd < 0) {
        e.cd = mob(2.8, 2);
        const a = Math.atan2(uy, ux),
          gn = mob(1, 3); // HP: 1 peluru (desktop 3 menyebar)
        for (let j = 0; j < gn; j++)
          EB.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(a + (j - (gn - 1) / 2) * 0.22) * mob(250, 310),
            vy: Math.sin(a + (j - (gn - 1) / 2) * 0.22) * mob(250, 310),
            r: 5,
            d: 14,
            life: 4,
          });
      }
    } else if (e.k == 'juggernaut') {
      if (e.tm > 0) e.tm -= dt;
      else {
        e.x += ux * e.sp * dt;
        e.y += uy * e.sp * dt;
        e.cd -= dt;
        if (e.cd < 0 && d < 260) {
          e.cd = 4.5;
          e.tm = 0.9;
          HZ.push({ k: 'ring', x: e.x, y: e.y, r: 150, t: 0.9, m: 0.9, d: 36 });
        }
      }
    } else if (e.k == 'reaper') {
      if (e.tp > 0) {
        e.tp -= dt;
        if (e.tp <= 0) {
          e.x = e.tx;
          e.y = e.ty;
          HZ.push({ k: 'ring', x: e.x, y: e.y, r: 90, t: 0.4, m: 0.4, d: 30 });
        }
      } else {
        e.x += ux * e.sp * dt;
        e.y += uy * e.sp * dt;
        e.cd -= dt;
        if (e.cd < 0) {
          e.cd = R(3, 4);
          e.tp = 0.6;
          e.tx = cl(P.x + R(-90, 90), 40, W - 40);
          e.ty = cl(P.y + R(-90, 90), 40, H - 40);
        }
      }
    } else if (e.k == 'ringer') {
      const m = d > 300 ? 1 : d < 200 ? -1 : 0;
      e.x += ux * e.sp * m * dt;
      e.y += uy * e.sp * m * dt;
      e.cd -= dt;
      if (e.cd < 0) {
        e.cd = mob(3.4, 2.6);
        e.ph = (e.ph || 0) + 0.4;
        const rn = mob(6, 12); // HP: 6 peluru per cincin (desktop 12)
        for (let j = 0; j < rn; j++) {
          const a = (j * TAU) / rn + e.ph;
          EB.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(a) * mob(170, 200),
            vy: Math.sin(a) * mob(170, 200),
            r: 5,
            d: 13,
            life: 5,
          });
        }
      }
    } else {
      e.x += ux * e.sp * dt;
      e.y += uy * e.sp * dt;
    }
    if (e.hp <= 0) {
      kill(e, i);
      continue;
    }
    if (d < e.r + P.r) {
      hurt(e.dm, 1);
      if (!e.sec) {
        e.x -= ux * 6;
        e.y -= uy * 6;
      }
    }
    for (let j = 0; j < P.orb; j++) {
      const a = P.ot + (j * TAU) / P.orb;
      if (
        Math.hypot(e.x - (P.x + Math.cos(a) * ORB_R), e.y - (P.y + Math.sin(a) * ORB_R)) <
        e.r + ORB_HIT
      ) {
        e.hp -= P.dmg * 6 * dt;
        e.fl = 0.05;
      }
    }
  }
}
