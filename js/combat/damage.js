// kill(), hit(), chain() petir, boom() ledakan peluru
function kill(e, i) {
  E.splice(i, 1);
  comboT = 2.2;
  combo++;
  score += Math.round(e.xp * 10 * (1 + Math.min(combo, 50) * 0.1));
  kills++;
  if (P.vamp) P.hp = Math.min(P.mh, P.hp + vampHeal());
  RG.push({ x: e.x, y: e.y, r: 0, mr: e.r * 2.8, c: e.c, w: 3, l: 0.3, m: 0.3 });
  pf(e.x, e.y, e.k == 'boss' ? 80 : 12, e.c, e.k == 'boss' ? 500 : 220, e.k == 'boss' ? 1.2 : 0.5);
  shake = Math.max(shake, e.k == 'boss' ? 20 : 3);
  snd(e.k == 'boss' ? 60 : 300 + R(0, 200), 0.1, 'triangle', 0.04);
  const n = e.k == 'boss' ? (e.sup ? 30 : e.sec ? 22 : 14) : 1;
  for (let j = 0; j < n; j++)
    O.push({
      x: e.x + R(-20, 20) * (n > 1),
      y: e.y + R(-20, 20) * (n > 1),
      v: e.k == 'boss' ? 3 : e.xp,
    });
  if (e.k == 'splitter') {
    spawn('drone', e.x - 8, e.y);
    spawn('drone', e.x + 8, e.y);
  }
  if (e.k == 'boss') {
    boss = null;
    stop = 0.18;
    score += e.sup ? 5000 : e.sec ? 3000 : 1000;
    P.hp = Math.min(P.mh, P.hp + (e.sup ? 70 : 40));
    banner(e.sup ? 'SUPER BOSS TUMBANG!' : e.sec ? 'SECRET BOSS TUMBANG!' : 'BOSS DOWN!');
    if (e.sec) {
      HZ = HZ.filter((h) => h.k != 'laser'); // hapus laser yang tersisa
      if (e.then) nextBoss = 3; // wave 15/20: lanjut ke boss berikutnya
    }
    taunt = '';
  }
}
function hit(e, d) {
  const c = Math.random() < P.crit;
  if (c) d *= 3.5;
  e.hp -= d;
  e.fl = 0.08;
  if (FT.length < 80)
    FT.push({
      x: e.x,
      y: e.y - e.r,
      t: 0.7,
      s: (c ? '★' : '') + Math.round(d),
      c: c ? '#ffd166' : '#fff',
      z: c ? 18 : 12,
    });
}
function chain(e, d) {
  let n = P.ch + 1,
    f = e;
  for (const o of E.filter((o) => o != e && Math.hypot(o.x - e.x, o.y - e.y) < 190)
    .sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))
    .slice(0, n)) {
    hit(o, d * 0.5);
    const p = [[f.x, f.y]];
    for (let i = 1; i < 4; i++)
      p.push([f.x + ((o.x - f.x) * i) / 4 + R(-14, 14), f.y + ((o.y - f.y) * i) / 4 + R(-14, 14)]);
    p.push([o.x, o.y]);
    AR.push({ p, l: 0.2 });
    f = o;
    snd(900, 0.05, 'sawtooth', 0.02);
  }
}
function boom(x, y, d) {
  RG.push({ x, y, r: 0, mr: 46, c: '#ff9f1c', w: 3, l: 0.25, m: 0.25 });
  for (const o of E) if (Math.hypot(o.x - x, o.y - y) < 46 + o.r) hit(o, d * 0.4);
}
