// EDITOR HUD (sentuh): atur posisi & ukuran tombol (DASH, Q, E, R, ✚) serta area gerak (kiri) dan area serang (kanan).
// Dibuka lewat tombol HUD di menu / pause (S = 'hudedit'), hasil disimpan otomatis (localStorage 'ns_hud', lihat touch-layout.js).
//  - seret tombol / area = pindah  ·  tarik sudut ◢ area = ubah ukuran  ·  pilih elemen lalu − / + = perbesar / perkecil
const HE = { sel: null, id: null, mode: null, ox: 0, oy: 0, ret: 'menu', pb: null, rt: 0 };
const HE_NAME = { dash: 'TOMBOL DASH', q: 'SKILL Q', e: 'SKILL E', r: 'SKILL R', c: 'TOMBOL HEAL', move: 'AREA GERAK', aim: 'AREA SERANG' };
const HE_COL = { move: '#39ff88', aim: '#ff2e63' };

function heOpen() {
  HE.ret = S == 'pause' ? 'pause' : 'menu';
  HE.sel = HE.id = HE.mode = HE.pb = null;
  HE.rt = 0;
  S = 'hudedit';
}
function heClose() {
  hcSave();
  TUI = null;
  HE.id = HE.pb = null;
  S = HE.ret;
}

// deretan tombol panel atas (posisi px layar)
function heUI() {
  const sc = Math.min(1, (UW - SAFE.l - SAFE.r - 16) / 430),
    h = 36 * sc,
    gap = 8 * sc,
    defs = [
      ['dec', '−', 44],
      ['inc', '+', 44],
      ['show', '', 136],
      ['reset', '', 84],
      ['done', 'SELESAI', 96],
    ],
    total = defs.reduce((a, d) => a + d[2] * sc, 0) + gap * (defs.length - 1),
    y = SAFE.t + 10;
  let x = (UW - total) / 2;
  return defs.map((d) => {
    const w = d[2] * sc,
      r = { k: d[0], l: d[1], x, y, w, h, sc };
    x += w + gap;
    return r;
  });
}
const heIn = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

// pastikan tombol punya entri konfigurasi (dibuat dari posisi saat ini)
function hePin(b) {
  if (!HC.btn[b.k]) {
    const sp = TBTN.find((t) => t.k == b.k);
    HC.btn[b.k] = { x: b.x / UW, y: b.y / UH, s: +(b.r / (sp.r * tui().u)).toFixed(2) };
  }
  return HC.btn[b.k];
}

function heStart(id, x, y) {
  for (const b of heUI())
    if (heIn(b, x, y)) {
      HE.pb = { k: b.k, id }; // aksi dijalankan saat jari dilepas di tombol yang sama
      return;
    }
  if (HE.id != null) return; // satu jari seret satu elemen
  // 1) tombol
  let hit = null,
    hd = 1e9;
  for (const b of tui().btns) {
    const d = Math.hypot(b.x - x, b.y - y);
    if (d < b.r + 10 && d < hd) {
      hit = b;
      hd = d;
    }
  }
  if (hit) {
    hePin(hit);
    HE.sel = hit.k;
    HE.id = id;
    HE.mode = 'btn';
    HE.ox = hit.x - x;
    HE.oy = hit.y - y;
    return;
  }
  // 2) pegangan ubah ukuran (sudut kanan bawah area)
  for (const k of ['aim', 'move']) {
    const r = zrect(HC[k]);
    if (Math.hypot(r.x + r.w - 20 - x, r.y + r.h - 20 - y) < 24) {
      HE.sel = k;
      HE.id = id;
      HE.mode = 'size';
      HE.ox = r.x + r.w - x;
      HE.oy = r.y + r.h - y;
      return;
    }
  }
  // 3) badan area: yang sedang dipilih diutamakan, jika tidak -> area yang lebih kecil
  const c = ['aim', 'move'].filter((k) => inZone(HC[k], x, y));
  if (c.length) {
    const area = (k) => HC[k].w * HC[k].h,
      k = c.includes(HE.sel) ? HE.sel : c.sort((a, b) => area(a) - area(b))[0],
      r = zrect(HC[k]);
    HE.sel = k;
    HE.id = id;
    HE.mode = 'zone';
    HE.ox = x - r.x;
    HE.oy = y - r.y;
  } else HE.sel = null;
}

function heMove(id, x, y) {
  if (id != HE.id || !HE.sel) return;
  if (HE.mode == 'btn') {
    const hc = HC.btn[HE.sel],
      sp = TBTN.find((t) => t.k == HE.sel),
      r = sp.r * tui().u * hc.s;
    hc.x = cl(x + HE.ox, SAFE.l + r, UW - SAFE.r - r) / UW;
    hc.y = cl(y + HE.oy, r, UH - SAFE.b - r) / UH;
  } else {
    const z = HC[HE.sel];
    if (HE.mode == 'zone') {
      z.x = cl((x - HE.ox) / UW, 0, 1 - z.w);
      z.y = cl((y - HE.oy) / UH, 0, 1 - z.h);
    } else if (HE.mode == 'size') {
      z.w = cl((x + HE.ox) / UW - z.x, HC_MINW, 1 - z.x);
      z.h = cl((y + HE.oy) / UH - z.y, HC_MINH, 1 - z.y);
    }
  }
  TUI = null;
}

function heEnd(id, x, y, type) {
  if (HE.pb && HE.pb.id == id) {
    const b = heUI().find((b) => b.k == HE.pb.k);
    if (type == 'touchend' && b && heIn(b, x, y)) heAct(b.k);
    HE.pb = null;
    return;
  }
  if (id == HE.id) {
    HE.id = HE.mode = null;
    hcSave();
  }
}

function heAct(k) {
  if (k == 'done') return heClose();
  if (k == 'show') HC.show ^= 1;
  else if (k == 'reset') {
    if (HE.rt > T) {
      HC = hcDef(); // kembali ke tata letak bawaan
      HE.sel = null;
      HE.rt = 0;
    } else HE.rt = T + 2.5; // tekan sekali lagi untuk konfirmasi
  } else if ((k == 'inc' || k == 'dec') && HE.sel) {
    const f = k == 'inc' ? 1 : -1;
    if (HC[HE.sel]) {
      const z = HC[HE.sel], // area: skala dari titik tengah
        w = cl(z.w * (1 + f * 0.08), HC_MINW, 1),
        h = cl(z.h * (1 + f * 0.08), HC_MINH, 1);
      HC[HE.sel] = hcZone({ x: z.x + (z.w - w) / 2, y: z.y + (z.h - h) / 2, w, h });
    } else {
      const b = tui().btns.find((b) => b.k == HE.sel),
        hc = hePin(b);
      hc.s = +cl(hc.s + f * 0.1, HC_SMIN, HC_SMAX).toFixed(2);
    }
  }
  TUI = null;
  hcSave();
}

// garis tepi area gerak / serang (dipakai editor & opsional saat bermain)
function drawZone(k, edit) {
  const z = zrect(HC[k]),
    c = HE_COL[k],
    sel = edit && HE.sel == k;
  g.shadowBlur = 0;
  g.fillStyle = c;
  g.strokeStyle = c;
  g.globalAlpha = edit ? (sel ? 0.18 : 0.1) : 0.05;
  g.fillRect(z.x, z.y, z.w, z.h);
  g.globalAlpha = edit ? (sel ? 0.95 : 0.55) : 0.3;
  g.lineWidth = sel ? 3 : 2;
  g.setLineDash(sel ? [] : [10, 8]);
  g.strokeRect(z.x + 1, z.y + 1, z.w - 2, z.h - 2);
  g.setLineDash([]);
  const name = k == 'move' ? 'AREA GERAK' : 'AREA SERANG',
    sub = k == 'move' ? 'stik gerak + arah dash' : 'tahan = tembak · double-tap = dash';
  g.globalAlpha = edit ? 0.9 : 0.4;
  tx(name, z.x + z.w / 2, z.y + z.h / 2 - 4, cl(z.w / 12, 11, 18), c, 'center', 0);
  if (edit) {
    g.globalAlpha = 0.7;
    tx(sub, z.x + z.w / 2, z.y + z.h / 2 + 16, cl(z.w / 24, 9, 12), c, 'center', 0);
    // pegangan ubah ukuran
    const hx = z.x + z.w - 20,
      hy = z.y + z.h - 20;
    g.globalAlpha = sel ? 1 : 0.7;
    g.fillStyle = '#0a1220';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(hx, hy, 14, 0, TAU);
    g.fill();
    g.stroke();
    g.fillStyle = c;
    g.beginPath(); // segitiga sudut ◢
    g.moveTo(hx + 6, hy - 6);
    g.lineTo(hx + 6, hy + 6);
    g.lineTo(hx - 6, hy + 6);
    g.closePath();
    g.fill();
  }
  g.globalAlpha = 1;
}

function drawHudEdit() {
  if (S != 'hudedit') return;
  g.shadowBlur = 0;
  g.setLineDash([]);
  g.fillStyle = 'rgba(0,0,8,.55)';
  g.fillRect(0, 0, UW, UH);
  drawZone('move', true);
  drawZone('aim', true);
  const u = tui().u;
  for (const b of tui().btns) {
    const sel = HE.sel == b.k,
      sp = TBTN.find((t) => t.k == b.k),
      big = (b.k == 'dash' ? 13 : 20) * (b.r / (sp.r * u));
    g.globalAlpha = 0.95;
    g.fillStyle = '#0a1220';
    g.strokeStyle = b.c;
    g.lineWidth = 3;
    g.beginPath();
    g.arc(b.x, b.y, b.r, 0, TAU);
    g.fill();
    g.stroke();
    tx(b.l, b.x, b.y + big * 0.3, big, b.c, 'center', 0);
    if (sel) {
      g.strokeStyle = '#fff';
      g.lineWidth = 2;
      g.globalAlpha = 0.9;
      g.setLineDash([6, 5]);
      g.beginPath();
      g.arc(b.x, b.y, b.r + 7, 0, TAU);
      g.stroke();
      g.setLineDash([]);
    }
  }
  // panel atas
  for (const b of heUI()) {
    const on = HE.pb && HE.pb.k == b.k,
      conf = b.k == 'reset' && HE.rt > T,
      c = b.k == 'done' ? '#39ff88' : conf ? '#ff2e63' : '#22d3ee',
      l = b.k == 'show' ? 'GARIS AREA: ' + (HC.show ? 'ON' : 'OFF') : b.k == 'reset' ? (conf ? 'YAKIN?' : 'RESET') : b.l;
    g.globalAlpha = 0.95;
    g.fillStyle = on ? c + '55' : '#0a1220';
    g.strokeStyle = c;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect ? g.roundRect(b.x, b.y, b.w, b.h, 8 * b.sc) : g.rect(b.x, b.y, b.w, b.h);
    g.fill();
    g.stroke();
    tx(l, b.x + b.w / 2, b.y + b.h / 2 + 5 * b.sc, (b.l.length == 1 ? 20 : 12) * b.sc, c, 'center', 0);
  }
  const p = heUI()[0],
    s = HE.sel;
  let info = 'Pilih tombol / area untuk diatur';
  if (s) {
    const pct = HC[s] ? Math.round(HC[s].w * 100) + '% × ' + Math.round(HC[s].h * 100) + '%' : Math.round(((HC.btn[s] || { s: 1 }).s) * 100) + '%';
    info = HE_NAME[s] + '  ·  ' + pct;
  }
  g.globalAlpha = 1;
  tx(info, UW / 2, p.y + p.h + 22, 13, '#ffd166', 'center', 0);
  tx('Seret = pindah  ·  tarik ◢ = ubah ukuran area  ·  − / + = ubah ukuran yang dipilih', UW / 2, UH - SAFE.b - 8, 11, '#7aa2c0', 'center', 0);
  g.globalAlpha = 1;
}
