// ENCHANT TABLE (tab ENCHANT di menu STAT, seperti enchanting table Minecraft).
// Pilih resep di daftar kanan (seperti 3 pilihan enchant) -> slot kiri terisi 3 bahan -> tekan ENCHANT:
// 1 stack tiap bahan hilang & kamu mendapat 1 EVO EFFECT (data/evo.js). Stat dihitung ulang lewat rebuild() (game/init.js).
const ENC = { sel: null, fxT: -9, fxName: '', msg: '', msgT: -9 },
  ENC_GL = '◈◇◆◉▲▽◐◑✦✧', // "bahasa enchant": simbol melayang
  UP_BY_NAME = {};
for (const u of UP) UP_BY_NAME[u[0]] = u;

const encCount = (v) => v.rec.filter((n) => (P.up[n] || 0) > 0).length, // jumlah bahan yang dimiliki (0-3)
  encCan = (v) => encCount(v) == 3,
  encReady = () => EVO.some(encCan); // ada resep siap dibuat?
// urutan daftar: siap dibuat dulu, lalu paling lengkap, lalu urutan data
const encOrder = () =>
  EVO.map((v, i) => ({ v, i, c: encCount(v) }))
    .sort((a, b) => (b.c == 3) - (a.c == 3) || b.c - a.c || a.i - b.i)
    .map((o) => o.v);
const encSel = () => EVO_BY_ID[ENC.sel] || encOrder()[0];

function encLayout() {
  const L = statLayout(),
    lw = Math.min(250, Math.floor(L.w * 0.4)),
    h = L.lb - L.ly;
  return { L, lx: L.x0, lw, rx: L.x0 + lw + 12, rw: L.w - lw - 12, y0: L.ly, y1: L.lb, rh: 56, rg: 6, s: cl(h * 0.2, 34, 48), btn: { x: L.x0, y: L.lb - 34, w: lw, h: 32 } };
}
const inR = (x, y, b, m = 0) => x >= b.x - m && x <= b.x + b.w + m && y >= b.y - m && y <= b.y + b.h + m;

// bahan tertentu -> hasilkan Evo
function encCraft(v) {
  if (!encCan(v)) {
    ENC.msg = 'Bahan belum lengkap';
    ENC.msgT = T;
    snd(150, 0.15, 'sawtooth', 0.05);
    return;
  }
  for (const n of v.rec) {
    P.up[n]--;
    if (!P.up[n]) delete P.up[n];
  }
  P.evo[v.id] = (P.evo[v.id] || 0) + 1;
  rebuild();
  if (v.id == 'aegis') P.shn = shMax();
  ENC.sel = v.id;
  ENC.fxT = T;
  ENC.fxName = v.name;
  ENC.msg = '';
  snd(330, 0.25, 'triangle', 0.07);
  snd(660, 0.35, 'sine', 0.06);
  snd(990, 0.5, 'triangle', 0.05);
}

function encTap(x, y) {
  const Y = encLayout();
  if (inR(x, y, Y.btn, 6)) return encCraft(encSel());
  if (x >= Y.rx && x <= Y.rx + Y.rw && y >= Y.y0 && y <= Y.y1) {
    const yy = y - Y.y0 + ST.sy,
      i = Math.floor(yy / (Y.rh + Y.rg));
    if (yy - i * (Y.rh + Y.rg) <= Y.rh && encOrder()[i]) {
      ENC.sel = encOrder()[i].id;
      snd(700, 0.06, 'sine', 0.03);
    }
  }
}

// pecah teks jadi maks n baris selebar w
function wrapText(s, sz, w, n) {
  const out = [];
  let ln = '';
  for (const q of s.split(' ')) {
    if (ln && lbW(ln + ' ' + q, sz) > w) {
      out.push(ln);
      ln = q;
    } else ln = ln ? ln + ' ' + q : q;
  }
  out.push(ln);
  if (out.length > n) {
    out.length = n;
    out[n - 1] = fitText(out[n - 1] + '…', sz, w);
  }
  return out;
}

function drawEnchant() {
  const Y = encLayout(),
    v = encSel(),
    can = encCan(v),
    fx = T - ENC.fxT,
    h = Y.y1 - Y.y0;

  // ====== PANEL KIRI: meja enchant ======
  g.save();
  g.beginPath();
  g.rect(Y.lx, Y.y0, Y.lw, h);
  g.clip();
  g.fillStyle = 'rgba(30,12,52,.75)';
  g.strokeStyle = '#b967ff';
  g.lineWidth = 1.5;
  rrect(Y.lx, Y.y0, Y.lw, h, 10);
  g.fill();
  g.stroke();
  // simbol enchant yang turun pelan di latar
  for (let i = 0; i < 18; i++) {
    g.globalAlpha = 0.1 + 0.1 * ((i * 7) % 3) / 2;
    tx(ENC_GL[(i + Math.floor(T * 0.6)) % ENC_GL.length], Y.lx + 10 + ((i * 47) % (Y.lw - 20)), Y.y0 + ((T * 16 + i * 41) % h), 12, '#b967ff', 'center', 0);
  }
  g.globalAlpha = 1;

  // 3 slot bahan + hasil
  const pad = 8,
    s = Y.s,
    pitch = (Y.lw - pad * 2 - s) / 3,
    sy = Y.y0 + pad + 2;
  for (let i = 0; i < 4; i++) {
    const x = Y.lx + pad + i * pitch,
      res = i == 3,
      nm = res ? null : v.rec[i],
      own = res ? can : (P.up[nm] || 0) > 0,
      c = res ? '#ffd166' : own ? '#39ff88' : '#ff2e63';
    g.shadowColor = c;
    g.shadowBlur = res && can ? 10 + 6 * Math.sin(T * 5) : 0;
    g.fillStyle = 'rgba(10,18,32,.9)';
    g.strokeStyle = c;
    g.lineWidth = res ? 2 : 1.5;
    rrect(x, sy, s, s, 7);
    g.fill();
    g.stroke();
    g.shadowBlur = 0;
    g.globalAlpha = own ? 1 : 0.35;
    drawIcon(res ? v.icon : UP_BY_NAME[nm][3], x + s / 2, sy + s / 2, s * 0.78, res ? '#ffd166' : '#22d3ee', res && can ? 10 : 0);
    g.globalAlpha = 1;
    if (!res && own) tx('x' + P.up[nm], x + s - 3, sy + s - 4, 10, '#39ff88', 'right', 0);
    if (i < 3) tx(i < 2 ? '+' : '▶', x + s + (pitch - s) / 2, sy + s / 2 + 5, 13, '#7aa2c0', 'center', 0);
  }

  // nama + deskripsi + daftar bahan
  let y = sy + s + 18;
  tx(fitText(v.name, 13, Y.lw - 16), Y.lx + 8, y, 13, '#ffd166', 'left', 6);
  for (const l of wrapText(v.desc, 11, Y.lw - 16, 2)) {
    y += 13;
    tx(l, Y.lx + 8, y, 11, '#cfe3f2', 'left', 0);
  }
  y += 4;
  for (const n of v.rec) {
    y += 13;
    if (y > Y.btn.y - 4) break;
    const k = P.up[n] || 0;
    tx(fitText((k ? '✓ ' : '✗ ') + n + (k ? '  x' + k : ''), 11, Y.lw - 16), Y.lx + 8, y, 11, k ? '#39ff88' : '#ff6b8a', 'left', 0);
  }

  // tombol ENCHANT
  const b = Y.btn,
    bc = can ? '#39ff88' : '#4a5d72';
  g.shadowColor = bc;
  g.shadowBlur = can ? 10 + 4 * Math.sin(T * 5) : 0;
  g.fillStyle = can ? 'rgba(57,255,136,.18)' : 'rgba(10,18,32,.85)';
  g.strokeStyle = bc;
  g.lineWidth = 2;
  rrect(b.x, b.y, b.w, b.h, b.h / 2);
  g.fill();
  g.stroke();
  g.shadowBlur = 0;
  tx(can ? '✦ ENCHANT ✦' : 'BAHAN KURANG', b.x + b.w / 2, b.y + b.h / 2 + 5, 14, bc, 'center', 0);
  if (T - ENC.msgT < 1.5) tx(ENC.msg, Y.lx + Y.lw / 2, b.y - 6, 11, '#ff6b8a', 'center', 0);

  // animasi berhasil: cincin & simbol naik dari slot hasil
  if (fx < 1.6) {
    const a = 1 - fx / 1.6,
      cx = Y.lx + pad + 3 * pitch + s / 2,
      cy = sy + s / 2;
    g.globalAlpha = a;
    g.strokeStyle = '#ffd166';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(cx, cy, 10 + fx * 90, 0, TAU);
    g.stroke();
    for (let i = 0; i < 14; i++) tx(ENC_GL[i % ENC_GL.length], Y.lx + 14 + ((i * 53) % (Y.lw - 28)), Y.y1 - fx * 160 - ((i * 29) % 40), 14, i % 2 ? '#ffd166' : '#b967ff', 'center', 6);
    tx('✦ ' + ENC.fxName + ' ✦', Y.lx + Y.lw / 2, Y.y0 + h * 0.62, 14, '#fff', 'center', 12);
    g.globalAlpha = 1;
  }
  g.restore();

  // ====== PANEL KANAN: daftar resep ======
  const list = encOrder(),
    total = list.length * (Y.rh + Y.rg) - Y.rg;
  ST.max = Math.max(0, total - h);
  ST.sy = cl(ST.sy, 0, ST.max);
  g.save();
  g.beginPath();
  g.rect(Y.rx - 4, Y.y0, Y.rw + 8, h);
  g.clip();
  list.forEach((r, i) => {
    const ry = Y.y0 + i * (Y.rh + Y.rg) - ST.sy;
    if (ry + Y.rh < Y.y0 || ry > Y.y1) return;
    const ok = encCan(r),
      sel = r.id == v.id,
      c = sel ? '#ffd166' : ok ? '#39ff88' : '#2a4a66';
    g.shadowBlur = 0;
    g.fillStyle = sel ? 'rgba(60,44,10,.8)' : 'rgba(10,18,32,.9)';
    g.strokeStyle = c;
    g.lineWidth = sel ? 2 : 1.5;
    rrect(Y.rx, ry, Y.rw, Y.rh, 8);
    g.fill();
    g.stroke();
    g.globalAlpha = ok || sel ? 1 : 0.55;
    drawIcon(r.icon, Y.rx + 30, ry + Y.rh / 2, 40, '#ffd166', ok ? 8 : 0);
    tx(fitText(r.name, 13, Y.rw - 150), Y.rx + 58, ry + 21, 13, ok ? '#ffd166' : '#cfe3f2', 'left', 0);
    r.rec.forEach((n, j) => {
      g.globalAlpha = (P.up[n] || 0) > 0 ? 1 : 0.25;
      drawIcon(UP_BY_NAME[n][3], Y.rx + 70 + j * 26, ry + 40, 20, '#22d3ee', 0);
    });
    g.globalAlpha = 1;
    // status di kanan: SIAP / jumlah bahan, + stack evo yang sudah dimiliki
    const cnt = encCount(r);
    tx(ok ? 'SIAP' : cnt + '/3', Y.rx + Y.rw - 10, ry + 21, 12, ok ? '#39ff88' : '#7aa2c0', 'right', ok ? 6 : 0);
    if (P.evo[r.id]) tx('dimiliki x' + P.evo[r.id], Y.rx + Y.rw - 10, ry + 42, 10, '#ffd166', 'right', 0);
  });
  g.restore();
  if (ST.max > 0) {
    const bh = Math.max(24, (h * h) / total),
      by = Y.y0 + (ST.sy / ST.max) * (h - bh);
    g.fillStyle = 'rgba(122,162,192,.55)';
    rrect(UW - SAFE.r - 8, by, 3, bh, 2);
    g.fill();
  }
}
