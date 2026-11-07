// Layout kontrol sentuh (landscape): stik kiri, tombol serang kanan dikelilingi dash & skill
const bs = () => cl(innerHeight / 400, 0.75, 1.2); // skala UI menurut tinggi layar (UI di ruang layar, tidak ikut zoom dunia)

// Tombol di sekeliling tombol serang. a = sudut (derajat, 180 = kiri tombol serang, searah jarum jam)
// Tambah tombol baru di sini (+ f = fungsi aksi). Maks ~6 tombol agar tidak berdesakan.
const TBTN = [
  { k: 'dash', l: 'DASH', c: '#ffd166', a: 348, r: 30, f: () => dash() },
  { k: 'q', l: 'Q', c: '#22d3ee', a: 222, r: 26, f: () => nova() },
  { k: 'e', l: 'E', c: '#ff2e63', a: 264, r: 26, f: () => laser() },
  { k: 'r', l: 'R', c: '#b967ff', a: 306, r: 26, f: () => hole() },
  { k: 'c', l: '✚', c: '#39ff88', a: 180, r: 26, f: () => heal() },
];

let TUI = null;
function buildTUI() {
  const u = bs(),
    R = 96 * u, // jarak tombol skill dari pusat tombol serang
    ar = 46 * u, // radius tombol serang
    cx = UW - SAFE.r - 12 - R * 0.98 - 30 * u,
    cy = UH - SAFE.b - 10 - ar,
    sr = 55 * u; // radius stik kiri
  return {
    w: UW,
    h: UH,
    sl: SAFE.l,
    sr: SAFE.r,
    sb: SAFE.b,
    u,
    stick: { x: Math.max(SAFE.l + 30 + sr, UW * 0.13), y: UH - SAFE.b - 20 - sr, r: sr },
    atk: { x: cx, y: cy, r: ar, aimR: 60 * u, dead: 10 * u },
    btns: TBTN.map((b) => ({
      ...b,
      x: cx + R * Math.cos((b.a * Math.PI) / 180),
      y: cy + R * Math.sin((b.a * Math.PI) / 180),
      r: b.r * u,
    })),
  };
}
// tombol yang tampil & bisa disentuh: skill Q/E/R yang masih terkunci (belum dipilih di level-up) disembunyikan
const vbtns = () => tui().btns.filter((b) => !(b.k == 'q' || b.k == 'e' || b.k == 'r') || (P && P.sk[b.k] > 0));

// hasil di-cache, dihitung ulang hanya saat ukuran layar / safe-area berubah
function tui() {
  if (!TUI || TUI.w != UW || TUI.h != UH || TUI.sl != SAFE.l || TUI.sr != SAFE.r || TUI.sb != SAFE.b)
    TUI = buildTUI();
  return TUI;
}
