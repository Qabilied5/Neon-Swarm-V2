// Vignette, flash merah, HUD (HP, XP, skor, wave, boss bar)
function drawOverlayFx() {
  // UI (vignette, HUD, tombol sentuh, menu, kartu) digambar di RUANG LAYAR: 1 satuan = 1 px layar (UW,UH).
  // Tidak ikut zoom dunia (ZM), jadi ukuran teks & tombol tetap sama berapa pun medan perang di-zoom-out.
  const d = Math.min(devicePixelRatio || 1, 2);
  g.setTransform(d, 0, 0, d, 0, 0);
  const v = g.createRadialGradient(UW / 2, UH / 2, UH * 0.3, UW / 2, UH / 2, UH * 0.9);
  v.addColorStop(0, 'transparent');
  v.addColorStop(1, 'rgba(0,0,0,.65)');
  g.fillStyle = v;
  g.fillRect(0, 0, UW, UH);
  if (flash > 0) {
    g.fillStyle = `rgba(255,46,99,${flash})`;
    g.fillRect(0, 0, UW, UH);
  }
}
function drawHud() {
  if (S != 'menu' && P) {
    const L = SAFE.l,
      Rr = UW - SAFE.r,
      hw = cl(UW * 0.2, 130, 200); // lebar bar HP/XP menyesuaikan lebar layar
    bar(L + 16, 16, hw, 12, P.hp / P.mh, '#ff2e63');
    tx('HP ' + Math.ceil(P.hp), L + 20, 42, 12, '#ff8da1', 'left');
    bar(L + 16, 50, hw, 6, P.xp / P.need, '#ffd166');
    tx('LV ' + P.lv, L + 20, 72, 12, '#ffd166', 'left');
    if (wave >= LET) {
      const n = Math.ceil(P.hp / Math.ceil(P.mh / 3));
      tx(
        '☠ TABRAKAN TERSISA: ' + n,
        L + 20,
        92,
        13,
        n <= 1 ? '#ff2e63' : '#ffb703',
        'left',
        n <= 1 ? 10 : 0,
      );
    }
    tx('SCORE ' + score, Rr - 16, 30, 18, '#39ff88', 'right', 8);
    tx('BEST ' + best, Rr - 16, 50, 12, '#7aa2c0', 'right');
    tx('WAVE ' + wave + '  ·  KILLS ' + kills, UW / 2, 28, 14, '#22d3ee', 'center', 6);
    if (boss) {
      const big = boss.sup || boss.sec,
        bw = Math.max(
          120,
          Math.min(big ? 460 : 320, UW * 0.45, UW - 2 * (Math.max(SAFE.l, SAFE.r) + hw + 40)),
        ); // jangan menabrak blok HP (kiri) & skor (kanan) di layar sempit
      bar(
        UW / 2 - bw / 2,
        40,
        bw,
        big ? 12 : 8,
        boss.hp / boss.mh,
        boss.sec ? '#ffd166' : '#ff2e63',
      );
      if (boss.sup) tx('☠ ANNIHILATOR ☠', UW / 2, 68, 12, '#ffd166', 'center', 8);
      if (boss.sec) tx('◈ PRISM SENTINEL ◈', UW / 2, 68, 12, '#ffd166', 'center', 8);
      if (taunt) tx('"' + taunt + '"', UW / 2, big ? 88 : 72, Math.min(14, UW / 50), '#ff8da1', 'center', 6);
    }
    TOUCH ? touchHud() : skillHud();
    if (combo > 1) tx('COMBO x' + combo, UW / 2, UH - 74, 18, '#ffd166', 'center', 10);
    if (msgT > 0) {
      g.globalAlpha = cl(msgT, 0, 1);
      const my = Math.max(UH * 0.3, 132); // di layar pendek, turun sedikit agar tidak menimpa bar boss & ejekan
      tx(msg, UW / 2, my, Math.min(56, UW / 10), '#fff', 'center', 20);
      if (sub) tx(sub, UW / 2, my + 36, Math.min(20, UW / 26), '#ff8da1', 'center', 10);
      g.globalAlpha = 1;
    }
  }
}
