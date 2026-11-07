// Game loop - HARUS dimuat paling akhir
let last = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  const dt = Math.min((ts - last) / 1000 || 0, 0.033);
  last = ts;
  T += dt;
  if (deadT > 0) deadT -= dt;
  if (PORTRAIT && S == 'play') S = 'pause'; // HP tegak: pause sampai diputar ke landscape
  syncInstallBtn();
  if (S == 'play') upd(stop > 0 ? ((stop -= dt), dt * 0.15) : dt);
  else if (S == 'dead') {
    for (let i = PT.length - 1; i >= 0; i--) {
      const p = PT[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if ((p.l -= dt) <= 0) PT.splice(i, 1);
    }
    shake *= 0.9;
  }
  draw();
}
requestAnimationFrame(loop);
