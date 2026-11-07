// Helper gambar: poly(), neon(), tx() teks, bar()
function poly(x, y, r, n, rot) {
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    i
      ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
      : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  g.closePath();
}
const neon = (c, f) => {
  g.shadowColor = c;
  g.shadowBlur = TOUCH ? 6 : 14; // glow lebih ringan di HP
  g.strokeStyle = c;
  g.fillStyle = f || c + '22';
  g.lineWidth = 2 * ZK; // tidak menipis saat zoom-out
};
function tx(s, x, y, sz, c, al = 'center', gl = 0) {
  g.font = `700 ${sz}px Consolas,Menlo,monospace`;
  g.textAlign = al;
  g.fillStyle = c;
  g.shadowColor = c;
  g.shadowBlur = gl;
  g.fillText(s, x, y);
  g.shadowBlur = 0;
}
function bar(x, y, w, h, v, c) {
  g.shadowBlur = 0;
  g.fillStyle = '#0b1626';
  g.fillRect(x, y, w, h);
  g.fillStyle = c;
  g.shadowColor = c;
  g.shadowBlur = 8;
  g.fillRect(x, y, w * cl(v, 0, 1), h);
  g.shadowBlur = 0;
  g.strokeStyle = '#1d3a55';
  g.lineWidth = 1;
  g.strokeRect(x, y, w, h);
}
