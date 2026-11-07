// Input sentuh: sisi kiri layar = stik gerak (melayang, tanpa UI), sisi kanan layar = serang bebas (tahan + geser untuk bidik, TANPA auto aim)
// + dash & skill. Skill Q/E/R: tahan -> geser untuk membidik -> lepas untuk menembakkan.
// DASH ANALOG: double-tap di sisi kiri layar, tap kedua ditahan -> muncul stik analog dengan jangkauan TETAP; geser ke arah mana saja (360°), lepas = dash.
// FLICK DASH: saat stik gerak ditahan, geser jari dengan CEPAT & mendadak (hentakan) -> dash ke arah hentakan, tanpa melepas jari.
// AIM ASSIST: musuh di dalam lingkaran bidik -> peluru diarahkan tepat ke musuh (dengan prediksi gerak).
const TPR = {}; // waktu efek "ditekan" per tombol

// DASH ANALOG (double-tap sisi kiri): tap 1 singkat -> tap 2 ditahan + geser = arahkan dash -> lepas = dash.
// Sisi kiri tetap tanpa UI; pratinjau arah hanya digambar di dunia game (render/aim.js) selama ditahan.
const DASH_GAP = 300, // ms maks antar dua tap
  DASH_DIST = 90, // px maks jarak antar dua tap
  DASH_DEAD = 0.18, // deadzone stik dash (pecahan radius): di bawah ini = arah bawaan (arah gerak terakhir)
  DASH_MOVE = 6, // px: jari harus bergeser sejauh ini dari titik sentuh sebelum dianggap membidik
  DASH_TAP_MS = 220, // tap pertama harus lebih singkat dari ini
  DASH_TAP_MOVE = 20; // ...dan tidak bergeser lebih dari ini (px)
const DA = { on: 0, id: null, ox: 0, oy: 0, cx: 0, cy: 0, kx: 0, ky: 0, x: 1, y: 0, man: 0, mv: 0 }; // ox,oy = titik sentuh; cx,cy = pusat cincin (ditahan di dalam layar); kx,ky = offset knob; x,y = arah (vektor satuan); man = 1 jika knob keluar deadzone
const LT = { t: 0, x: 0, y: 0 }; // tap singkat terakhir di sisi kiri (waktu, posisi)
const LM = { x: 0, y: 0 }; // arah gerak terakhir pemain (vektor satuan) = arah dash bawaan jika stik tidak digeser

// FLICK DASH: hentakan cepat jari pada stik gerak
const FLICK_WIN = 100, // ms: jendela waktu untuk mengukur kecepatan geser
  FLICK_DIST = 30, // px: jarak minimum geser dalam jendela itu
  FLICK_SPD = 600, // px/detik: kecepatan minimum agar dihitung hentakan (geser biasa jauh lebih lambat)
  FLICK_LOCK = 350; // ms: jeda antar flick dash
const JH = []; // riwayat posisi jari stik gerak {t,x,y}
let flickT = 0;
function flickCheck(x, y) {
  const now = performance.now();
  JH.push({ t: now, x, y });
  while (JH.length && now - JH[0].t > FLICK_WIN) JH.shift();
  if (JH.length < 2 || now - flickT < FLICK_LOCK || S != 'play' || !P || P.dc > 0 || P.dash > 0) return;
  const a = JH[0],
    dx = x - a.x,
    dy = y - a.y,
    d = Math.hypot(dx, dy),
    dt = Math.max(now - a.t, 16);
  if (d >= FLICK_DIST && (d / dt) * 1000 >= FLICK_SPD) {
    flickT = now;
    JH.length = 0;
    dash(Math.atan2(dy, dx)); // arah = arah hentakan jari
  }
}

const dashR = () => 64 * tui().u; // radius stik dash (px layar) = jangkauan tetap

function dashAimFrom(x, y) {
  const R = dashR();
  if (Math.hypot(x - DA.ox, y - DA.oy) >= DASH_MOVE) DA.mv = 1; // cincin yang digeser agar muat di layar tidak dihitung sebagai geseran jari
  const dx = x - DA.cx,
    dy = y - DA.cy,
    m = Math.hypot(dx, dy) || 1,
    k = Math.min(m, R) / m;
  DA.kx = dx * k;
  DA.ky = dy * k;
  DA.man = DA.mv && m >= R * DASH_DEAD ? 1 : 0;
  if (DA.man) {
    DA.x = dx / m; // analog penuh: sudut mengikuti jari tanpa dibulatkan
    DA.y = dy / m;
  } else DA.kx = DA.ky = 0;
}
// sudut dash: arah knob; jika tidak digeser -> arah gerak terakhir, lalu arah hadap
const dashAimAngle = () => (DA.man ? Math.atan2(DA.y, DA.x) : LM.x || LM.y ? Math.atan2(LM.y, LM.x) : P.a);

// jarak bidik maksimum (satuan dunia) untuk skill yang menargetkan titik
const SK_RANGE = { q: 230, r: 380 };
const SK_AIMABLE = { q: 1, e: 1, r: 1 };

// BIDIK SERANGAN DASAR: tahan di mana saja di sisi kanan layar -> muncul lingkaran bidik (reticle) di dunia game.
// Geser jari = lingkaran ikut bergerak (relatif, bisa ke mana saja di layar). Pemain menembak ke arah lingkaran.
// Posisi lingkaran disimpan sebagai offset (AIM.ox, AIM.oy) dari pemain, jadi ikut bergerak bersama pemain.
const AIM_GAIN = 2.2; // 1 satuan geser jari = 2.2 satuan gerak lingkaran (jangkauan luas tanpa harus geser jauh)
const AIM_START = 200; // jarak awal lingkaran dari pemain saat tombol pertama ditahan

// mulai bidik: lingkaran muncul di arah bidik terakhir
function aimStart(x, y) {
  const d = AIM.dist || AIM_START;
  AIM.ox = Math.cos(P.a) * d;
  AIM.oy = Math.sin(P.a) * d;
  AIM.lx = x;
  AIM.ly = y;
  AIM.man = 1;
  AIM.kx = AIM.ky = 0;
  aimSync();
}

// geser jari -> geser lingkaran (tanpa batas jangkauan, hanya dibatasi tepi layar)
function aimFrom(x, y) {
  AIM.ox += ((x - AIM.lx) * AIM_GAIN) / ZM; // jari bergerak px layar -> /ZM ke satuan dunia (rasa geser tetap sama di zoom berapa pun)
  AIM.oy += ((y - AIM.ly) * AIM_GAIN) / ZM;
  AIM.lx = x;
  AIM.ly = y;
  aimSync();
}

// jaga lingkaran tetap di dalam layar + hitung arah tembak. Dipanggil juga tiap frame (pemain bergerak).
function aimSync() {
  const m = 14; // margin dari tepi layar
  AIM.ox = cl(P.x + AIM.ox, m, W - m) - P.x;
  AIM.oy = cl(P.y + AIM.oy, m, H - m) - P.y;
  const d = Math.hypot(AIM.ox, AIM.oy);
  if (d > 6) {
    // terlalu dekat pemain = arah dipertahankan
    AIM.x = AIM.ox / d;
    AIM.y = AIM.oy / d;
    AIM.dist = d;
  }
}

// AIM ASSIST: radius lingkaran bidik (satuan dunia) - harus sama dengan yang digambar render/aim.js
const reticleR = () => 20 * tui().u * ZK;
const LEAD_MAX = 0.6; // detik: batas prediksi gerak musuh
// Cari musuh di dalam lingkaran bidik (terdekat ke pusat lingkaran) dan hitung sudut tembak tepat ke musuh itu.
// Dipanggil tiap frame selama tombol serang ditahan. Mengembalikan { e, a } atau null.
function aimAssist(dt) {
  const rx = P.x + AIM.ox,
    ry = P.y + AIM.oy,
    rr = reticleR();
  let best = null,
    bd = 1e9;
  for (const e of E) {
    // kecepatan musuh dari selisih posisi antar frame (dihaluskan; lonjakan = teleport/dash singkat diabaikan)
    if (e.ax != null && dt > 0) {
      let vx = (e.x - e.ax) / dt,
        vy = (e.y - e.ay) / dt;
      if (Math.hypot(vx, vy) > 900) vx = vy = 0;
      e.avx = (e.avx || 0) * 0.5 + vx * 0.5;
      e.avy = (e.avy || 0) * 0.5 + vy * 0.5;
    }
    e.ax = e.x;
    e.ay = e.y;
    if (e.hp <= 0) continue;
    const d = Math.hypot(e.x - rx, e.y - ry); // musuh dianggap "di dalam" jika tubuhnya menyentuh lingkaran
    if (d < rr + e.r && d < bd) {
      bd = d;
      best = e;
    }
  }
  if (!best) return null;
  // prediksi titik temu peluru (kecepatan 640): iterasi kecil
  const vx = best.avx || 0,
    vy = best.avy || 0;
  let tx_ = best.x,
    ty_ = best.y;
  for (let i = 0; i < 3; i++) {
    const tt = Math.min(Math.hypot(tx_ - P.x, ty_ - P.y) / BUL_SPD, LEAD_MAX);
    tx_ = best.x + vx * tt;
    ty_ = best.y + vy * tt;
  }
  return { e: best, a: Math.atan2(ty_ - P.y, tx_ - P.x) };
}

// set arah/jarak bidik skill dari posisi jari relatif pusat tombol skill
function skAimFrom(x, y) {
  const b = tui().btns.find((b) => b.k == SK.k);
  if (!b) return;
  const a = tui().atk,
    dx = x - b.x,
    dy = y - b.y,
    m = Math.hypot(dx, dy) || 1,
    rr = a.aimR; // radius geser = sama dengan tombol serang
  SK.man = m >= a.dead ? 1 : 0;
  if (SK.man) {
    SK.x = dx / m;
    SK.y = dy / m;
  }
  SK.d = SK.man ? Math.min(m, rr) / rr : 0;
  const k = Math.min(m, rr) / m;
  SK.kx = dx * k;
  SK.ky = dy * k;
}

// hitung sasaran bidik skill k: arah (a), titik target (x,y), dan apakah digeser manual
function skTarget(k) {
  const man = SK.on && SK.k == k ? SK.man : 0,
    ax = man ? SK.x : Math.cos(P.a),
    ay = man ? SK.y : Math.sin(P.a),
    d = man ? SK.d : 0,
    rg = k == 'r' ? SK_RANGE.r * Math.max(d, 0.25) : SK_RANGE.q * d, // tap tanpa geser: R jatuh di depan pemain, Q di pemain
    dist = man ? rg : k == 'r' ? 220 : 0;
  return { man, a: Math.atan2(ay, ax), x: cl(P.x + ax * dist, 0, W), y: cl(P.y + ay * dist, 0, H) };
}

// jalankan skill dengan bidikan (dipanggil saat jari dilepas)
function castSkill(k) {
  const t = skTarget(k);
  if (k == 'q') {
    if (t.man) nova(t.x, t.y);
    else nova();
  } else if (k == 'e') laser(t.a);
  else if (k == 'r') hole(t.x, t.y);
}

addEventListener(
  'touchstart',
  (e) => {
    if (e.target && e.target.closest && e.target.closest('#install')) return; // biarkan tombol install bekerja
    e.preventDefault();
    TOUCH = true;
    if (PORTRAIT) return;
    for (const t of e.changedTouches) {
      const x = t.clientX,
        y = t.clientY; // koordinat layar asli (ruang UI)
      if (uiHit(x, y)) continue;
      if (S == 'menu' || S == 'dead') {
        if (deadT <= 0) init();
        continue;
      }
      if (S == 'levelup') {
        const i = cardAt(x, y);
        if (i >= 0) pickCard(i);
        continue;
      }
      if (S == 'pause') {
        S = 'play';
        continue;
      }
      const U = tui(),
        b = vbtns().find((b) => Math.hypot(b.x - x, b.y - y) < b.r + 10); // skill terkunci tidak ditampilkan & tidak bisa disentuh
      if (b) {
        if (SK_AIMABLE[b.k] && !SK.on) {
          // skill berbidik: ditembakkan saat dilepas
          SK.on = 1;
          SK.id = t.identifier;
          SK.k = b.k;
          SK.man = 0;
          SK.d = 0;
          SK.kx = SK.ky = 0;
          TPR[b.k] = T + 0.14;
        } else if (!SK_AIMABLE[b.k]) {
          b.f();
          TPR[b.k] = T + 0.14;
        }
        continue;
      }
      if (!AIM.on && x >= UW * 0.5) {
        // seluruh sisi kanan layar = area serang bebas (tahan + geser)
        AIM.on = 1;
        AIM.id = t.identifier;
        aimStart(x, y);
        continue;
      }
      if (x < UW * 0.5 && !JS.on && !DA.on) {
        const now = performance.now();
        if (now - LT.t < DASH_GAP && Math.hypot(x - LT.x, y - LT.y) < DASH_DIST) {
          // double-tap: mulai bidik dash analog (stik gerak tidak aktif selama ini)
          LT.t = 0;
          DA.on = 1;
          DA.id = t.identifier;
          DA.ox = x;
          DA.oy = y;
          const R = dashR(),
            sf = 8;
          DA.cx = cl(x, SAFE.l + R + sf, Math.max(SAFE.l + R + sf, UW * 0.5)); // cincin tetap utuh di dalam layar
          DA.cy = cl(y, R + sf, UH - SAFE.b - R - sf);
          DA.man = DA.mv = 0;
          DA.kx = DA.ky = 0;
          DA.x = DA.y = 0;
        } else {
          JS.on = 1;
          JS.id = t.identifier;
          JS.ox = x;
          JS.oy = y;
          JS.x = JS.y = 0;
          JS.t0 = now; // untuk mendeteksi tap singkat
          JH.length = 0;
          JH.push({ t: now, x, y });
        }
      }
    }
  },
  { passive: false },
);
addEventListener(
  'touchmove',
  (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const tx_ = t.clientX,
        ty_ = t.clientY;
      if (AIM.on && t.identifier == AIM.id) aimFrom(tx_, ty_);
      if (SK.on && t.identifier == SK.id) skAimFrom(tx_, ty_);
      if (DA.on && t.identifier == DA.id) dashAimFrom(tx_, ty_);
      if (JS.on && t.identifier == JS.id) {
        flickCheck(tx_, ty_);
        const dx = tx_ - JS.ox,
          dy = ty_ - JS.oy,
          m = Math.hypot(dx, dy),
          mx = tui().stick.r;
        if (m < 8) {
          JS.x = JS.y = 0;
        } else {
          JS.x = dx / Math.max(m, mx);
          JS.y = dy / Math.max(m, mx);
        }
      }
    }
  },
  { passive: false },
);
const tend = (e) => {
  for (const t of e.changedTouches) {
    if (JS.on && t.identifier == JS.id) {
      // tap singkat (tanpa geser) di sisi kiri = kandidat tap pertama double-tap dash
      if (
        e.type == 'touchend' &&
        performance.now() - JS.t0 < DASH_TAP_MS &&
        Math.hypot(t.clientX - JS.ox, t.clientY - JS.oy) < DASH_TAP_MOVE
      ) {
        LT.t = performance.now();
        LT.x = JS.ox;
        LT.y = JS.oy;
      }
      JS.on = 0;
      JS.x = JS.y = 0;
    }
    if (DA.on && t.identifier == DA.id) {
      if (e.type == 'touchend' && S == 'play' && P) dash(dashAimAngle()); // touchcancel = batal
      DA.on = DA.man = DA.mv = 0;
      DA.kx = DA.ky = 0;
    }
    if (AIM.on && t.identifier == AIM.id) {
      AIM.on = AIM.man = 0;
      AIM.kx = AIM.ky = 0;
      AIM.tg = null;
    }
    if (SK.on && t.identifier == SK.id) {
      const k = SK.k;
      if (e.type == 'touchend' && S == 'play' && P) castSkill(k); // touchcancel = batal
      SK.on = 0;
      SK.man = 0;
      SK.kx = SK.ky = 0;
    }
    if (e.type == 'touchend') {
      const u = uiHit(t.clientX, t.clientY);
      if (u) uiAct(u);
      else if (!fsTried && !STANDALONE && S == 'play') {
        fsTried = 1;
        enterFS();
      }
    }
  }
};
addEventListener('touchend', tend);
addEventListener('touchcancel', tend);
