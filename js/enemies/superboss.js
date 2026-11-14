// AI & pola serangan boss solo - sup(). Varian (e.vr), dibuat di enemies/boss.js spawnSuper():
//  'sup'   = ANNIHILATOR (wave 15-20 biasa; wave 25+ lebih sakit & lincah: dodge, seruduk, dash beruntun)
//  'tank'  = BEHEMOTH    (wave 35+: sangat tebal, lambat, menyeruduk seperti badak, gempa & stomp)
//  'agile' = WRAITH      (wave 45+: sangat lincah, dodge terus-menerus, blink, dash beruntun)
// Ambang wave & pengali: data/config.js (BOSS_*_WAVE, TANK_*, bossPower).
const SUP_ATK = {
  sup: ['spiral', 'rings', 'aim', 'beams', 'slam'],
  sup2: ['spiral', 'rings', 'aim', 'beams', 'slam', 'charge', 'dashcombo'], // ANNIHILATOR wave 25+
  tank: ['charge', 'stomp', 'quake', 'volley', 'charge', 'slam'],
  agile: ['dashcombo', 'blink', 'aim', 'spiral', 'beams', 'rings', 'slam'],
};
// lama tiap serangan (detik); seruduk / dash berhenti sendiri saat selesai, jadi diberi nilai besar
const SUP_DUR = { spiral: 3.2, rings: 2.4, aim: 2.4, beams: 2.5, slam: 3, charge: 99, dashcombo: 99, stomp: 2.4, quake: 2.6, volley: 2.4, blink: 2.8 };
// seruduk: w = lama bidik (garis peringatan), t = lama lari, v = kecepatan, n = jumlah seruduk beruntun, r = radius gelombang kejut di jejak
const SUP_CH = {
  tank: { w: 0.9, t: 1.0, v: 560, n: 2, r: 120 },
  sup: { w: 0.65, t: 0.55, v: 760, n: 1, r: 80 },
  agile: { w: 0.4, t: 0.5, v: 980, n: 1, r: 80 },
  combo: { w: 0.3, t: 0.28, v: 1000, n: 3, r: 70 },
};
function sup(e, dt, d, ux, uy) {
  e.ph += dt;
  if (e.ph < 2) {
    e.y += 90 * dt;
    return;
  }
  const pw = e.pw || 1, // pengali damage (wave 25+)
    vs = 1 + (pw - 1) * 0.5, // pengali kecepatan peluru
    dm = (x) => Math.round(x * pw),
    r = e.hp / e.mh,
    ph = r < 0.3 ? 1.7 : r < 0.6 ? 1.3 : 1, // fase: makin parah saat HP turun
    rg = ph * (e.tempo || 1), // laju serangan
    nm = e.nm || 'ANNIHILATOR';
  if (r < 0.6 && !e.p2) {
    e.p2 = 1;
    banner('FASE 2', nm + ' semakin buas');
    shake = 20;
    snd(60, 0.5, 'sawtooth', 0.09);
  }
  if (r < 0.3 && !e.p3) {
    e.p3 = 1;
    banner('FASE 3: AMUK!', 'bertahan atau musnah');
    shake = 24;
    snd(50, 0.6, 'sawtooth', 0.1);
  }
  const busy = e.at == 'charge' || e.at == 'dashcombo'; // sedang menyeruduk / dash: gerak diatur serangan itu sendiri
  if (!busy) {
    if (e.dgT > 0) {
      // DODGE: loncat cepat ke samping
      e.dgT -= dt;
      e.x += e.dgx * 700 * dt;
      e.y += e.dgy * 700 * dt;
      pf(e.x, e.y, 2, e.c, 50, 0.3);
    } else {
      const m = e.vr == 'tank' ? (d > 150 ? 1 : 0) : d > 360 ? 1 : d < 240 ? -0.7 : 0, // BEHEMOTH terus mengejar, lainnya menjaga jarak
        sp = e.sp * ph;
      if (m) {
        e.x += ux * sp * m * dt;
        e.y += uy * sp * m * dt;
      } else {
        e.x += -uy * sp * 0.6 * dt;
        e.y += ux * sp * 0.6 * dt;
      }
      if (e.ag) {
        e.dgC -= dt;
        if (e.dgC <= 0 && d < 480) {
          const sd = Math.random() < 0.5 ? -1 : 1;
          e.dgx = -uy * sd;
          e.dgy = ux * sd;
          e.dgT = 0.22;
          e.dgC = R(2.2, 3.4) / e.ag;
          pf(e.x, e.y, 8, e.c, 160, 0.3);
        }
      }
    }
  }
  e.x = cl(e.x, e.r, W - e.r);
  e.y = cl(e.y, e.r, H - e.r);
  const tg = tgt(), // bayangan Sandevistan (jika aktif) atau pemain
    A = Math.atan2(tg.y - e.y, tg.x - e.x),
    sh = (a, v, dmg, rr = 6) =>
      EB.push({ x: e.x, y: e.y, vx: Math.cos(a) * v * vs, vy: Math.sin(a) * v * vs, r: rr, d: dm(dmg), life: 6 });
  if (!e.at) {
    e.cd -= dt;
    if (e.cd <= 0) {
      const L = e.vr == 'sup' && pw > 1 ? SUP_ATK.sup2 : SUP_ATK[e.vr || 'sup'];
      let a;
      do a = pick(L);
      while (a == e.last && L.length > 1); // jangan mengulang serangan yang sama
      e.at = e.last = a;
      e.ac = SUP_DUR[a];
      e.as = 0;
      e.cn = 0;
      e.cs = 0;
      snd(80, 0.3, 'sawtooth', 0.07);
    }
    return;
  }
  e.ac -= dt;
  e.as -= dt;
  if (busy) {
    // SERUDUK (badak) & DASH BERUNTUN: bidik (garis partikel) -> lari lurus meninggalkan gelombang kejut
    const C = SUP_CH[e.at == 'dashcombo' ? 'combo' : e.vr || 'sup'];
    if (!e.cs) {
      e.cs = 1;
      e.ct = C.w;
      e.cr = C.n + (e.at == 'dashcombo' && e.vr == 'agile' ? 1 : 0) + (r < 0.3 ? 1 : 0);
    }
    if (e.cs == 1) {
      e.ct -= dt;
      for (let i = 1; i <= 14; i++)
        PT.push({ x: e.x + Math.cos(A) * i * 55, y: e.y + Math.sin(A) * i * 55, vx: 0, vy: 0, l: 0.1, m: 0.1, c: e.c, s: 5 });
      if (Math.random() < dt * 9) RG.push({ x: e.x, y: e.y, r: e.r * 0.6, mr: e.r * 1.7, c: e.c, w: 3, l: 0.25, m: 0.25 });
      if (e.ct <= 0) {
        e.cs = 2;
        e.ct = C.t;
        e.dx = Math.cos(A); // arah dikunci di akhir bidik: pemain masih bisa menghindar di detik terakhir
        e.dy = Math.sin(A);
        e.sk = 0;
        shake = Math.max(shake, 8);
        snd(70, 0.3, 'sawtooth', 0.08);
      }
    } else {
      e.ct -= dt;
      e.sk -= dt;
      e.x += e.dx * C.v * dt;
      e.y += e.dy * C.v * dt;
      pf(e.x, e.y, 2, e.c, 60, 0.35);
      if (e.sk <= 0) {
        e.sk = 0.14;
        HZ.push({ k: 'ring', x: e.x, y: e.y, r: C.r, t: 0.55, m: 0.55, d: dm(38) });
      }
      const nx = cl(e.x, e.r, W - e.r),
        ny = cl(e.y, e.r, H - e.r),
        wall = nx != e.x || ny != e.y;
      e.x = nx;
      e.y = ny;
      if (wall || e.ct <= 0) {
        if (wall) {
          // menghantam dinding arena: gempa besar
          shake = Math.max(shake, 22);
          HZ.push({ k: 'ring', x: e.x, y: e.y, r: e.vr == 'tank' ? 260 : 160, t: 0.7, m: 0.7, d: dm(55) });
          snd(50, 0.4, 'sawtooth', 0.1);
        }
        if (--e.cr > 0 && !wall) {
          e.cs = 1;
          e.ct = C.w;
        } else e.ac = 0; // selesai
      }
    }
  } else if (e.at == 'spiral' && e.as <= 0) {
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
    for (const o of ph > 1 ? [-0.45, 0, 0.45] : [0])
      HZ.push({ k: 'beam', x: e.x, y: e.y, a: A + o, w: 26, t: 0.8, m: 0.8, d: dm(55) });
  } else if (e.at == 'slam' && e.as <= 0) {
    e.as = 0.7 / rg;
    for (let j = 0; j < (ph > 1 ? 2 : 1); j++)
      HZ.push({
        k: 'ring',
        x: tg.x + (j ? R(-200, 200) : R(-30, 30)),
        y: tg.y + (j ? R(-200, 200) : R(-30, 30)),
        r: 125,
        t: 0.9,
        m: 0.9,
        d: dm(45),
      });
  } else if (e.at == 'stomp' && e.as <= 0) {
    // BEHEMOTH: injakan tanah berantai (cincin besar di kaki + cincin peluru lambat)
    e.as = 0.75 / rg;
    e.cn++;
    HZ.push({ k: 'ring', x: e.x, y: e.y, r: 230 + e.cn * 45, t: 0.85, m: 0.85, d: dm(55) });
    const o = R(0, TAU),
      sn = mob(10, 16);
    for (let j = 0; j < sn; j++) sh(o + (j * TAU) / sn, 150, 16, 7);
    shake = Math.max(shake, 10);
  } else if (e.at == 'quake' && e.as <= 0) {
    // BEHEMOTH: gelombang gempa bergulir lurus ke arah pemain
    e.as = 1.1 / rg;
    const o = e.cn++ % 2 ? (Math.random() < 0.5 ? -0.3 : 0.3) : 0;
    for (let i = 0; i < 8; i++)
      HZ.push({
        k: 'ring',
        x: e.x + Math.cos(A + o) * (90 + i * 120),
        y: e.y + Math.sin(A + o) * (90 + i * 120),
        r: 100,
        t: 0.5 + i * 0.09,
        m: 0.5 + i * 0.09,
        d: dm(48),
      });
  } else if (e.at == 'volley' && e.as <= 0) {
    // BEHEMOTH: tembakan peluru berat menyebar
    e.as = 0.9 / rg;
    const vn = mob(2, 3);
    for (let j = -vn; j <= vn; j++) sh(A + j * 0.17, 300, 30, 11);
  } else if (e.at == 'blink' && e.as <= 0) {
    // WRAITH: teleport ke dekat pemain, tebasan area + tembakan menyebar
    e.as = 0.95 / rg;
    pf(e.x, e.y, 16, e.c, 260, 0.4);
    const a = R(0, TAU),
      dd = R(170, 230);
    e.x = cl(tg.x + Math.cos(a) * dd, e.r, W - e.r);
    e.y = cl(tg.y + Math.sin(a) * dd, e.r, H - e.r);
    pf(e.x, e.y, 20, e.c, 320, 0.5);
    RG.push({ x: e.x, y: e.y, r: 0, mr: e.r * 2.5, c: e.c, w: 4, l: 0.3, m: 0.3 });
    HZ.push({ k: 'ring', x: e.x, y: e.y, r: 240, t: 0.55, m: 0.55, d: dm(50) });
    const A2 = Math.atan2(tg.y - e.y, tg.x - e.x),
      an = mob(1, 2);
    for (let j = -an; j <= an; j++) sh(A2 + j * 0.15, 420, 20, 7);
    snd(300, 0.2, 'triangle', 0.06);
  }
  if (e.ac <= 0) {
    e.at = '';
    e.cd = 1.3 / rg;
  }
}
