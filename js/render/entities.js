// Gambar orb, peluru, musuh, pemain
function drawOrbs() {
  for (const o of O) {
    neon('#ffd166');
    poly(o.x, o.y, o.v > 2 ? 6 : 4, 4, T * 3);
    g.fill();
    g.stroke();
  }
}
// Free Heal: heksagon hijau melayang naik-turun dengan tanda plus; berkedip saat wave hampir berganti
function drawHeals() {
  for (const h of HL) {
    const y = h.y + Math.sin(T * 2.4 + h.ph) * 6 * ZK,
      r = 14 * ZK,
      blink = waveT > 19 ? 0.45 + 0.55 * Math.abs(Math.sin(T * 8)) : 1;
    g.globalAlpha = blink;
    neon('#39ff88', '#39ff8833');
    poly(h.x, y, r, 6, T * 0.8);
    g.fill();
    g.stroke();
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(h.x - r * 0.45, y);
    g.lineTo(h.x + r * 0.45, y);
    g.moveTo(h.x, y - r * 0.45);
    g.lineTo(h.x, y + r * 0.45);
    g.stroke();
    g.lineCap = 'butt';
    g.globalAlpha = 0.25 * blink; // bayangan di tanah: memberi kesan melayang
    g.shadowBlur = 0;
    g.fillStyle = '#39ff88';
    g.beginPath();
    g.ellipse(h.x, h.y + r + 8 * ZK, r * 0.7, r * 0.22, 0, 0, TAU);
    g.fill();
  }
  g.shadowBlur = 0;
  g.globalAlpha = 1;
}
function drawBullets() {
  for (const b of B) {
    if (b.ss) {
      // peluru super (Super Shot): emas, tebal, berekor panjang
      neon('#ffd166', '#fff');
      g.lineWidth = 5 * ZK;
      g.beginPath();
      g.moveTo(b.x, b.y);
      g.lineTo(b.x - b.vx * 0.06, b.y - b.vy * 0.06);
      g.stroke();
      g.fillStyle = '#fff';
      g.beginPath();
      g.arc(b.x, b.y, b.r * 0.75, 0, TAU);
      g.fill();
      continue;
    }
    neon(b.c || '#39ff88', b.c || '#39ff88');
    g.beginPath();
    g.moveTo(b.x, b.y);
    g.lineTo(b.x - b.vx * 0.03, b.y - b.vy * 0.03);
    g.stroke();
  }
}
function drawEnemyBullets() {
  for (const b of EB) {
    neon('#ff2e63', '#ff2e63');
    g.beginPath();
    g.arc(b.x, b.y, b.r, 0, TAU);
    g.fill();
  }
}
function drawEnemies() {
  for (const e of E) {
    const c = e.fl > 0 || (e.fuse > 0 && Math.floor(T * 16) % 2) ? '#fff' : e.c,
      a = Math.atan2(P.y - e.y, P.x - e.x);
    neon(c, e.fl > 0 ? '#ffffff55' : null);
    const n = ET[e.k] ? ET[e.k].n : 8;
    if (e.tp > 0) g.globalAlpha = 0.3;
    if (e.k == 'boss') {
      g.lineWidth = 3;
      poly(e.x, e.y, e.r, 8, e.ph);
      g.fill();
      g.stroke();
      poly(e.x, e.y, e.r * 0.55, 8, -e.ph * 1.6);
      g.stroke();
      if (e.sec) {
        poly(e.x, e.y, e.r * 1.25, 4, e.ph * 0.8);
        g.stroke();
        poly(e.x, e.y, e.r * 0.3, 3, -e.ph * 2);
        g.fill();
        g.stroke();
        if (e.ch > 0) {
          g.globalAlpha = 0.5;
          g.beginPath();
          g.arc(e.x, e.y, e.r * (1.5 + 0.2 * Math.sin(t * 20)), 0, TAU);
          g.stroke();
          g.globalAlpha = 1;
        }
      }
      if (e.sup) {
        poly(e.x, e.y, e.r * 1.3, 8, -e.ph * 0.7);
        g.stroke();
        poly(e.x, e.y, e.r * 0.3, 4, e.ph * 3);
        g.fill();
        g.stroke();
      }
    } else if (n == 0) {
      g.beginPath();
      g.arc(e.x, e.y, e.r, 0, TAU);
      g.fill();
      g.stroke();
      g.beginPath();
      g.arc(e.x, e.y, e.r * 0.5, 0, TAU);
      g.stroke();
    } else {
      poly(e.x, e.y, e.r, n, a);
      g.fill();
      g.stroke();
      if (e.k == 'brute' || e.k == 'juggernaut') {
        poly(e.x, e.y, e.r * 0.5, 6, -a);
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    if (e.k == 'striker' && e.st == 1) {
      g.globalAlpha = 0.7;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(e.x, e.y);
      g.lineTo(e.x + e.lx * 320, e.y + e.ly * 320);
      g.stroke();
      g.globalAlpha = 1;
    }
    if (e.k == 'bomber' && e.fuse > 0) {
      g.globalAlpha = 0.5;
      g.beginPath();
      g.arc(e.x, e.y, 100, 0, TAU);
      g.stroke();
      g.globalAlpha = 1;
    }
    if (e.k == 'reaper' && e.tp > 0) {
      g.beginPath();
      g.arc(e.tx, e.ty, 24, 0, TAU);
      g.stroke();
    }
    if (e.k != 'boss' && e.mh >= 60 && e.hp < e.mh)
      bar(e.x - 14, e.y - e.r - 8, 28, 3, e.hp / e.mh, e.c);
  }
}
// Orbital Shuriken: bintang 4 bilah yang berputar pada porosnya sambil mengorbit pemain, dengan jejak busur tipis
function drawOrbitals() {
  for (let j = 0; j < P.orb; j++) {
    const a = P.ot + (j * TAU) / P.orb,
      x = P.x + Math.cos(a) * orbR(),
      y = P.y + Math.sin(a) * orbR(),
      spin = T * 14 + j;
    neon('#ffd166', '#ffd16655');
    g.globalAlpha = 0.25; // jejak orbit
    g.beginPath();
    g.arc(P.x, P.y, orbR(), a - 0.5, a);
    g.stroke();
    g.globalAlpha = 1;
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const rr = i % 2 ? ORB_SIZE * 0.36 : ORB_SIZE,
        t = spin + (i * Math.PI) / 4;
      g[i ? 'lineTo' : 'moveTo'](x + Math.cos(t) * rr, y + Math.sin(t) * rr);
    }
    g.closePath();
    g.fill();
    g.stroke();
    g.shadowBlur = 0;
    g.fillStyle = '#04060d'; // lubang tengah shuriken
    g.beginPath();
    g.arc(x, y, ORB_SIZE * 0.17, 0, TAU);
    g.fill();
  }
}
// SPIKE AURA / BLIZZARD: lingkaran aura di sekitar pemain
function drawAura() {
  if (!P.aura) return;
  const r = auraR(),
    bz = ev('bliz'),
    c = bz ? '#8be9ff' : '#ff2e63';
  g.save();
  g.shadowBlur = 0;
  g.fillStyle = c;
  g.globalAlpha = 0.05 + 0.03 * Math.sin(T * 4);
  g.beginPath();
  g.arc(P.x, P.y, r, 0, TAU);
  g.fill();
  g.strokeStyle = c;
  g.globalAlpha = 0.5;
  g.lineWidth = 2 * ZK;
  g.setLineDash([8, 6]);
  g.lineDashOffset = -T * 30;
  g.beginPath();
  g.arc(P.x, P.y, r, 0, TAU);
  g.stroke();
  if (bz) {
    g.globalAlpha = 0.2;
    g.beginPath();
    g.arc(P.x, P.y, r + 80, 0, TAU);
    g.stroke();
  }
  g.restore();
}
// DRONE: berlian kecil mengorbit pemain
function drawDrones() {
  for (let j = 0; j < P.drn; j++) {
    const [x, y] = dronePos(j);
    neon('#22d3ee', '#22d3ee55');
    poly(x, y, 7, 4, T * 3 + j);
    g.fill();
    g.stroke();
  }
  g.shadowBlur = 0;
}
function drawPlayer() {
  if (S != 'dead') {
    drawAura();
    drawDrones();
  }
  if (S != 'dead' && (P.inv <= 0 || Math.floor(T * 20) % 2)) {
    neon('#22d3ee', '#22d3ee33');
    poly(P.x, P.y, P.r + 2, 3, P.a);
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(P.x, P.y, P.r + 9, -0.5, TAU * (1 - P.dc / P.dashCD) - 0.5);
    g.globalAlpha = 0.5;
    g.stroke();
    g.globalAlpha = 1;
  }
  if (S != 'dead') drawShield();
}
// SUPER SHIELD: cincin biru berisi 1 busur per sisa serangan (3 -> 2 -> 1); saat pulih: busur redup menunjukkan progres
function drawShield() {
  if (!P.sh) return;
  const R0 = P.r + 20,
    c = '#4da3ff';
  g.save();
  g.lineCap = 'round';
  if (P.shn > 0) {
    const fl = P.shf > 0 ? 1 : 0, // kilat putih saat terkena
      rot = T * 0.9,
      col = fl ? '#ffffff' : c;
    g.fillStyle = c;
    g.globalAlpha = 0.07 + 0.05 * Math.sin(T * 4) + fl * 0.15;
    g.beginPath();
    g.arc(P.x, P.y, R0, 0, TAU);
    g.fill();
    g.strokeStyle = col;
    g.shadowColor = c;
    g.shadowBlur = TOUCH ? 6 : 12;
    g.lineWidth = (fl ? 4 : 3) * ZK;
    g.globalAlpha = 0.7 + 0.2 * Math.sin(T * 5);
    const seg = TAU / shMax();
    for (let i = 0; i < P.shn; i++) {
      g.beginPath();
      g.arc(P.x, P.y, R0, rot + i * seg, rot + i * seg + seg * 0.78);
      g.stroke();
    }
  } else if (P.shc > 0) {
    g.strokeStyle = c;
    g.globalAlpha = 0.28;
    g.lineWidth = 2 * ZK;
    g.beginPath();
    g.arc(P.x, P.y, R0, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - P.shc / shCd())); // makin penuh = makin dekat aktif
    g.stroke();
  }
  g.restore();
}

// Sandevistan: jejak bayangan sepanjang dash (aberasi kromatik merah/cyan)
function drawGhosts() {
  if (!GH.length) return;
  g.shadowBlur = 0;
  g.lineWidth = 2 * ZK;
  for (const o of GH) {
    g.globalAlpha = (o.t / o.m) * 0.5;
    g.strokeStyle = '#ff2e63';
    g.fillStyle = '#ff2e6322';
    poly(o.x - 4, o.y, P.r + 2, 3, o.a);
    g.fill();
    g.stroke();
    g.strokeStyle = '#22d3ee';
    g.fillStyle = '#22d3ee22';
    poly(o.x + 4, o.y, P.r + 2, 3, o.a);
    g.fill();
    g.stroke();
  }
  g.globalAlpha = 1;
}
// Sandevistan: bayangan hologram di posisi awal dash (target musuh) + cincin sisa waktu
function drawDecoy() {
  if (!DC) return;
  const fl = DC.t < 0.4 && Math.floor(T * 24) % 2 ? 0.35 : 1, // berkedip saat hampir habis
    pr = (T * 1.6) % 1;
  g.globalAlpha = (0.55 + 0.25 * Math.sin(T * 14)) * fl;
  neon('#22d3ee', '#22d3ee33');
  poly(DC.x, DC.y, P.r + 2, 3, DC.a);
  g.fill();
  g.stroke();
  g.shadowBlur = 0;
  g.lineWidth = ZK;
  g.globalAlpha = 0.35 * fl;
  for (let j = -1; j <= 1; j++) {
    g.beginPath();
    g.moveTo(DC.x - P.r - 6, DC.y + j * 7);
    g.lineTo(DC.x + P.r + 6, DC.y + j * 7);
    g.stroke();
  }
  g.lineWidth = 2 * ZK;
  g.globalAlpha = 0.8 * fl;
  g.strokeStyle = '#ff2e63';
  g.beginPath();
  g.arc(DC.x, DC.y, P.r + 14, -Math.PI / 2, -Math.PI / 2 + TAU * cl(DC.t / DC.m, 0, 1));
  g.stroke();
  g.globalAlpha = (1 - pr) * 0.35 * fl;
  g.strokeStyle = '#22d3ee';
  g.beginPath();
  g.arc(DC.x, DC.y, P.r + 14 + pr * 34, 0, TAU);
  g.stroke();
  g.globalAlpha = 1;
}
