// Bar skill desktop: Dash (Space), Q/E/R/T + heal C + Super Shield. Semua punya UI cooldown (kotak gelap turun + sisa detik).
// Skill yang masih terkunci (Q/E/R/T belum dipilih di level-up, shield belum diambil) tidak ditampilkan; dash & heal selalu ada.
function skillHud() {
  const list = [
    ['dash', 'SPC', '#ffd166', 'dash'],
    ['q', 'Q', '#22d3ee', 'nova'],
    ['e', 'E', '#ff2e63', 'laser'],
    ['r', 'R', '#b967ff', 'hole'],
    ['tp', 'T', '#ff9f1c', 'teleport'],
    ['c', 'C', '#39ff88', 'heal'],
    ['sh', '◈', '#4da3ff', 'shield'],
  ].filter((k) => k[0] == 'dash' || k[0] == 'c' || (k[0] == 'sh' ? P.sh : P.sk[k[0]] > 0));
  list.forEach((k, i) => {
    const id = k[0],
      x = UW / 2 - (list.length * 56 - 8) / 2 + i * 56,
      y = UH - 62,
      lv = id == 'dash' || id == 'c' || id == 'sh' ? 1 : P.sk[id],
      // sisa cooldown & cooldown maksimum: dash = P.dc / P.dashCD, shield = waktu pulih P.shc / shCd() (0 saat aktif), lainnya P.cd / P.cm
      cd = id == 'dash' ? P.dc : id == 'sh' ? (P.shn > 0 ? 0 : P.shc) : P.cd[id],
      mx = id == 'dash' ? P.dashCD : id == 'sh' ? shCd() : P.cm[id] || 9,
      lbl = id == 'dash' ? cd.toFixed(1) + 's' : Math.ceil(cd) + 's';
    g.shadowBlur = 0;
    g.fillStyle = '#0a1220';
    g.fillRect(x, y, 48, 48);
    g.strokeStyle = lv ? k[2] : '#1d3a55';
    g.lineWidth = 2;
    g.strokeRect(x, y, 48, 48);
    if (lv && cd > 0) {
      g.fillStyle = 'rgba(0,0,0,.7)';
      g.fillRect(x, y, 48, 48 * cl(cd / mx, 0, 1));
    }
    // ikon SVG di tengah kotak (redup saat cooldown), huruf tombol keyboard kecil di pojok kiri atas
    g.globalAlpha = cd > 0 ? 0.45 : 1;
    if (!drawIcon(k[3], x + 24, y + 22, 32, k[2], lv && cd <= 0 ? 10 : 0))
      tx(k[1], x + 24, y + 30, 22, lv ? k[2] : '#2a4560', 'center', lv && cd <= 0 ? 12 : 0);
    g.globalAlpha = 1;
    tx(k[1], x + 6, y + 12, k[1].length > 2 ? 9 : 11, lv ? k[2] : '#2a4560', 'left');
    // teks bawah: sisa detik saat cooldown; saat siap -> READY / +30% (heal) / Lv skill / peluru shield
    tx(
      cd > 0
        ? lbl
        : id == 'c'
          ? '+30%'
          : id == 'sh'
            ? '●'.repeat(P.shn)
            : id == 'dash' || id == 'tp'
              ? 'READY'
              : 'Lv' + lv,
      x + 24,
      y + 43,
      10,
      cd > 0 ? '#ffd166' : '#7aa2c0',
    );
  });
}
