// Layout & klik kartu upgrade
const cl3 = () => {
  const sw = UW - SAFE.l - SAFE.r, // lebar area aman (di luar notch)
    cw = Math.min(230, (sw - 60) / 3),
    gp = 20,
    x0 = SAFE.l + (sw - (3 * cw + 2 * gp)) / 2;
  return { cw, gp, x0, ch: 170, y0: UH / 2 - 85 };
};
function cardAt(x, y) {
  const c = cl3();
  for (let i = 0; i < 3; i++) {
    const cx = c.x0 + i * (c.cw + c.gp);
    if (x >= cx && x <= cx + c.cw && y >= c.y0 && y <= c.y0 + c.ch) return i;
  }
  return -1;
}
function pickCard(i) {
  if (!cards[i]) return;
  cards[i][2]();
  S = 'play';
  snd(880, 0.15, 'triangle', 0.06);
  pf(P.x, P.y, 20, '#39ff88', 250, 0.6);
}
