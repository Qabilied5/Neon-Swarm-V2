// Layar menu, pause, level-up, game over
function drawMenu() {
  if (S != 'menu') return;
  const big = Math.min(84, UW / 8, UH / 4.5),
    ty = UH * (TOUCH ? 0.27 : 0.36);
  tx('NEON SWARM', UW / 2, ty, big, '#22d3ee', 'center', 30);
  tx('bertahan hidup dari kawanan neon', UW / 2, ty + (TOUCH ? big * 0.45 : 34), 16, '#7aa2c0');
  let sy;
  if (TOUCH) {
    // petunjuk kontrol sentuh (landscape): font mengecil di layar sempit
    const sz = cl(UW / 60, 10, 14),
      y0 = ty + big * 0.45 + 34,
      lines = [
        [
          'SISI KIRI LAYAR = gerak  ·  SISI KANAN = tahan & geser untuk menembak / membidik',
          '#39ff88',
        ],
        [
          'Tombol kanan bawah: ✚ HEAL +30% · Q NOVA · E LASER · R BLACK HOLE · DASH',
          '#ffd166',
        ],
        [
          'WAVE 6+ musuh berevolusi  ·  WAVE 8+ 3 tabrakan = MATI  ·  WAVE 15+ super boss',
          '#ff8da1',
        ],
      ];
    lines.forEach((l, i) => tx(l[0], UW / 2, y0 + i * (sz + 9), sz, l[1]));
    sy = y0 + lines.length * (sz + 9) + 26;
  } else {
    tx(
      'WASD gerak  ·  MOUSE bidik (tembak otomatis)  ·  SPACE / klik kanan dash',
      UW / 2,
      UH * 0.56,
      15,
      '#39ff88',
    );
    tx(
      'C HEAL +30% HP (cooldown 60 dtk)  ·  Q NOVA  ·  E LASER  ·  R BLACK HOLE  (Q/E/R dibuka lewat upgrade)',
      UW / 2,
      UH * 0.56 + 50,
      13,
      '#ffd166',
    );
    tx(
      'WAVE 6+ musuh berevolusi  ·  WAVE 8+ 3 tabrakan = MATI  ·  WAVE 15+ super boss',
      UW / 2,
      UH * 0.56 + 74,
      13,
      '#ff8da1',
    );
    tx(
      'P pause  ·  M suara  ·  boss tiap 5 wave dengan ejekan dari AI (Ollama, opsional)',
      UW / 2,
      UH * 0.56 + 26,
      13,
      '#7aa2c0',
    );
    sy = UH * 0.7;
  }
  tx(
    Math.floor(T * 2) % 2
      ? TOUCH
        ? 'SENTUH LAYAR UNTUK MULAI'
        : 'KLIK ATAU TEKAN ENTER UNTUK MULAI'
      : '',
    UW / 2,
    sy,
    20,
    '#ffd166',
    'center',
    12,
  );
  if (best) tx('REKOR ' + best, UW / 2, sy + 28, 14, '#7aa2c0');
  // iPhone/iPad (Safari) tidak punya tombol install otomatis
  if (IOS && !STANDALONE)
    tx('Instal: tombol Bagikan → "Tambah ke Layar Utama"', UW / 2, UH - SAFE.b - 12, 12, '#7aa2c0');
}
function drawPause() {
  if (S == 'pause') {
    g.fillStyle = 'rgba(0,0,0,.6)';
    g.fillRect(0, 0, UW, UH);
    tx('PAUSE', UW / 2, UH / 2, 60, '#22d3ee', 'center', 20);
    tx(
      TOUCH ? 'sentuh layar untuk lanjut' : 'tekan P untuk lanjut',
      UW / 2,
      UH / 2 + 34,
      16,
      '#7aa2c0',
    );
  }
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
      const x = c.x0 + i * (c.cw + c.gp);
      neon(hv == i ? '#39ff88' : '#22d3ee', hv == i ? '#39ff8822' : '#0a1220');
      g.fillRect(x, c.y0, c.cw, c.ch);
      g.strokeRect(x, c.y0, c.cw, c.ch);
      tx(String(i + 1), x + 14, c.y0 + 24, 16, '#7aa2c0', 'left');
      tx(u[0], x + c.cw / 2, c.y0 + 70, Math.min(17, c.cw / 11), '#fff', 'center', 8);
      const w = u[1].split(' ');
      let ln = '',
        y = c.y0 + 108;
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
    tx('SISTEM RUNTUH', UW / 2, UH * 0.36, big * 0.8, '#ff2e63', 'center', 30);
    tx(
      `SKOR ${score}   ·   WAVE ${wave}   ·   KILLS ${kills}`,
      UW / 2,
      UH * 0.36 + 44,
      20,
      '#39ff88',
      'center',
      8,
    );
    if (score >= best && score > 0)
      tx('REKOR BARU!', UW / 2, UH * 0.36 + 74, 18, '#ffd166', 'center', 10);
    tx(epi, UW / 2, UH * 0.36 + 110, 15, '#ffd166');
    if (deadT <= 0)
      tx(
        Math.floor(T * 2) % 2
          ? TOUCH
            ? 'SENTUH LAYAR UNTUK MAIN LAGI'
            : 'KLIK ATAU ENTER UNTUK MAIN LAGI'
          : '',
        UW / 2,
        UH * 0.7,
        20,
        '#22d3ee',
        'center',
        12,
      );
  }
}
