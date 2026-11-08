// LEADERBOARD ONLINE (opsional). Alur: game hitung skor lokal -> game over -> pemain tekan KIRIM SKOR & isi nama -> HTTPS ke
// Vercel Serverless Function -> MongoDB Atlas (lihat folder backend/). Top skor di-cache di localStorage ('ns_lb'):
//  - TOP 3 tampil di menu & layar pause saat online
//  - saat bermain, skor dibandingkan dengan cache (tanpa jaringan); melewati skor pemain lain -> notif kecil kiri atas
// Isi LB_API dengan URL deploy Vercel. Kosongkan / biarkan placeholder = fitur nonaktif, game tetap jalan normal & offline.
const LB_API = 'https://neon-swarm-v2-backend.vercel.app/api/leaderboard';
const LB_ON = /^https:\/\//.test(LB_API) && !/GANTI-DENGAN/.test(LB_API);
const LB_GAP = 20000, // jeda minimum antar pengambilan top (ms), kecuali dipaksa
  LB_N = 10, // jumlah skor yang disimpan di cache (dipakai untuk notif)
  LB_NAME_MAX = 16,
  LB_TOAST_S = 4.6, // lama notif (detik)
  LB_MEDAL = ['#ffd166', '#cfd8e3', '#d98a4e'];
const LB = {
  top: [], // cache top skor, urut menurun: [{ name, score }]
  busy: 0, q: 0, next: 0, started: 0, prevS: 'menu',
  snap: [], idx: 0, // salinan top saat game dimulai + penunjuk skor terendah yang belum dikalahkan
  toast: [], // notif aktif: { t0, txt }
  run: null, // hasil game terakhir { score, wave, kills, time }
  sent: 0, rank: 0, open: 0, sending: 0, by: 0, // by = posisi y tombol di layar game over
};

const lbClean = (s) =>
  String(s || '')
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N} _.\-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LB_NAME_MAX)
    .trim();
function lbParse(a) {
  if (!Array.isArray(a)) return null;
  return a
    .map((e) => ({ name: lbClean(e && e.name) || '???', score: Math.floor(+(e && e.score)) }))
    .filter((e) => Number.isFinite(e.score) && e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, LB_N);
}
try {
  LB.top = lbParse(JSON.parse(localStorage.getItem('ns_lb')).top) || [];
} catch (e) {}
const lbSave = () => {
  try {
    localStorage.setItem('ns_lb', JSON.stringify({ at: Date.now(), top: LB.top }));
  } catch (e) {}
};
const lbShow = () => LB_ON && navigator.onLine && LB.top.length > 0;

// ---------- jaringan ----------
async function lbFetch(url, opt, ms) {
  const ac = new AbortController(),
    to = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, { ...opt, signal: ac.signal });
  } finally {
    clearTimeout(to);
  }
}
// ambil top dari server & simpan ke localStorage. force = abaikan jeda, bust = lewati cache CDN (setelah kirim skor)
async function lbRefresh(force, bust) {
  if (!LB_ON || !navigator.onLine || document.hidden) return;
  if (LB.busy) {
    if (force) LB.q = 1;
    return;
  }
  const now = Date.now();
  if (!force && now < LB.next) return;
  LB.busy = 1;
  LB.next = now + LB_GAP;
  try {
    const r = await lbFetch(LB_API + '?limit=' + LB_N + (bust ? '&t=' + now : ''), { headers: { Accept: 'application/json' } }, 8000);
    if (!r.ok) throw 0;
    const top = lbParse((await r.json()).top);
    if (top) {
      LB.top = top;
      lbSave();
    }
  } catch (e) {
    LB.next = now + 60000; // gagal: pakai cache, coba lagi 1 menit lagi
  }
  LB.busy = 0;
  if (LB.q) {
    LB.q = 0;
    lbRefresh(true, true);
  }
}
addEventListener('online', () => lbRefresh(true));

// ---------- siklus game ----------
function lbBegin() {
  // dipanggil init(): game baru -> salin cache sebagai pembanding notif
  LB.snap = LB.top.map((e) => ({ ...e }));
  LB.idx = LB.snap.length;
  LB.toast = [];
  LB.run = null;
  LB.sent = LB.rank = 0;
}
function lbDie() {
  LB.run = { score, wave, kills, time: Math.round(t) };
  LB.sent = LB.rank = 0;
}
// dipanggil tiap frame (main.js)
function lbTick() {
  if (!LB_ON) return;
  if (!LB.started) {
    LB.started = 1;
    lbRefresh(true); // game baru dibuka
  }
  if (S != LB.prevS) {
    LB.prevS = S;
    if (S == 'menu' || S == 'pause') lbRefresh(); // pause / kembali ke menu: segarkan (dibatasi jeda)
  }
  if (S == 'play' && LB.idx > 0) {
    let hit = -1;
    while (LB.idx > 0 && score > LB.snap[LB.idx - 1].score) hit = --LB.idx; // lewati beberapa sekaligus -> tampilkan yang tertinggi
    if (hit >= 0) {
      const e = LB.snap[hit];
      LB.toast.push({
        t0: T,
        txt: (hit == 0 ? '★ PERINGKAT 1! ' : '★ ') + 'Mengalahkan skor ' + e.name + ' (' + e.score + ')',
      });
      if (LB.toast.length > 3) LB.toast.shift();
      snd(660, 0.12, 'triangle', 0.04);
    }
  }
  if (LB.toast.length) LB.toast = LB.toast.filter((x) => T - x.t0 < LB_TOAST_S);
}

// ---------- gambar ----------
const lbW = (s, sz) => ((g.font = `700 ${sz}px Consolas,Menlo,monospace`), g.measureText(s).width);
// notif kecil kiri atas (di bawah blok HP / XP / LV)
function lbDrawToasts() {
  if (!LB.toast.length || (S != 'play' && S != 'pause')) return;
  let y = P && wave >= LET ? 104 : 84;
  const x = SAFE.l + 16;
  for (const o of LB.toast.slice(-2)) {
    const age = T - o.t0,
      a = Math.min(1, age / 0.25, (LB_TOAST_S - age) / 0.6),
      w = lbW(o.txt, 12) + 22;
    g.globalAlpha = Math.max(0, a) * 0.95;
    g.shadowBlur = 0;
    g.fillStyle = 'rgba(4,10,22,.82)';
    g.strokeStyle = '#39ff88';
    g.lineWidth = 1.5;
    g.beginPath();
    g.roundRect ? g.roundRect(x - 4 + (1 - Math.min(1, age / 0.25)) * -14, y, w, 24, 6) : g.rect(x - 4, y, w, 24);
    g.fill();
    g.stroke();
    tx(o.txt, x + 7 + (1 - Math.min(1, age / 0.25)) * -14, y + 16, 12, '#39ff88', 'left', 0);
    y += 30;
  }
  g.globalAlpha = 1;
}
// satu baris "TOP 3" (menu & pause), hanya saat online & ada data
function lbDrawTop3(y, sz) {
  if (!lbShow()) return;
  const segs = [['TOP 3', '#7aa2c0']];
  LB.top.slice(0, 3).forEach((e, i) => {
    const n = e.name.length > 12 ? e.name.slice(0, 11) + '…' : e.name;
    segs.push([i + 1 + '. ' + n + ' ' + e.score, LB_MEDAL[i]]);
  });
  const gap = 22,
    ws = segs.map((s) => lbW(s[0], sz)),
    avail = UW - SAFE.l - SAFE.r - 24,
    k = Math.min(1, (avail - gap * (segs.length - 1)) / ws.reduce((a, b) => a + b, 0)),
    s = sz * k;
  let x = UW / 2 - (ws.reduce((a, b) => a + b, 0) * k + gap * (segs.length - 1)) / 2;
  segs.forEach((sg, i) => {
    tx(sg[0], x, y, s, sg[1], 'left', 0);
    x += ws[i] * k + gap;
  });
}
// tombol KIRIM SKOR di layar game over (null jika tidak perlu tampil)
function lbBtn() {
  if (!LB_ON || S != 'dead' || deadT > 0 || LB.sent || !LB.run || LB.run.score <= 0 || !navigator.onLine) return null;
  const w = cl(UW * 0.34, 200, 280);
  return { x: UW / 2 - w / 2, y: LB.by, w, h: 38 };
}
const lbBtnHit = (x, y) => {
  const b = lbBtn();
  return !!b && x >= b.x - 6 && x <= b.x + b.w + 6 && y >= b.y - 6 && y <= b.y + b.h + 6;
};
function lbDrawDead(y) {
  LB.by = y;
  if (!LB_ON || !LB.run || LB.run.score <= 0 || deadT > 0) return;
  const b = lbBtn();
  if (b) {
    const c = '#39ff88';
    g.globalAlpha = 0.8 + 0.2 * Math.sin(T * 5);
    g.shadowColor = c;
    g.shadowBlur = 10;
    g.fillStyle = '#0a1220';
    g.strokeStyle = c;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect ? g.roundRect(b.x, b.y, b.w, b.h, 8) : g.rect(b.x, b.y, b.w, b.h);
    g.fill();
    g.stroke();
    g.globalAlpha = 1;
    tx(TOUCH ? 'KIRIM SKOR' : 'KIRIM SKOR  [S]', UW / 2, b.y + b.h / 2 + 6, 16, c, 'center', 0);
  } else if (LB.sent) tx('✓ SKOR TERKIRIM  ·  PERINGKAT #' + LB.rank, UW / 2, y + 25, 15, '#39ff88', 'center', 6);
  else if (!navigator.onLine) tx('offline · skor tidak bisa dikirim', UW / 2, y + 25, 13, '#7aa2c0');
}

// ---------- dialog kirim skor (overlay HTML: keyboard HP & karakter bebas) ----------
const lbEl = (id) => document.getElementById(id);
let lbWired = 0;
function lbWire() {
  if (lbWired) return;
  lbWired = 1;
  const box = lbEl('lb');
  // semua input di dialog tidak boleh sampai ke handler game (touch/keyboard/mouse window)
  for (const ev of ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'mousedown', 'mouseup', 'keyup', 'contextmenu', 'wheel'])
    box.addEventListener(ev, (e) => e.stopPropagation(), { passive: true });
  box.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key == 'Escape') lbClose();
  });
  lbEl('lb-form').addEventListener('submit', (e) => {
    e.preventDefault();
    lbSubmit();
  });
  lbEl('lb-cancel').addEventListener('click', lbClose);
}
function lbMsg(s, err) {
  const m = lbEl('lb-msg');
  m.textContent = s || '';
  m.className = err ? 'err' : '';
}
function lbOpen() {
  if (!LB_ON || !LB.run || LB.sent || LB.open) return;
  lbWire();
  LB.open = 1;
  lbEl('lb-info').textContent = 'SKOR ' + LB.run.score + '  ·  WAVE ' + LB.run.wave + '  ·  KILLS ' + LB.run.kills;
  let nm = '';
  try {
    nm = localStorage.getItem('ns_name') || '';
  } catch (e) {}
  const inp = lbEl('lb-name');
  inp.value = nm;
  lbMsg('');
  lbEl('lb-send').disabled = false;
  lbEl('lb').hidden = false;
  inp.focus();
  setTimeout(() => inp.focus(), 0); // fokus ulang setelah event klik / sentuh selesai (keyboard HP)
}
function lbClose() {
  if (LB.sending) return;
  LB.open = 0;
  lbEl('lb').hidden = true;
  lbEl('lb-name').blur();
}
async function lbSubmit() {
  if (LB.sending || !LB.run) return;
  const name = lbClean(lbEl('lb-name').value);
  if (!name) return lbMsg('Isi nama dulu (huruf / angka, maks ' + LB_NAME_MAX + ' karakter)', 1);
  LB.sending = 1;
  lbEl('lb-send').disabled = true;
  lbMsg('Mengirim…');
  try {
    const r = await lbFetch(
      LB_API,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score: LB.run.score, wave: LB.run.wave, kills: LB.run.kills, time: LB.run.time }),
      },
      10000,
    );
    let j = {};
    try {
      j = await r.json();
    } catch (e) {}
    if (!r.ok || !j.ok)
      throw r.status == 429
        ? new Error('Terlalu banyak percobaan, coba lagi nanti')
        : new Error(j.error || 'Server menolak (' + r.status + ')');
    try {
      localStorage.setItem('ns_name', name);
    } catch (e) {}
    LB.sent = 1;
    LB.rank = j.rank || 0;
    lbMsg(j.improved ? 'Terkirim! Peringkat #' + j.rank : 'Terkirim. Rekor ' + name + ' (' + j.best + ') masih lebih tinggi · #' + j.rank);
    LB.sending = 0;
    lbRefresh(true, true);
    setTimeout(lbClose, 1600);
  } catch (e) {
    LB.sending = 0;
    lbEl('lb-send').disabled = false;
    lbMsg(e.name == 'AbortError' || e instanceof TypeError ? 'Gagal terhubung. Periksa koneksi lalu coba lagi.' : e.message, 1);
  }
}

// ---------- LAYAR RANKING (TOP 10) ----------
// Overlay penuh yang dibuka dari tombol RANKING di menu & pause. S (menu / pause) tidak berubah, jadi game yang di-pause tetap aman.
// Data = cache LB.top (maks 10) yang disegarkan dari server saat dibuka; offline -> tampilkan cache terakhir.
const RK = { on: 0, t0: 0, id: null, me: '' };
function rankOpen(id) {
  if (RK.on) return;
  RK.on = 1;
  RK.t0 = T;
  RK.id = id == null ? null : id; // id sentuhan pembuka: touchend-nya jangan langsung menutup
  try {
    RK.me = (localStorage.getItem('ns_name') || '').toLowerCase();
  } catch (e) {
    RK.me = '';
  }
  lbRefresh(true, true); // ambil data terbaru
}
const rankClose = () => (RK.on = 0);
const rankTap = () => T - RK.t0 > 0.25 && rankClose(); // jeda singkat agar tap pembuka tidak langsung menutup
function drawRank() {
  if (!RK.on) return;
  const sw = UW - SAFE.l - SAFE.r,
    cx = SAFE.l + sw / 2,
    tsz = cl(UH / 10, 22, 38),
    ty = SAFE.t + tsz + 6,
    bh = cl(UH * 0.1, 34, 42),
    bw = cl(sw * 0.22, 130, 180),
    by = UH - SAFE.b - bh - 10,
    y0 = ty + 38,
    y1 = by - 22,
    top = LB.top.slice(0, 10);
  g.shadowBlur = 0;
  g.globalAlpha = 1;
  g.fillStyle = 'rgba(2,4,12,.98)';
  g.fillRect(0, 0, UW, UH);
  tx('RANKING', cx, ty, tsz, '#ffd166', 'center', 14);
  tx('TOP 10 SKOR TERTINGGI', cx, ty + 20, 12, '#7aa2c0');

  const online = LB_ON && navigator.onLine;
  if (!top.length) {
    const m = !LB_ON
      ? 'Ranking online belum diaktifkan'
      : !navigator.onLine
        ? 'Offline · ranking tidak tersedia'
        : LB.busy
          ? 'Memuat ranking…'
          : 'Belum ada data ranking';
    tx(m, cx, (y0 + y1) / 2, 16, '#7aa2c0');
  } else {
    const two = sw >= 520, // layar lebar: 2 kolom x 5 baris
      per = two ? 5 : 10,
      rh = Math.min(two ? 40 : 30, (y1 - y0) / per),
      colW = two ? Math.min(sw / 2 - 14, 340) : Math.min(sw - 24, 420);
    top.forEach((e, i) => {
      const col = two ? (i < 5 ? 0 : 1) : 0,
        row = two ? i % 5 : i,
        x = two ? cx + (col ? 8 : -colW - 8) : cx - colW / 2,
        y = y0 + row * rh,
        h = rh - 4,
        c = i < 3 ? LB_MEDAL[i] : '#7aa2c0',
        me = RK.me && e.name.toLowerCase() == RK.me,
        sz = cl(h * 0.46, 11, 17);
      g.fillStyle = me ? 'rgba(57,255,136,.12)' : i < 3 ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.03)';
      g.strokeStyle = me ? '#39ff88' : i < 3 ? c + '88' : 'rgba(122,162,192,.25)';
      g.lineWidth = me ? 2 : 1;
      rrect(x, y, colW, h, 8);
      g.fill();
      g.stroke();
      const my = y + h / 2 + sz * 0.36;
      tx(String(i + 1), x + 12, my, sz * 1.1, c, 'left', i < 3 ? 6 : 0);
      const sc = e.score.toLocaleString('id-ID');
      tx(sc, x + colW - 12, my, sz * 1.05, i < 3 ? c : '#e8f4ff', 'right', 0);
      tx(fitText(e.name, sz, colW - 48 - lbW(sc, sz * 1.05) - 14), x + 46, my, sz, me ? '#39ff88' : '#e8f4ff', 'left', 0);
    });
  }
  // status data
  const st = !online && top.length ? 'offline · menampilkan data tersimpan terakhir' : LB.busy && top.length ? 'memperbarui…' : '';
  if (st) tx(st, cx, y1 + 12, 11, '#7aa2c0');
  // tombol KEMBALI
  const hot = !TOUCH && MU.x >= cx - bw / 2 && MU.x <= cx + bw / 2 && MU.y >= by && MU.y <= by + bh,
    bc = '#22d3ee';
  g.shadowColor = bc;
  g.shadowBlur = hot ? 16 : 6;
  g.fillStyle = hot ? 'rgba(34,211,238,.22)' : 'rgba(10,18,32,.85)';
  g.strokeStyle = bc;
  g.lineWidth = 2;
  rrect(cx - bw / 2, by, bw, bh, bh / 2);
  g.fill();
  g.stroke();
  g.shadowBlur = 0;
  tx('KEMBALI', cx, by + bh / 2 + 5, 15, bc, 'center', 0);
}
