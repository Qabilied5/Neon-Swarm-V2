// MODE TUTORIAL: game dimainkan seperti biasa (musuh muncul terus, pemain tidak bisa mati, wave tidak naik),
// dengan panduan langkah demi langkah di atas layar:
//   1. DASH double-tap        (HP: ketuk 2x cepat di area serang kanan; desktop: SPACE / klik kanan)
//   2. KEBAL saat dash        (efek perisai + "KEBAL!" saat serangan musuh tertahan oleh dash)
//   3-5. SKILL Q / E / R      (HP: tahan tombol, GESER jari untuk membidik, lepas untuk menembak)
// Dimulai dari tombol TUTORIAL di menu (render/screens.js). Kaitan ke game: dash(), hurt(), nova/laser/hole(), castSkill(),
// double-tap dash (input/touch.js), updWaves() (wave dibekukan), init() (mematikan mode).
const TUT = { on: 0, step: 0, adv: 0, dbl: 0, man: 0, immuneT: 0, lastB: 0, nudge: 0, spawnT: 0 };
const TUT_STEPS = [
  { k: 'dash', c: '#ffd166', title: 'DASH · DOUBLE TAP' },
  { k: 'immune', c: '#22d3ee', title: 'KEBAL SAAT DASH' },
  { k: 'q', c: '#22d3ee', title: 'SKILL Q · NOVA' },
  { k: 'e', c: '#ff2e63', title: 'SKILL E · LASER' },
  { k: 'r', c: '#b967ff', title: 'SKILL R · BLACK HOLE' },
];
const TUT_END = TUT_STEPS.length; // step == TUT_END -> tutorial selesai
function tutText(i) {
  const m = TOUCH;
  return [
    [
      m ? 'Ketuk 2x cepat di area kanan layar' : 'Tekan SPACE atau klik kanan',
      m ? 'Arah dash = arah stik kiri yang sedang ditahan' : 'Arah dash = arah tombol WASD yang ditekan',
    ],
    ['Selama dash kamu KEBAL: serangan musuh tidak melukai', 'Dash menembus musuh yang mendekat!'],
    [
      m ? 'Tahan tombol Q, GESER jari, lalu lepas' : 'Arahkan mouse ke target, lalu tekan Q',
      'Nova meledak di titik bidik, melukai & mendorong musuh',
    ],
    [
      m ? 'Tahan tombol E, GESER jari, lalu lepas' : 'Arahkan mouse ke target, lalu tekan E',
      'Laser menembus semua musuh di sepanjang garis bidik',
    ],
    [
      m ? 'Tahan tombol R, GESER jari, lalu lepas' : 'Arahkan mouse ke target, lalu tekan R',
      'Black Hole menyedot musuh ke titik bidik',
    ],
  ][i];
}

// ---------- alur ----------
function tutStart() {
  init(); // reset game (init() mematikan TUT.on, dinyalakan lagi di bawah)
  TUT.on = 1;
  TUT.dbl = TUT.man = TUT.immuneT = TUT.lastB = TUT.nudge = 0;
  P.sk.q = P.sk.e = P.sk.r = 1; // semua skill terbuka untuk latihan
  P.need = 1e9; // tanpa level-up (kartu upgrade akan memutus panduan)
  LB.snap = [];
  LB.idx = 0; // tanpa notif "mengalahkan skor"
  tutGo(0);
  msgT = 0; // sembunyikan banner 'WAVE 1' bawaan init()
}
function tutGo(i) {
  TUT.step = i;
  TUT.adv = 0;
  TUT.spawnT = 0;
  if (i == 1) tutSpawnNear(4); // musuh dekat pemain agar efek kebal langsung bisa dicoba
}
function tutDone() {
  if (!TUT.on || TUT.adv > 0 || TUT.step >= TUT_END) return;
  TUT.adv = 1.2; // tampilkan centang sebentar, lalu lanjut
  snd(880, 0.15, 'triangle', 0.06);
  pf(P.x, P.y, 20, TUT_STEPS[TUT.step].c, 250, 0.6);
}
function tutExit() {
  TUT.on = 0;
  JS.on = AIM.on = SK.on = 0;
  S = 'menu';
}
function tutSpawnNear(n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU,
      d = R(120, 180);
    spawn('drone', cl(P.x + Math.cos(a) * d, 20, W - 20), cl(P.y + Math.sin(a) * d, 20, H - 20), 1);
  }
}
function tutUpd(dt) {
  if (!TUT.on || S != 'play') return;
  if (TUT.adv > 0 && (TUT.adv -= dt) <= 0) tutGo(TUT.step + 1);
  if (TUT.step == 1 && !TUT.adv && (TUT.spawnT -= dt) <= 0) {
    TUT.spawnT = 3; // pastikan selalu ada musuh dekat selama langkah KEBAL
    const near = E.filter((e) => Math.hypot(e.x - P.x, e.y - P.y) < 300).length;
    if (near < 3) tutSpawnNear(3 - near);
  }
}

// ---------- kaitan dari game ----------
function tutDash() {
  TUT.immuneT = T + 0.3; // sama dengan P.inv yang diberikan dash()
  if (TUT.step == 0 && (!TOUCH || TUT.dbl)) tutDone();
  else if (TUT.step == 0) TUT.nudge = T + 2.5; // HP: dash lewat tombol DASH, bukan double-tap
  TUT.dbl = 0;
}
// hurt() menolak serangan karena P.inv > 0; hanya yang terjadi saat kebal dash yang ditampilkan
function tutBlocked() {
  if (T > TUT.immuneT || T - TUT.lastB < 0.3) return;
  TUT.lastB = T;
  FT.push({ x: P.x, y: P.y - P.r - 14, t: 0.9, s: 'KEBAL!', c: '#22d3ee', z: 18 });
  pf(P.x, P.y, 14, '#22d3ee', 260, 0.45);
  RG.push({ x: P.x, y: P.y, r: 0, mr: 50, c: '#22d3ee', w: 4, l: 0.3, m: 0.3 });
  if (TUT.step == 1) tutDone();
}
function tutSkill(k) {
  P.cd[k] = Math.min(P.cd[k], 1.5); // cooldown singkat supaya bisa berlatih
  const ok = !TOUCH || TUT.man;
  TUT.man = 0;
  if (TUT.step == 2 + 'qer'.indexOf(k)) {
    if (ok) tutDone();
    else TUT.nudge = T + 2.5; // HP: dilepas tanpa digeser
  }
}

// ---------- tampilan ----------
function tutLayout() {
  const sw = UW - SAFE.l - SAFE.r,
    cx = SAFE.l + sw / 2,
    pw = Math.min(520, sw * 0.54),
    ph = cl(UH * 0.2, 66, 84),
    py = Math.max(SAFE.t, 0) + 38,
    end = TUT.step >= TUT_END,
    bw = cl(pw * 0.3, 90, 130),
    bh = end ? 36 : 26,
    by = py + ph + 8,
    keys = end ? ['play', 'menu'] : ['skip']; // KELUAR ada di menu pause (agar tidak terpencet saat bermain)
  return {
    cx, pw, ph, py, end,
    px: cx - pw / 2,
    btns: keys.map((k, i) => ({ k, x: keys.length == 1 ? cx - bw / 2 : cx + (i ? 6 : -bw - 6), y: by, w: bw, h: bh })),
  };
}
function tutBtnAt(x, y) {
  if (!TUT.on || S != 'play') return null;
  const b = tutLayout().btns.find((b) => x >= b.x - 6 && x <= b.x + b.w + 6 && y >= b.y - 6 && y <= b.y + b.h + 6);
  return b ? b.k : null;
}
function tutAct(k) {
  if (k == 'skip') {
    if (TUT.step < TUT_END) tutGo(TUT.step + 1);
  } else if (k == 'exit' || k == 'menu') tutExit();
  else if (k == 'play') init(); // tutorial selesai -> main sungguhan
}
const fitSz = (s, sz, w) => {
  while (sz > 9 && lbW(s, sz) > w) sz--;
  return sz;
};
function drawTutorial() {
  if (!TUT.on || (S != 'play' && S != 'pause')) return;
  const L = tutLayout(),
    u = tui().u,
    st = TUT_STEPS[Math.min(TUT.step, TUT_END - 1)],
    done = TUT.adv > 0,
    c = L.end ? '#39ff88' : st.c;

  // efek KEBAL: perisai heksagon di sekeliling pemain selama dash (posisi dunia -> layar = x * ZM)
  if (T < TUT.immuneT) {
    const k = 1 - (TUT.immuneT - T) / 0.3,
      sx = P.x * ZM,
      sy = P.y * ZM,
      r = (24 + k * 10) * u;
    g.globalAlpha = 0.9 - k * 0.5;
    g.shadowColor = '#22d3ee';
    g.shadowBlur = 14;
    g.strokeStyle = '#22d3ee';
    g.fillStyle = 'rgba(34,211,238,.16)';
    g.lineWidth = 3;
    poly(sx, sy, r, 6, T * 5);
    g.fill();
    g.stroke();
    g.shadowBlur = 0;
    tx('KEBAL', sx, sy - r - 8, 12, '#22d3ee', 'center', 6);
    g.globalAlpha = 1;
  }

  // sorot tombol skill yang sedang dilatih + peragaan jari (HP)
  if (TOUCH && !L.end && TUT.step >= 2 && !done) tutGhostSkill(st, u);
  if (TOUCH && !L.end && TUT.step == 0 && !done) tutGhostTap(u);

  // panel panduan
  const { px, py, pw, ph } = L;
  g.shadowColor = c;
  g.shadowBlur = 12;
  g.fillStyle = 'rgba(6,12,24,.88)';
  g.strokeStyle = c;
  g.lineWidth = 2;
  rrect(px, py, pw, ph, 12);
  g.fill();
  g.stroke();
  g.shadowBlur = 0;
  const bx = px + 28,
    by = py + ph / 2;
  g.fillStyle = c;
  g.beginPath();
  g.arc(bx, by, 15, 0, TAU);
  g.fill();
  tx(L.end || done ? '✓' : String(TUT.step + 1), bx, by + 6, 17, '#04060d', 'center', 0);
  const tw = pw - 56 - (TOUCH ? 24 : 78),
    lx = px + 54;
  let t1, t2;
  if (L.end) [t1, t2] = ['TUTORIAL SELESAI', 'Kamu siap bertempur!'];
  else if (done) [t1, t2] = ['BAGUS!', ''];
  else {
    [t1, t2] = tutText(TUT.step);
    if (T < TUT.nudge) t2 = TOUCH && TUT.step == 0 ? 'Gunakan DOUBLE-TAP di area kanan, bukan tombol DASH' : 'Geser jari dulu sebelum dilepas';
  }
  const ttl = L.end || done ? t1 : TUT.step == 0 && !TOUCH ? 'DASH' : st.title;
  tx(ttl, lx, py + 22, fitSz(ttl, 15, tw), c, 'left', 0);
  if (!L.end && !done) tx(t1, lx, py + 41, fitSz(t1, 12, tw), '#e8f4ff', 'left', 0);
  else tx(t2, lx, py + 41, fitSz(t2, 12, tw), '#e8f4ff', 'left', 0);
  if (!L.end && !done) tx(t2, lx, py + 58, fitSz(t2, 11, tw), T < TUT.nudge ? '#ffd166' : '#7aa2c0', 'left', 0);
  // keycap (desktop)
  if (!TOUCH && !L.end && !done) {
    const kc = TUT.step == 0 ? 'SPACE' : st.k.toUpperCase(),
      kw = TUT.step == 0 ? 56 : 32,
      kx = px + pw - 14 - kw,
      ky = py + ph / 2 - 16;
    g.strokeStyle = c;
    g.fillStyle = 'rgba(255,255,255,.07)';
    g.lineWidth = 2;
    rrect(kx, ky, kw, 32, 6);
    g.fill();
    g.stroke();
    tx(kc, kx + kw / 2, ky + 21, TUT.step == 0 ? 12 : 16, c, 'center', 0);
  }
  // titik progres
  for (let i = 0; i < TUT_END; i++) {
    g.fillStyle = i < TUT.step || L.end ? '#39ff88' : i == TUT.step ? c : '#1d3a55';
    g.beginPath();
    g.arc(px + pw - 16 - (TUT_END - 1 - i) * 11, py + 14, 3, 0, TAU);
    g.fill();
  }
  // tombol: LEWATI (saat latihan) atau MAIN / MENU (setelah selesai)
  for (const b of L.btns) {
    const col = b.k == 'play' ? '#39ff88' : b.k == 'exit' ? '#ff2e63' : b.k == 'menu' ? '#7aa2c0' : '#7aa2c0',
      hot = !TOUCH && tutBtnAt(MU.x, MU.y) == b.k;
    g.shadowColor = col;
    g.shadowBlur = hot ? 12 : 0;
    g.fillStyle = hot ? col + '33' : 'rgba(10,18,32,.85)';
    g.strokeStyle = col;
    g.lineWidth = 1.5;
    rrect(b.x, b.y, b.w, b.h, b.h / 2);
    g.fill();
    g.stroke();
    g.shadowBlur = 0;
    tx({ skip: 'LEWATI', exit: 'KELUAR', play: 'MAIN', menu: 'MENU' }[b.k], b.x + b.w / 2, b.y + b.h / 2 + 4, b.h > 30 ? 14 : 11, col, 'center', 0);
  }
}
// peragaan double-tap: dua ketukan cepat berulang di tengah area serang
function tutGhostTap(u) {
  const z = zrect(HC.aim),
    x = z.x + z.w * 0.5,
    y = z.y + z.h * 0.46,
    p = T % 2.4;
  for (const t0 of [0.2, 0.5]) {
    const a = p - t0;
    if (a >= 0 && a < 0.55) {
      g.globalAlpha = 1 - a / 0.55;
      g.strokeStyle = '#ffd166';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(x, y, (14 + (a / 0.55) * 34) * u, 0, TAU);
      g.stroke();
    }
  }
  if (p < 1.3) {
    const press = Math.abs(p - 0.2) < 0.1 || Math.abs(p - 0.5) < 0.1;
    g.globalAlpha = 0.85;
    g.fillStyle = 'rgba(255,255,255,.22)';
    g.strokeStyle = '#fff';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x, y, 16 * u * (press ? 0.82 : 1), 0, TAU);
    g.fill();
    g.stroke();
    tx('2×', x, y - 30 * u, 16, '#ffd166', 'center', 8);
  }
  g.globalAlpha = 0.8;
  tx('DOUBLE TAP', x, y + 44 * u, 11, '#ffd166', 'center', 0);
  g.globalAlpha = 1;
}
// peragaan skill: jari menekan tombol, menggeser keluar, lalu melepas; tombol aslinya disorot
function tutGhostSkill(st, u) {
  const b = tui().btns.find((b) => b.k == st.k);
  if (!b) return;
  const a = tui().atk,
    dx = UW * 0.5 - b.x,
    dy = UH * 0.32 - b.y,
    m = Math.hypot(dx, dy) || 1,
    ux = dx / m,
    uy = dy / m,
    len = a.aimR * 1.25,
    p = T % 3;
  // sorot tombol asli (skill biasanya hanya 10% opacity)
  g.globalAlpha = 0.9;
  g.strokeStyle = st.c;
  g.shadowColor = st.c;
  g.shadowBlur = 12;
  g.lineWidth = 3;
  g.beginPath();
  g.arc(b.x, b.y, b.r + 7 + 3 * Math.sin(T * 6), 0, TAU);
  g.stroke();
  g.shadowBlur = 0;
  if (p < 2.2) {
    const f = p < 0.5 ? 0 : Math.min(1, (p - 0.5) / 1.2),
      e = 1 - (1 - f) * (1 - f),
      fx = b.x + ux * len * e,
      fy = b.y + uy * len * e;
    g.globalAlpha = 0.55;
    g.setLineDash([6, 6]);
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(b.x, b.y);
    g.lineTo(fx, fy);
    g.stroke();
    g.setLineDash([]);
    g.globalAlpha = 0.9;
    g.fillStyle = 'rgba(255,255,255,.25)';
    g.strokeStyle = '#fff';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(fx, fy, 15 * u * (p < 0.5 ? 0.85 : 1), 0, TAU);
    g.fill();
    g.stroke();
    if (p > 1.7) {
      // lepas: denyut kecil
      g.globalAlpha = 1 - (p - 1.7) / 0.5;
      g.strokeStyle = st.c;
      g.beginPath();
      g.arc(fx, fy, (15 + (p - 1.7) * 60) * u, 0, TAU);
      g.stroke();
    }
  }
  g.globalAlpha = 0.85;
  tx('TAHAN · GESER · LEPAS', b.x - 10 * u, b.y - b.r - 22 * u, 11, st.c, 'right', 0);
  g.globalAlpha = 1;
}
