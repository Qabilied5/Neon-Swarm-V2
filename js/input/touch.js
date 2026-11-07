// Input sentuh: area gerak (bawaan sisi kiri layar) = stik gerak (melayang, tanpa UI), area serang (bawaan sisi kanan) = serang bebas (tahan + geser untuk bidik, TANPA auto aim)
// + dash & skill. Skill Q/E/R: tahan -> geser untuk membidik -> lepas untuk menembakkan.
// Posisi tombol & luas kedua area bisa diatur pemain (HUD di menu / pause, lihat ui/hud-edit.js, konfigurasi HC di ui/touch-layout.js).
// DASH: double-tap CEPAT di area serang (kanan) = trigger dash. Double-tap HANYA memicu dash, tidak mengarahkannya:
// arah dash = arah stik gerak kiri (jika sedang ditahan), jika tidak -> arah gerak terakhir. Jadi kiri = arah, kanan = trigger,
// dan jempol kanan bisa menembak + dash di titik yang sama tanpa berpindah.
// AIM ASSIST: musuh di dalam lingkaran bidik -> peluru diarahkan tepat ke musuh (dengan prediksi gerak).
const TPR = {}; // waktu efek "ditekan" per tombol

// DOUBLE-TAP DASH (sisi kanan): tap singkat lalu tap kedua dengan cepat -> dash langsung di sentuhan kedua.
// Sentuhan kedua tetap berlanjut sebagai tahan-bidik biasa, jadi pemain bisa langsung menembak setelah dash.
const DASH_GAP = 300, // ms maks antara lepas tap pertama dan mulai tap kedua
  DASH_TAP_MS = 220, // tap pertama harus lebih singkat dari ini
  DASH_TAP_MOVE = 24; // ...dan jari tidak bergeser lebih dari ini (px), supaya geser bidik tidak dihitung tap
const RT = { t: 0 }; // waktu lepas tap singkat terakhir di sisi kanan
const LM = { x: 0, y: 0 }; // arah gerak terakhir pemain (vektor satuan) = arah dash jika stik kiri tidak ditahan

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
    if (e.target && e.target.closest && e.target.closest('#install, #lb')) return; // biarkan tombol install & dialog kirim skor bekerja
    e.preventDefault();
    TOUCH = true;
    if (ZLOCK !== ZOOM_TOUCH && S == 'menu') {
      ZLOCK = ZOOM_TOUCH; // perangkat sentuh yang tidak melapor 'pointer: coarse': kunci zoom HP sekali, di menu
      rs();
    }
    if (PORTRAIT) return;
    for (const t of e.changedTouches) {
      const x = t.clientX,
        y = t.clientY; // koordinat layar asli (ruang UI)
      if (S == 'hudedit') {
        heStart(t.identifier, x, y); // editor HUD: seret tombol / area
        continue;
      }
      if (uiHit(x, y)) continue;
      if (S == 'menu' || S == 'dead') {
        if (menuBtnHit(x, y)) continue; // tombol TUTORIAL: belum ada aksi, jangan mulai game
        if (S == 'dead' && lbBtnHit(x, y)) continue; // tombol KIRIM SKOR: aksi saat jari dilepas
        if (deadT <= 0) init();
        continue;
      }
      if (S == 'levelup') {
        const i = cardAt(x, y);
        if (i >= 0) pickCard(i);
        continue;
      }
      if (S == 'pause') {
        const k = pauseBtnAt(x, y);
        if (k) pauseAct(k); // LANJUT / RESTART
        else S = 'play'; // sentuh area lain = lanjut (perilaku lama)
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
      if (!AIM.on && inZone(HC.aim, x, y)) {
        // area serang (bawaan: seluruh sisi kanan layar; bisa diatur lewat HUD) = tahan + geser
        const now = performance.now();
        if (now - RT.t < DASH_GAP && P && S == 'play') {
          RT.t = 0; // double-tap: trigger dash saja (arah dari stik kiri)
          dash();
        }
        AIM.on = 1;
        AIM.id = t.identifier;
        AIM.t0 = now; // untuk mendeteksi tap singkat
        AIM.sx = x;
        AIM.sy = y;
        aimStart(x, y);
        continue;
      }
      if (!JS.on && inZone(HC.move, x, y)) {
        // area gerak (bawaan: seluruh sisi kiri layar)
        JS.on = 1;
        JS.id = t.identifier;
        JS.ox = x;
        JS.oy = y;
        JS.x = JS.y = 0;
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
      if (S == 'hudedit') {
        heMove(t.identifier, tx_, ty_);
        continue;
      }
      if (AIM.on && t.identifier == AIM.id) aimFrom(tx_, ty_);
      if (SK.on && t.identifier == SK.id) skAimFrom(tx_, ty_);
      if (JS.on && t.identifier == JS.id) {
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
    if (S == 'hudedit') {
      heEnd(t.identifier, t.clientX, t.clientY, e.type);
      continue;
    }
    if (JS.on && t.identifier == JS.id) {
      JS.on = 0;
      JS.x = JS.y = 0;
    }
    if (AIM.on && t.identifier == AIM.id) {
      // tap singkat (tanpa geser) = kandidat tap pertama double-tap dash
      if (
        e.type == 'touchend' &&
        performance.now() - AIM.t0 < DASH_TAP_MS &&
        Math.hypot(t.clientX - AIM.sx, t.clientY - AIM.sy) < DASH_TAP_MOVE
      )
        RT.t = performance.now();
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
      else if (S == 'dead' && lbBtnHit(t.clientX, t.clientY)) lbOpen();
      else if (!fsTried && !STANDALONE && S == 'play') {
        fsTried = 1;
        enterFS();
      }
    }
  }
};
addEventListener('touchend', tend);
addEventListener('touchcancel', tend);
