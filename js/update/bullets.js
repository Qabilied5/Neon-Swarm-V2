// Gerak & tabrakan peluru pemain
function updBullets(dt) {
  for (let i = B.length - 1; i >= 0; i--) {
    const b = B[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.ss && PT.length < 400) PT.push({ x: b.x, y: b.y, vx: 0, vy: 0, l: 0.25, m: 0.25, c: '#ffd166', s: 4 }); // jejak peluru super
    let dead = b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20;
    if (!dead)
      for (const e of E) {
        if (b.h.has(e)) continue;
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
          b.h.add(e);
          hit(e, b.d);
          pf(b.x, b.y, 3, e.c, 120, 0.25);
          if (b.ss) {
            RG.push({ x: b.x, y: b.y, r: 0, mr: 60, c: '#ffd166', w: 5, l: 0.3, m: 0.3 });
            pf(b.x, b.y, 16, '#ffd166', 340, 0.5);
            shake = Math.max(shake, 5);
            snd(120, 0.15, 'sawtooth', 0.06);
          }
          if (P.ch) chain(e, b.d);
          if (P.boom) boom(b.x, b.y, b.d);
          if (b.p > 0) b.p--;
          else {
            dead = true;
            break;
          }
        }
      }
    if (dead) B.splice(i, 1);
  }
}
