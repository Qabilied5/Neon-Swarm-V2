// pf() = efek partikel
function pf(x, y, n, c, sp = 200, l = 0.5) {
  for (let i = 0; i < n && PT.length < 500; i++) {
    const a = R(0, TAU),
      v = R(0.2, 1) * sp;
    PT.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l, m: l, c, s: R(2, 4) });
  }
}
