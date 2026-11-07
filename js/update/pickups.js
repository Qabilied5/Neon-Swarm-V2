// Orb XP, level up, pilihan kartu
function updOrbs(dt) {
  for (let i = O.length - 1; i >= 0; i--) {
    const o = O[i],
      d = Math.hypot(P.x - o.x, P.y - o.y);
    if (d < P.mag) {
      o.x += ((P.x - o.x) / d) * 420 * dt;
      o.y += ((P.y - o.y) / d) * 420 * dt;
    }
    if (d < P.r + 6) {
      O.splice(i, 1);
      P.xp += o.v;
      snd(900, 0.04, 'sine', 0.03);
      if (P.xp >= P.need) {
        P.xp -= P.need;
        P.lv++;
        P.need = Math.round(P.need * 1.35 + 2);
        cards = shuf(UP).slice(0, 3);
        if (P.lv == 2) cards[0] = pick(UP.filter((u) => u[0].startsWith('SKILL')));
        S = 'levelup';
        RG.push({ x: P.x, y: P.y, r: 0, mr: 280, c: '#ffd166', w: 7, l: 0.7, m: 0.7 });
        snd(660, 0.3, 'triangle', 0.07);
        pf(P.x, P.y, 30, '#ffd166', 300, 0.8);
      }
    }
  }
}
