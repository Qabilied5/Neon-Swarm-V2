// Gerak & tabrakan peluru pemain
function updBullets(dt) {
  for (let i = B.length - 1; i >= 0; i--) {
    const b = B[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    let dead = b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20;
    if (!dead)
      for (const e of E) {
        if (b.h.has(e)) continue;
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
          b.h.add(e);
          hit(e, b.d);
          pf(b.x, b.y, 3, e.c, 120, 0.25);
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
