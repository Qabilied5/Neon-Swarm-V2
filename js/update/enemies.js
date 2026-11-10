// AI per tipe musuh + tabrakan dengan pemain + orbital blade
function updEnemies(dt) {
  const tg = tgt(); // sasaran musuh: bayangan Sandevistan (jika aktif) atau pemain
  for (let i = E.length - 1; i >= 0; i--) {
    const e = E[i],
      d = Math.hypot(tg.x - e.x, tg.y - e.y) || 1,
      ux = (tg.x - e.x) / d,
      uy = (tg.y - e.y) / d,
      dp = tg == P ? d : Math.hypot(P.x - e.x, P.y - e.y) || 1; // jarak ke pemain asli (tabrakan tetap dengan pemain)
    if (e.fl > 0) e.fl -= dt;
    // FROST: slow sementara (kecepatan dasar disimpan di e.bsp; super/secret boss kebal)
    if (e.bsp == null) e.bsp = e.sp;
    if (e.slw > 0) e.slw -= dt;
    e.sp = e.bsp * (e.slw > 0 && !e.sup && !e.sec ? (e.k == 'boss' ? 0.8 : FROST_SLOW) : 1);
    // TOXIC: damage berkala
    if (e.pt > 0) {
      e.pt -= dt;
      e.hp -= (e.pd || 0) * dt;
      if (Math.random() < dt * 5) pf(e.x, e.y, 1, '#7cff3a', 40, 0.4);
    }
    if (e.mk > 0) e.mk -= dt; // HUNTER MARK: timer tanda
    // BURN (kolam api / Frostfire): damage berkala selama e.bt > 0
    if (e.bt > 0) {
      e.bt -= dt;
      e.hp -= (e.bd || 0) * dt;
      if (Math.random() < dt * 6) pf(e.x, e.y, 1, '#ff9f1c', 50, 0.35);
    } else e.bd = 0;
    auraTick(e, dp, dt); // SPIKE AURA / BLIZZARD
    // DASH STRIKE: musuh yang dilewati saat dash
    if (P.dash > 0 && P.dstr && e.dsh !== P.dsId && dp < e.r + P.r + 30) {
      e.dsh = P.dsId;
      hit(e, P.dmg * DSTR_MUL * P.dstr);
      pf(e.x, e.y, 6, '#22d3ee', 200, 0.3);
    }
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
          e.tx = cl(tg.x + R(-90, 90), 40, W - 40);
          e.ty = cl(tg.y + R(-90, 90), 40, H - 40);
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
    if (dp < e.r + P.r) {
      hurt(e.dm, 1);
      if (!e.sec) {
        e.x -= ((P.x - e.x) / dp) * 6;
        e.y -= ((P.y - e.y) / dp) * 6;
      }
    }
    // Orbital Shuriken: orbDmg() per kena; tiap shuriken punya jeda ORB_HITCD pada musuh yang sama
    for (let j = 0; j < P.orb; j++) {
      const a = P.ot + (j * TAU) / P.orb,
        ox = P.x + Math.cos(a) * orbR(),
        oy = P.y + Math.sin(a) * orbR();
      if (Math.hypot(e.x - ox, e.y - oy) < e.r + ORB_HIT) {
        const oh = e.oh || (e.oh = []);
        if ((oh[j] || 0) <= T) {
          oh[j] = T + ORB_HITCD;
          hit(e, orbDmg());
          pf(ox, oy, 4, '#ffd166', 160, 0.25);
        }
      }
    }
  }
}
