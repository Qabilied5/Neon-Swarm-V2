// Layar menu, pause, level-up, game over

// ---------- MENU UTAMA ----------
// Tata letak menu dihitung sekali per frame dan dipakai juga untuk hit-test tombol TUTORIAL.
function menuLayout() {
  const sw = UW - SAFE.l - SAFE.r,
    cx = SAFE.l + sw / 2,
    big = Math.min(78, sw / 9, UH / 5.2),
    ch = cl(UH * 0.2, 66, 112),
    elev = cl(UH * 0.035, 8, 20), // kartu peringkat 1 lebih tinggi
    gap = cl(UH * 0.05, 12, 34),
    bh = cl(UH * 0.075, 34, 44),
    bw = cl(sw * 0.2, 130, 190),
    bg = 14, // jarak antar tombol TUTORIAL & RANKING
    total = big + gap + 32 + ch + elev + gap + 22 + gap + bh,
    y0 = Math.max(SAFE.t + 8, (UH - total) / 2),
    titleY = y0 + big * 0.82,
    lblY = y0 + big + gap + 10,
    cardsY = lblY + 26 + elev, // sisi atas kartu non-juara; kartu juara naik sebesar elev
    promptY = cardsY + ch + gap + 14,
    btnY = promptY + gap + 6;
  return {
    sw,
    cx,
    big,
    ch,
    elev,
    gap,
    titleY,
    lblY,
    cardsY,
    promptY,
    btn: { x: cx - bg / 2 - bw, y: btnY, w: bw, h: bh }, // TUTORIAL
    btn2: { x: cx + bg / 2, y: btnY, w: bw, h: bh }, // RANKING
  };
}
// tombol menu yang tersentuh: 'tut' (TUTORIAL), 'rank' (RANKING) atau null
const menuBtnHit = (x, y) => {
  if (S != 'menu') return null;
  const L = menuLayout(),
    at = (b) => x >= b.x - 6 && x <= b.x + b.w + 6 && y >= b.y - 6 && y <= b.y + b.h + 6;
  return at(L.btn) ? 'tut' : at(L.btn2) ? 'rank' : null;
};
function rrect(x, y, w, h, r) {
  g.beginPath();
  g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h);
}
// potong teks dengan "…" agar muat di lebar w
function fitText(s, sz, w) {
  if (lbW(s, sz) <= w) return s;
  while (s.length > 1 && lbW(s + '…', sz) > w) s = s.slice(0, -1);
  return s + '…';
}
function drawMenu() {
  if (S != 'menu') return;
  const L = menuLayout(),
    cx = L.cx,
    glow = TOUCH ? 8 : 20;

  // pendar lembut di belakang judul
  const rg = g.createRadialGradient(cx, L.titleY - L.big * 0.3, 0, cx, L.titleY - L.big * 0.3, Math.max(UW * 0.45, 200));
  rg.addColorStop(0, 'rgba(34,211,238,.16)');
  rg.addColorStop(0.5, 'rgba(176,38,255,.06)');
  rg.addColorStop(1, 'rgba(4,6,13,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, UW, UH);

  // ---- nama game: gradien cyan -> magenta ----
  g.font = `900 ${L.big}px Consolas,Menlo,monospace`;
  g.textAlign = 'center';
  const tw = g.measureText('NEON SWARM').width,
    tg = g.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
  tg.addColorStop(0, '#22d3ee');
  tg.addColorStop(0.55, '#8be9ff');
  tg.addColorStop(1, '#ff2e97');
  g.shadowColor = '#22d3ee';
  g.shadowBlur = glow + 6 * Math.sin(T * 2);
  g.fillStyle = tg;
  g.fillText('NEON SWARM', cx, L.titleY);
  g.shadowBlur = 0;
  // garis aksen di bawah judul
  const lw = tw * 0.62,
    lg = g.createLinearGradient(cx - lw / 2, 0, cx + lw / 2, 0);
  lg.addColorStop(0, 'rgba(34,211,238,0)');
  lg.addColorStop(0.5, 'rgba(34,211,238,.9)');
  lg.addColorStop(1, 'rgba(255,46,151,0)');
  g.fillStyle = lg;
  g.fillRect(cx - lw / 2, L.titleY + L.big * 0.12, lw, 2);

  // ---- leaderboard: 3 kartu (podium 2 · 1 · 3) ----
  tx('LEADERBOARD', cx, L.lblY, 12, '#7aa2c0', 'center', 0);
  const gp = cl(L.sw * 0.016, 10, 18),
    cw = Math.min(210, (L.sw - 24 - gp * 2) / 3.45),
    order = [1, 0, 2];
  order.forEach((rank, i) => {
    const first = rank == 0,
      w = first ? cw * 1.1 : cw,
      h = first ? L.ch + L.elev : L.ch,
      x = cx + (i - 1) * (cw + gp) - w / 2,
      y = first ? L.cardsY - L.elev : L.cardsY,
      c = LB_MEDAL[rank],
      e = LB.top[rank];
    // kaca gelap + gradien warna medali
    const fg = g.createLinearGradient(0, y, 0, y + h);
    fg.addColorStop(0, c + (first ? '38' : '26'));
    fg.addColorStop(1, 'rgba(8,14,28,.88)');
    g.shadowColor = c;
    g.shadowBlur = first ? glow : glow * 0.4;
    g.fillStyle = fg;
    g.strokeStyle = c + (first ? 'ee' : '88');
    g.lineWidth = first ? 2 : 1.5;
    rrect(x, y, w, h, 12);
    g.fill();
    g.stroke();
    g.shadowBlur = 0;
    // lencana peringkat di tepi atas kartu
    const br = first ? 15 : 13;
    g.fillStyle = c;
    g.shadowColor = c;
    g.shadowBlur = 10;
    g.beginPath();
    g.arc(x + w / 2, y, br, 0, TAU);
    g.fill();
    g.shadowBlur = 0;
    tx(String(rank + 1), x + w / 2, y + br * 0.36, br * 1.15, '#04060d', 'center', 0);
    // nama + skor
    const nsz = cl(w / 12, 11, 16),
      ssz = cl(w / 7, 16, 28) * (first ? 1.12 : 1);
    tx(e ? fitText(e.name, nsz, w - 20) : '— — —', x + w / 2, y + h * 0.5, nsz, e ? '#e8f4ff' : '#3d546b', 'center', 0);
    tx(e ? e.score.toLocaleString('id-ID') : '—', x + w / 2, y + h * 0.5 + ssz + 4, ssz, e ? c : '#3d546b', 'center', e ? 8 : 0);
  });

  // ---- TAP / CLICK TO PLAY ----
  g.globalAlpha = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(T * 3));
  tx(TOUCH ? 'TAP TO PLAY' : 'CLICK TO PLAY', cx, L.promptY, cl(UH / 22, 17, 24), '#ffd166', 'center', 12);
  g.globalAlpha = 1;

  // ---- tombol TUTORIAL & RANKING ----
  const hov = !TOUCH && menuBtnHit(MU.x, MU.y);
  drawMenuBtn(L.btn, 'TUTORIAL', '#22d3ee', hov == 'tut', 'help');
  drawMenuBtn(L.btn2, 'RANKING', '#ffd166', hov == 'rank', 'rank');
}
function drawMenuBtn(b, label, bc, hot, icon) {
  g.shadowColor = bc;
  g.shadowBlur = hot ? 16 : 6;
  g.fillStyle = hot ? 'rgba(34,211,238,.22)' : 'rgba(10,18,32,.8)';
  g.strokeStyle = bc;
  g.lineWidth = 2;
  rrect(b.x, b.y, b.w, b.h, b.h / 2);
  g.fill();
  g.stroke();
  g.shadowBlur = 0;
  const ir = b.h * 0.28,
    ix = b.x + b.h * 0.55,
    iy = b.y + b.h / 2;
  g.lineWidth = 1.5;
  if (icon == 'rank') {
    // ikon podium: 3 batang (tengah tertinggi)
    g.fillStyle = bc;
    const bwid = ir * 0.62;
    for (const [dx, hh] of [[-1, 0.9], [0, 1.5], [1, 0.6]]) g.fillRect(ix + dx * (bwid + 1.5) - bwid / 2, iy + ir - ir * hh * 1.1, bwid, ir * hh * 1.1);
  } else {
    g.beginPath();
    g.arc(ix, iy, ir, 0, TAU);
    g.stroke();
    tx('?', ix, iy + ir * 0.38, ir * 1.35, bc, 'center', 0);
  }
  tx(label, b.x + b.w / 2 + b.h * 0.2, b.y + b.h / 2 + 5, 15, bc, 'center', 0);
}
// ---------- PAUSE: tombol LANJUT & RESTART (restart perlu tekan 2x agar tidak terpencet tanpa sengaja) ----------
const PAU = { conf: 0 }; // waktu (T) tekan pertama RESTART
function pauseLayout() {
  const sw = UW - SAFE.l - SAFE.r,
    cx = SAFE.l + sw / 2,
    n = TUT.on ? 4 : 3, // tutorial: + tombol KELUAR
    bw = cl(sw * (n == 4 ? 0.15 : 0.18), 100, 190),
    bh = cl(UH * 0.1, 38, 46),
    gp = 14,
    ty = UH * 0.34,
    by = ty + 28,
    ks = n == 4 ? ['resume', 'restart', 'rank', 'exit'] : ['resume', 'restart', 'rank'];
  return {
    cx,
    ty,
    hy: by + bh + 28,
    btns: ks.map((k, i) => ({ k, x: cx - (n * bw + (n - 1) * gp) / 2 + i * (bw + gp), y: by, w: bw, h: bh })),
  };
}
function pauseBtnAt(x, y) {
  if (S != 'pause' || ST.on) return null; // panel STAT menutupi tombol pause
  const b = pauseLayout().btns.find((b) => x >= b.x - 6 && x <= b.x + b.w + 6 && y >= b.y - 6 && y <= b.y + b.h + 6);
  return b ? b.k : null;
}
function pauseAct(k, id) {
  if (k == 'rank') {
    rankOpen(id); // id = sentuhan pembuka (agar touchend-nya tidak langsung menutup)
  } else if (k == 'resume') {
    PAU.conf = 0;
    S = 'play';
  } else if (k == 'exit') {
    PAU.conf = 0;
    tutExit(); // keluar dari tutorial ke menu
  } else if (k == 'restart') {
    if (PAU.conf && T - PAU.conf < 3) {
      PAU.conf = 0;
      TUT.on ? tutStart() : init(); // mulai ulang dari awal (tutorial: ulang tutorial)
    } else PAU.conf = T; // tekan pertama = minta konfirmasi
  }
}
function drawPause() {
  if (S != 'pause') {
    ST.on = 0; // panel STAT hanya hidup selama pause
    return;
  }
  if (ST.on) {
    drawStats();
    return;
  }
  const L = pauseLayout(),
    confirm = PAU.conf && T - PAU.conf < 3;
  if (!confirm) PAU.conf = 0;
  g.fillStyle = 'rgba(0,0,0,.6)';
  g.fillRect(0, 0, UW, UH);
  tx('PAUSE', L.cx, L.ty, Math.min(60, UH / 6), '#22d3ee', 'center', 20);
  for (const b of L.btns) {
    const re = b.k == 'restart',
      c = b.k == 'exit' ? '#7aa2c0' : b.k == 'rank' ? '#ffd166' : re ? (confirm ? '#ffd166' : '#ff2e63') : '#22d3ee',
      hot = !TOUCH && pauseBtnAt(MU.x, MU.y) == b.k,
      label = b.k == 'exit' ? 'KELUAR' : b.k == 'rank' ? 'RANKING' : re ? (confirm ? 'YAKIN? TEKAN LAGI' : 'RESTART') : 'LANJUT';
    g.shadowColor = c;
    g.shadowBlur = hot || (re && confirm) ? 16 : 6;
    g.fillStyle = hot ? c + '33' : 'rgba(10,18,32,.85)';
    g.strokeStyle = c;
    g.lineWidth = 2;
    rrect(b.x, b.y, b.w, b.h, b.h / 2);
    g.fill();
    g.stroke();
    g.shadowBlur = 0;
    tx(label, b.x + b.w / 2, b.y + b.h / 2 + 5, re && confirm ? (b.w < 140 ? 10 : 12) : 15, c, 'center', 0);
  }
  tx(
    TOUCH ? 'tombol HUD (kanan atas) = atur tata letak kontrol' : 'tombol STAT (kanan atas) / tekan I = statistik, upgrade & enchant',
    L.cx,
    L.hy,
    13,
    '#7aa2c0',
  );
  lbDrawTop3(L.hy + 30, 14);
}
function drawLevelup() {
  if (S == 'levelup') {
    g.fillStyle = 'rgba(0,0,0,.7)';
    g.fillRect(0, 0, UW, UH);
    const c = cl3(),
      hv = cardAt(MU.x, MU.y);
    tx(
      TOUCH
        ? 'LEVEL UP!  sentuh upgrade pilihanmu'
        : 'LEVEL UP!  pilih upgrade (klik atau tekan 1/2/3)',
      UW / 2,
      c.y0 - 30,
      Math.min(22, UW / 30),
      '#ffd166',
      'center',
      12,
    );
    cards.forEach((u, i) => {
      const x = c.x0 + i * (c.cw + c.gp),
        hot = hv == i;
      neon(hot ? '#39ff88' : '#22d3ee', hot ? '#39ff8822' : '#0a1220');
      g.fillRect(x, c.y0, c.cw, c.ch);
      g.strokeRect(x, c.y0, c.cw, c.ch);
      tx(String(i + 1), x + 14, c.y0 + 24, 16, '#7aa2c0', 'left');
      // upgrade yang sudah pernah diambil & bisa di-stack: ikon panah hijau (naik-turun pelan) + "LV lama > LV baru"
      const n = (P.up && P.up[u[0]]) || 0;
      if (n > 0 && !u[4]) {
        drawIcon('levelup', x + c.cw - 24, c.y0 + 22 - 2 * Math.abs(Math.sin(T * 5)), 28, '#39ff88', TOUCH ? 6 : 10);
        tx(`LV ${n} > ${n + 1}`, x + c.cw - 42, c.y0 + 28, 14, '#39ff88', 'right', 6);
      }
      // ikon SVG upgrade (u[3], render/icons.js); sedikit membesar saat disorot
      drawIcon(u[3], x + c.cw / 2, c.y0 + 64, Math.min(60, c.cw * 0.28) * (hot ? 1.1 : 1), hot ? '#39ff88' : '#22d3ee', TOUCH ? 6 : 12);
      tx(u[0], x + c.cw / 2, c.y0 + 118, Math.min(17, c.cw / 11), '#fff', 'center', 8);
      const w = u[1].split(' ');
      let ln = '',
        y = c.y0 + 140;
      for (const q of w) {
        if ((ln + q).length > 20) {
          tx(ln, x + c.cw / 2, y, 13, '#7aa2c0');
          y += 18;
          ln = '';
        }
        ln += q + ' ';
      }
      tx(ln, x + c.cw / 2, y, 13, '#7aa2c0');
    });
  }
}
function drawDead() {
  const big = Math.min(84, UW / 8);
  if (S == 'dead') {
    g.fillStyle = 'rgba(0,0,0,.65)';
    g.fillRect(0, 0, UW, UH);
    const y0 = UH * 0.28;
    tx('SISTEM RUNTUH', UW / 2, y0, big * 0.8, '#ff2e63', 'center', 30);
    tx(`SKOR ${score}   ·   WAVE ${wave}   ·   KILLS ${kills}`, UW / 2, y0 + 44, 20, '#39ff88', 'center', 8);
    if (score >= best && score > 0) tx('REKOR BARU!', UW / 2, y0 + 72, 18, '#ffd166', 'center', 10);
    tx(epi, UW / 2, y0 + 104, 15, '#ffd166');
    lbDrawDead(y0 + 124); // tombol KIRIM SKOR (leaderboard online)
    if (deadT <= 0)
      tx(
        Math.floor(T * 2) % 2
          ? TOUCH
            ? 'SENTUH LAYAR UNTUK MAIN LAGI'
            : 'KLIK ATAU ENTER UNTUK MAIN LAGI'
          : '',
        UW / 2,
        Math.max(UH * 0.7, y0 + 200),
        20,
        '#22d3ee',
        'center',
        12,
      );
  }
}
