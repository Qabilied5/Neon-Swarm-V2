// Gambar ikon skill Q/E/R/T + heal C di desktop
function skillHud() {
  // hanya skill yang sudah terbuka (+ heal C); yang masih terkunci tidak ditampilkan
  const list = [
    ['q', 'Q', '#22d3ee', 'nova'],
    ['e', 'E', '#ff2e63', 'laser'],
    ['r', 'R', '#b967ff', 'hole'],
    ['tp', 'T', '#ff9f1c', 'teleport'],
    ['c', 'C', '#39ff88', 'heal'],
  ].filter((k) => k[0] == 'c' || P.sk[k[0]] > 0);
  list.forEach((k, i) => {
    const x = UW / 2 - (list.length * 56 - 8) / 2 + i * 56,
      y = UH - 62,
      isC = k[0] == 'c',
      timed = isC || k[0] == 'tp', // heal & teleport: tampilkan sisa detik
      lv = isC ? 1 : P.sk[k[0]],
      cd = P.cd[k[0]];
    g.shadowBlur = 0;
    g.fillStyle = '#0a1220';
    g.fillRect(x, y, 48, 48);
    g.strokeStyle = lv ? k[2] : '#1d3a55';
    g.lineWidth = 2;
    g.strokeRect(x, y, 48, 48);
    if (lv && cd > 0) {
      g.fillStyle = 'rgba(0,0,0,.7)';
      g.fillRect(x, y, 48, 48 * cl(cd / (isC ? HEAL_CD : k[0] == 'tp' ? TP_CD : 9), 0, 1));
    }
    // ikon SVG di tengah kotak (redup saat cooldown), huruf tombol keyboard kecil di pojok kiri atas
    g.globalAlpha = cd > 0 ? 0.45 : 1;
    if (!drawIcon(k[3], x + 24, y + 22, 32, k[2], lv && cd <= 0 ? 10 : 0))
      tx(k[1], x + 24, y + 30, 22, lv ? k[2] : '#2a4560', 'center', lv && cd <= 0 ? 12 : 0);
    g.globalAlpha = 1;
    tx(k[1], x + 6, y + 12, 11, lv ? k[2] : '#2a4560', 'left');
    if (timed) tx(cd > 0 ? Math.ceil(cd) + 's' : isC ? '+30%' : 'READY', x + 24, y + 43, 10, '#7aa2c0');
    else if (lv) tx('Lv' + lv, x + 24, y + 43, 10, '#7aa2c0');
  });
}
