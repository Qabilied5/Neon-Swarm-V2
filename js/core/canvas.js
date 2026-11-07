// Setup canvas, ukuran layar (W,H), safe-area (notch), deteksi portrait, resize
const cv = document.getElementById('c'),
  g = cv.getContext('2d');
// ZM = zoom dunia game. Di HP (layar sentuh) < 1 supaya area pandang lebih luas (zoom-out).
// Makin kecil = medan perang makin luas (dan makin kecil tampilannya). Ubah di sini.
const ZOOM_TOUCH = 0.6,
  ZOOM_REF = 0.75; // zoom acuan: ukuran garis / grid / panah bidik dijaga sama seperti pada zoom ini
let ZM = 1,
  ZLOCK = null, // zoom dunia dikunci sekali (null = belum ditentukan); tidak dihitung ulang tiap resize
  ZK = 1, // pengali ukuran dunia agar tampilan fisik tetap sama saat zoom-out (ZOOM_REF / ZM)
  W,
  H, // ukuran DUNIA logis (layar / ZM): dipakai gameplay (spawn, batas arena, dll.)
  UW,
  UH, // ukuran LAYAR asli (px CSS): dipakai UI (HUD, menu, kartu, tombol sentuh) -> tidak ikut zoom
  PORTRAIT = false; // true = HP dipegang tegak (game minta landscape)
const SAFE = { t: 0, r: 0, b: 0, l: 0 }; // inset notch / gesture bar (px layar asli, ruang UI)
function readSafe() {
  const el = document.getElementById('safe'),
    cs = el && getComputedStyle(el);
  if (!cs) return;
  SAFE.t = parseFloat(cs.paddingTop) || 0;
  SAFE.r = parseFloat(cs.paddingRight) || 0;
  SAFE.b = parseFloat(cs.paddingBottom) || 0;
  SAFE.l = parseFloat(cs.paddingLeft) || 0;
}
function rs() {
  const d = Math.min(devicePixelRatio || 1, 2);
  // Dikunci pada pemanggilan pertama: sebelumnya dihitung ulang tiap resize, sehingga bila media 'pointer: coarse'
  // berubah di tengah game (bar browser, fullscreen, mouse/keyboard tersambung) zoom tiba-tiba loncat 0.6 <-> 1.
  if (ZLOCK === null) ZLOCK = matchMedia('(pointer: coarse)').matches ? ZOOM_TOUCH : 1;
  ZM = ZLOCK;
  ZK = ZM < 1 ? ZOOM_REF / ZM : 1;
  UW = innerWidth;
  UH = innerHeight;
  W = innerWidth / ZM; // W,H = ukuran dunia logis (lebih besar dari layar saat zoom-out)
  H = innerHeight / ZM;
  cv.width = Math.round(innerWidth * d);
  cv.height = Math.round(innerHeight * d);
  cv.style.width = innerWidth + 'px'; // samakan ukuran CSS dengan viewport asli (hindari 100% yang melar di address bar HP)
  cv.style.height = innerHeight + 'px';
  g.setTransform(d * ZM, 0, 0, d * ZM, 0, 0);
  readSafe();
  PORTRAIT = matchMedia('(orientation: portrait) and (pointer: coarse)').matches;
}
// resize: hitung ulang, lalu sekali lagi setelah layar stabil (bar browser / fullscreen / iOS telat melaporkan ukuran)
let rsT = 0;
addEventListener('resize', () => {
  rs();
  clearTimeout(rsT);
  rsT = setTimeout(rs, 300);
});
if (window.visualViewport) visualViewport.addEventListener('resize', () => (resetPinch(), rs())); // address bar HP muncul / hilang
addEventListener('orientationchange', () => setTimeout(rs, 250)); // iOS: ukuran baru telat terbaca
rs();

// Jika browser sempat ter-zoom (pinch / double-tap), kembalikan ke skala 1 dengan menyetel ulang meta viewport.
function resetPinch() {
  const vv = window.visualViewport;
  if (!vv || Math.abs(vv.scale - 1) < 0.02) return;
  const m = document.querySelector('meta[name=viewport]');
  if (!m) return;
  const c = m.content;
  m.content = 'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';
  setTimeout(() => (m.content = c), 100);
}
