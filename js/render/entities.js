// Gambar orb, peluru, musuh, pemain
function drawOrbs() {
  for (const o of O) {
    neon('#ffd166');
    poly(o.x, o.y, o.v > 2 ? 6 : 4, 4, T * 3);
    g.fill();
    g.stroke();
  }
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
    neon('#39ff88', '#39ff88');
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
function drawOrbitals() {
  for (let j = 0; j < P.orb; j++) {
    const a = P.ot + (j * TAU) / P.orb;
    neon('#ffd166', '#ffd166');
    g.beginPath();
    g.arc(P.x + Math.cos(a) * ORB_R, P.y + Math.sin(a) * ORB_R, ORB_SIZE, 0, TAU);
    g.fill();
  }
}
function drawPlayer() {
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
