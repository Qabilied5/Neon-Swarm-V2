// Kunci sentuhan sementara di HP: saat kartu baru muncul (atau setelah reroll), sentuhan diabaikan sebentar
// supaya jari yang sedang menekan tombol/area serang tidak langsung memilih kartu tanpa sengaja.
const CARD_DELAY = 0.8, // detik, saat kartu pertama muncul
  CARD_DELAY_RR = 0.35; // detik, setelah reroll
let CARD_LOCK = 0;
const cardLocked = () => T < CARD_LOCK,
  cardLockFor = (s) => (CARD_LOCK = T + s);

// Layout & klik kartu upgrade
const cl3 = () => {
  const sw = UW - SAFE.l - SAFE.r, // lebar area aman (di luar notch)
    cw = Math.min(230, (sw - 60) / 3),
    gp = 20,
    x0 = SAFE.l + (sw - (3 * cw + 2 * gp)) / 2;
  return { cw, gp, x0, ch: 186, y0: UH / 2 - 88 }; // tinggi memuat ikon SVG + nama + deskripsi 3 baris
};
function cardAt(x, y) {
  const c = cl3();
  for (let i = 0; i < 3; i++) {
    const cx = c.x0 + i * (c.cw + c.gp);
    if (x >= cx && x <= cx + c.cw && y >= c.y0 && y <= c.y0 + c.ch) return i;
  }
  return -1;
}
function pickCard(i) {
  if (!cards[i]) return;
  cards[i][2]();
  P.up[cards[i][0]] = (P.up[cards[i][0]] || 0) + 1; // catat stack upgrade
  P.rrNew = 0;
  S = 'play';
  snd(880, 0.15, 'triangle', 0.06);
  pf(P.x, P.y, 20, '#39ff88', 250, 0.6);
}

// Tombol REROLL di bawah kartu level-up (tekan R / klik / sentuh): acak ulang 3 kartu, memakai 1 reroll
function rerollBtn() {
  const c = cl3(),
    w = 200,
    h = 34;
  return { x: UW / 2 - w / 2, y: c.y0 + c.ch + 14, w, h };
}
const rerollHit = (x, y) => {
  const b = rerollBtn();
  return S == 'levelup' && x >= b.x - 6 && x <= b.x + b.w + 6 && y >= b.y - 6 && y <= b.y + b.h + 6;
};
function reroll() {
  if (S != 'levelup') return;
  if (P.rr <= 0) {
    snd(150, 0.12, 'sawtooth', 0.05);
    return;
  }
  P.rr--;
  P.rrNew = 0;
  rollCards();
  cardLockFor(CARD_DELAY_RR);
  snd(700, 0.1, 'triangle', 0.05);
  snd(1000, 0.1, 'sine', 0.04);
}
