// Gambar ikon skill Q/E/R + heal C di desktop
function skillHud() {
  // hanya skill yang sudah terbuka (+ heal C); yang masih terkunci tidak ditampilkan
  const list = [
    ['q', 'Q', '#22d3ee'],
    ['e', 'E', '#ff2e63'],
    ['r', 'R', '#b967ff'],
    ['c', 'C', '#39ff88'],
  ].filter((k) => k[0] == 'c' || P.sk[k[0]] > 0);
  list.forEach((k, i) => {
    const x = UW / 2 - (list.length * 56 - 8) / 2 + i * 56,
      y = UH - 62,
      isC = k[0] == 'c',
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
      g.fillRect(x, y, 48, 48 * cl(cd / (isC ? HEAL_CD : 9), 0, 1));
    }
    tx(k[1], x + 24, y + 30, 22, lv ? k[2] : '#2a4560', 'center', lv && cd <= 0 ? 12 : 0);
    if (isC) tx(cd > 0 ? Math.ceil(cd) + 's' : '+30%', x + 24, y + 43, 10, '#7aa2c0');
    else if (lv) tx('Lv' + lv, x + 24, y + 43, 10, '#7aa2c0');
  });
}
