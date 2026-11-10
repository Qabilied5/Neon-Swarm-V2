// Gerak & tabrakan peluru pemain
function updBullets(dt) {
  for (let i = B.length - 1; i >= 0; i--) {
    const b = B[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    // HOMING: membelok ke musuh terdekat yang belum kena
    const hm = (b.hm || 0) + P.hom;
    if (hm > 0) {
      let ne = null,
        nd = HOM_R;
      for (const e of E) {
        if (b.h.has(e)) continue;
        const d = Math.hypot(e.x - b.x, e.y - b.y);
        if (d < nd) {
          nd = d;
          ne = e;
        }
      }
      if (ne) {
        const sp = Math.hypot(b.vx, b.vy),
          a = Math.atan2(b.vy, b.vx),
          da = ((Math.atan2(ne.y - b.y, ne.x - b.x) - a + Math.PI * 3) % TAU) - Math.PI,
          st = HOM_TURN * hm * dt,
          na = a + cl(da, -st, st);
        b.vx = Math.cos(na) * sp;
        b.vy = Math.sin(na) * sp;
      }
    }
    // RICOCHET: pantul di tepi layar
    if (b.rc > 0) {
      let bn = 0;
      if (b.x < 0 || b.x > W) {
        b.vx = -b.vx;
        b.x = cl(b.x, 0, W);
        bn = 1;
      }
      if (b.y < 0 || b.y > H) {
        b.vy = -b.vy;
        b.y = cl(b.y, 0, H);
        bn = 1;
      }
      if (bn) {
        b.rc--;
        b.life = Math.max(b.life, 0.6);
        b.h.clear();
      }
    }
    if (b.ss && PT.length < 400) PT.push({ x: b.x, y: b.y, vx: 0, vy: 0, l: 0.25, m: 0.25, c: '#ffd166', s: 4 }); // jejak peluru super
    let dead = b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20;
    if (!dead)
      for (const e of E) {
        if (b.h.has(e)) continue;
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
          b.h.add(e);
          hit(e, b.d);
          pf(b.x, b.y, 3, e.c, 120, 0.25);
          if (b.ss) {
            RG.push({ x: b.x, y: b.y, r: 0, mr: 60, c: '#ffd166', w: 5, l: 0.3, m: 0.3 });
            pf(b.x, b.y, 16, '#ffd166', 340, 0.5);
            shake = Math.max(shake, 5);
            snd(120, 0.15, 'sawtooth', 0.06);
          }
          if (P.froz) e.slw = Math.max(e.slw || 0, FROST_T + FROST_TS * P.froz); // FROST ROUNDS
          if (P.psn) {
            // TOXIC ROUNDS
            e.pt = TOX_T;
            e.pd = Math.max(e.pd || 0, (TOX_DPS + P.dmg * 0.3) * P.psn);
          }
          if (P.mark) e.mk = MARK_T; // HUNTER MARK
          if (ev('frostfire')) {
            // FROSTFIRE: peluru membakar
            e.bt = Math.max(e.bt || 0, 1.5);
            e.bd = Math.max(e.bd || 0, FIRE_DPS + P.dmg * 0.5);
          }
          if (P.kin && e.k != 'boss') {
            // KINETIC ROUNDS: dorong musuh searah peluru
            const bs = Math.hypot(b.vx, b.vy) || 1;
            e.x += (b.vx / bs) * KIN_PUSH * P.kin;
            e.y += (b.vy / bs) * KIN_PUSH * P.kin;
          }
          if (ev('graviton')) {
            // GRAVITON: sedot musuh sekitar ke titik tumbukan
            for (const o of E) {
              if (o == e || o.k == 'boss') continue;
              const gx = b.x - o.x,
                gy = b.y - o.y,
                gd = Math.hypot(gx, gy) || 1;
              if (gd < 170) {
                o.x += (gx / gd) * Math.min(gd, 26);
                o.y += (gy / gd) * Math.min(gd, 26);
              }
            }
            if (RG.length < 50) RG.push({ x: b.x, y: b.y, r: 0, mr: 70, c: '#b967ff', w: 2, l: 0.25, m: 0.25 });
          }
          if (ev('seeker') && !b.mini)
            // SEEKER SWARM: pecah jadi 2 peluru pemburu
            for (let q = -1; q <= 1; q += 2) mkB(b.x, b.y, Math.atan2(b.vy, b.vx) + q * 0.9, b.d * 0.5, { sp: 520, life: 0.9, hm: 3, mini: 1, c: '#7cffcb', r: 3 });
          if (P.ch) chain(e, b.d);
          if (P.boom) boom(b.x, b.y, b.d);
          if (b.p > 0) b.p--;
          else {
            dead = true;
            break;
          }
        }
      }
    if (dead) B.splice(i, 1);
  }
}
