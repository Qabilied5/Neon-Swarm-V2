// Tombol UI kecil (fullscreen, pause) + hit test
function uiBtns() {
  if (S == 'dead' || S == 'hudedit' || RK.on) return [];
  const b = [],
    k = 1; // UI sudah di ruang layar: ukuran tombol tidak ikut zoom
  let x = UW - SAFE.r - 26 * k;
  if (!STANDALONE) {
    // sudah fullscreen saat dipasang sebagai PWA
    b.push({ k: 'fs', x, y: 84 * k, r: 20 * k });
    x -= 48 * k;
  }
  if (S == 'play' || S == 'pause') {
    if (TOUCH) {
      b.push({ k: 'pause', x, y: 84 * k, r: 20 * k }); // desktop pakai P / Esc untuk pause
      x -= 48 * k;
    }
    b.push({ k: 'stat', x, y: 84 * k, r: 20 * k }); // STAT: pause + tampilkan statistik & upgrade (ui/stats.js), desktop + HP
    x -= 48 * k;
  }
  if (TOUCH && (S == 'menu' || S == 'pause')) b.push({ k: 'hud', x, y: 84 * k, r: 20 * k }); // atur tata letak kontrol
  return b;
}
const uiHit = (x, y) => {
  const b = uiBtns().find((b) => Math.hypot(b.x - x, b.y - y) < b.r + 8);
  return b ? b.k : null;
};
function uiAct(u) {
  if (u == 'fs') goFS();
  else if (u == 'hud') {
    ST.on = 0;
    heOpen();
  } else if (u == 'stat') {
    // dari main: pause + buka panel; saat panel terbuka: lanjut main; saat pause biasa: buka panel
    if (S == 'play') {
      S = 'pause';
      statOpen();
    } else if (S == 'pause') {
      if (ST.on) statClose();
      else statOpen();
    }
  } else if (S == 'play') S = 'pause';
  else if (S == 'pause') {
    ST.on = 0;
    S = 'play';
  }
}
function uiDraw() {
  const k = 1;
  for (const b of uiBtns()) {
    g.globalAlpha = 0.75;
    g.shadowBlur = 0;
    g.strokeStyle = '#22d3ee';
    g.fillStyle = '#0a1220';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(b.x, b.y, b.r, 0, TAU);
    g.fill();
    g.stroke();
    g.beginPath();
    if (b.k == 'fs') {
      for (const sx of [-1, 1])
        for (const sy of [-1, 1]) {
          g.moveTo(b.x + sx * 8 * k, b.y + sy * 3 * k);
          g.lineTo(b.x + sx * 8 * k, b.y + sy * 8 * k);
          g.lineTo(b.x + sx * 3 * k, b.y + sy * 8 * k);
        }
      g.stroke();
    } else if (b.k == 'hud') {
      tx('HUD', b.x, b.y + 4 * k, 11 * k, '#22d3ee', 'center', 0);
    } else if (b.k == 'stat') {
      tx('STAT', b.x, b.y + 4 * k, 10 * k, S == 'pause' && ST.on ? '#39ff88' : '#22d3ee', 'center', 0);
    } else {
      g.fillStyle = '#22d3ee';
      g.fillRect(b.x - 6 * k, b.y - 7 * k, 4 * k, 14 * k);
      g.fillRect(b.x + 2 * k, b.y - 7 * k, 4 * k, 14 * k);
    }
  }
  g.globalAlpha = 1;
}
