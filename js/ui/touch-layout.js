// Layout kontrol sentuh (landscape): tombol dash & skill di sekitar area serang kanan, area gerak kiri.
// Posisi/ukuran tombol dan area gerak/serang bisa diatur pemain lewat tombol HUD (menu / pause) -> ui/hud-edit.js
const bs = () => cl(innerHeight / 400, 0.75, 1.2); // skala UI menurut tinggi layar (UI di ruang layar, tidak ikut zoom dunia)

// Tombol di sekeliling titik serang. a = sudut (derajat, 180 = kiri titik serang, searah jarum jam)
// rr (opsional) = pengali jarak dari titik serang (bawaan 1; >1 = lingkar luar, untuk tombol tambahan).
// Tambah tombol baru di sini (+ f = fungsi aksi, i = kunci ikon SVG di render/icons.js, l = label teks cadangan). Maks ~6 tombol agar tidak berdesakan.
const TBTN = [
  { k: 'dash', l: 'DASH', i: 'dash', c: '#ffd166', a: 348, r: 30, f: () => dash() },
  { k: 'q', l: 'Q', i: 'nova', c: '#22d3ee', a: 222, r: 26, f: () => nova() },
  { k: 'e', l: 'E', i: 'laser', c: '#ff2e63', a: 264, r: 26, f: () => laser() },
  { k: 'r', l: 'R', i: 'hole', c: '#b967ff', a: 306, r: 26, f: () => hole() },
  { k: 'c', l: '✚', i: 'heal', c: '#39ff88', a: 180, r: 26, f: () => heal() },
  { k: 'tp', l: 'T', i: 'teleport', c: '#ff9f1c', a: 205, rr: 1.55, r: 26, f: () => teleport() }, // lingkar luar kiri-atas
];

// ---- KONFIGURASI HUD (disimpan di localStorage 'ns_hud') ----
// move / aim = area sentuh (pecahan layar 0..1): sentuhan di dalam move = stik gerak, di dalam aim = serang/bidik (+ double-tap dash).
// btn[k] = { x, y, s }: posisi tengah tombol (pecahan layar) & pengali ukuran; tidak ada entri = posisi bawaan.
// show = 1: garis tepi kedua area digambar juga saat bermain.
// so = opasitas tombol skill (Q/E/R/Teleport) 0.1..1, bawaan 0.1; dash & heal tetap 0.9.
const HC_MINW = 0.12, // lebar / tinggi minimum area (pecahan layar)
  HC_MINH = 0.2,
  HC_SMIN = 0.6, // batas pengali ukuran tombol
  HC_SMAX = 2,
  HC_OMIN = 0.1, // opasitas skill minimum (tombol tetap bisa disentuh walau nyaris tak terlihat)
  HC_SO = 0.1; // opasitas skill bawaan
const isSkillBtn = (k) => k == 'q' || k == 'e' || k == 'r' || k == 'tp'; // tombol yang opasitasnya bisa diatur (HC.so)
const hcDef = () => ({
  move: { x: 0, y: 0, w: 0.5, h: 1 },
  aim: { x: 0.5, y: 0, w: 0.5, h: 1 },
  btn: {},
  show: 0,
  so: HC_SO,
});
function hcZone(z) {
  const w = cl(z.w, HC_MINW, 1),
    h = cl(z.h, HC_MINH, 1);
  return { x: cl(z.x, 0, 1 - w), y: cl(z.y, 0, 1 - h), w, h };
}
function hcLoad() {
  const d = hcDef();
  try {
    const o = JSON.parse(localStorage.getItem('ns_hud'));
    if (o) {
      for (const z of ['move', 'aim'])
        if (o[z] && ['x', 'y', 'w', 'h'].every((k) => Number.isFinite(o[z][k]))) d[z] = hcZone(o[z]);
      for (const k in o.btn || {}) {
        const v = o.btn[k];
        if (TBTN.some((b) => b.k == k) && v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.s))
          d.btn[k] = { x: cl(v.x, 0, 1), y: cl(v.y, 0, 1), s: cl(v.s, HC_SMIN, HC_SMAX) };
      }
      d.show = o.show ? 1 : 0;
      if (Number.isFinite(o.so)) d.so = cl(o.so, HC_OMIN, 1);
    }
  } catch (e) {}
  return d;
}
function hcSave() {
  try {
    localStorage.setItem('ns_hud', JSON.stringify(HC));
  } catch (e) {}
}
let HC = hcLoad();
const zrect = (z) => ({ x: z.x * UW, y: z.y * UH, w: z.w * UW, h: z.h * UH }); // area -> px layar
const inZone = (z, x, y) => {
  const r = zrect(z);
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
};

let TUI = null;
function buildTUI() {
  const u = bs(),
    R = 96 * u, // jarak tombol skill dari titik serang
    ar = 46 * u, // radius titik serang (acuan layout & jangkauan geser bidik skill)
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
    btns: TBTN.map((b) => {
      const hc = HC.btn[b.k],
        r = b.r * u * (hc ? hc.s : 1);
      return {
        ...b,
        x: hc ? cl(hc.x * UW, SAFE.l + r, UW - SAFE.r - r) : cx + R * (b.rr || 1) * Math.cos((b.a * Math.PI) / 180),
        y: hc ? cl(hc.y * UH, r, UH - SAFE.b - r) : cy + R * (b.rr || 1) * Math.sin((b.a * Math.PI) / 180),
        r,
      };
    }),
  };
}
// tombol yang tampil & bisa disentuh: skill Q/E/R/Teleport yang masih terkunci (belum dipilih di level-up) disembunyikan
const vbtns = () => tui().btns.filter((b) => !isSkillBtn(b.k) || (P && P.sk[b.k] > 0));

// hasil di-cache, dihitung ulang hanya saat ukuran layar / safe-area / konfigurasi HUD berubah (set TUI = null)
function tui() {
  if (!TUI || TUI.w != UW || TUI.h != UH || TUI.sl != SAFE.l || TUI.sr != SAFE.r || TUI.sb != SAFE.b)
    TUI = buildTUI();
  return TUI;
}
