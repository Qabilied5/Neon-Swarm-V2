// Latar & grid
function drawBackground() {
  g.save();
  g.fillStyle = '#04060d';
  g.fillRect(0, 0, W, H);
  const pu = 0.5 + 0.5 * Math.sin(T * 2),
    gs = 48 * ZK; // jarak grid di layar tetap sama walau zoom-out
  g.strokeStyle = `rgba(34,211,238,${0.05 + 0.035 * pu})`;
  g.lineWidth = ZK;
  g.beginPath();
  const ox = P ? (-P.x * 0.04) % gs : 0,
    oy = P ? (-P.y * 0.04) % gs : 0;
  for (let x = ox; x < W; x += gs) {
    g.moveTo(x, 0);
    g.lineTo(x, H);
  }
  for (let y = oy; y < H; y += gs) {
    g.moveTo(0, y);
    g.lineTo(W, y);
  }
  g.stroke();
}
