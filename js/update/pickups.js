// Orb XP, level up, pilihan kartu
function updOrbs(dt) {
  for (let i = O.length - 1; i >= 0; i--) {
    const o = O[i],
      d = Math.hypot(P.x - o.x, P.y - o.y);
    if (d < P.mag) {
      o.x += ((P.x - o.x) / d) * 420 * dt;
      o.y += ((P.y - o.y) / d) * 420 * dt;
    }
    if (d < P.r + 6) {
      O.splice(i, 1);
      P.xp += o.v * (1 + XPB_PCT * P.xpb); // XP SURGE
      snd(900, 0.04, 'sine', 0.03);
      if (P.xp >= P.need) {
        P.xp -= P.need;
        P.lv++;
        P.need = Math.round(P.need * 1.35 + 2);
        rollCards();
        // REROLL: tiap naik level diundi 1-3 kali (diisi ulang, tidak menumpuk)
        P.rr = rrRoll() + P.luck * LUCK_RR; // undian 1-3 reroll + LUCKY CHARM (+2/stack) / GOLD RUSH
        P.rrNew = Math.max(0, P.rr - 1); // tampilan: bonus di atas 1 reroll
        if (ev('ascend')) {
          // ASCENDANT: heal 100% + ledakan cahaya besar yang makin kuat tiap level
          P.hp = P.mh;
          shock(P.x, P.y, ascR(), ascD(), '#ffd166');
          RG.push({ x: P.x, y: P.y, r: 0, mr: ascR() * 1.3, c: '#fff', w: 4, l: 0.6, m: 0.6 });
          if (FT.length < 80) FT.push({ x: P.x, y: P.y - P.r - 24, t: 1.2, s: 'ASCEND Lv' + P.lv, c: '#ffd166', z: 20 });
        }
        S = 'levelup';
        cardLockFor(CARD_DELAY); // HP: abaikan sentuhan sesaat agar kartu tidak terpilih tanpa sengaja
        RG.push({ x: P.x, y: P.y, r: 0, mr: 280, c: '#ffd166', w: 7, l: 0.7, m: 0.7 });
        snd(660, 0.3, 'triangle', 0.07);
        pf(P.x, P.y, 30, '#ffd166', 300, 0.8);
      }
    }
  }
}

// Bahan dasar dari Evo yang ditandai REKOMENDASI dan belum dimiliki -> bobot muncul x(1 + REC_BOOST). Lainnya bobot 1 (adil).
const recWanted = (n) => !(P.up[n] > 0) && EVO.some((v) => P.rec[v.id] && v.rec.includes(n)),
  cardWeight = (u) => (recWanted(u[0]) ? 1 + REC_BOOST : 1);
// ambil k item berbeda dari pool secara acak berbobot (tanpa pengembalian)
function pickWeighted(pool, k) {
  pool = [...pool];
  const out = [];
  while (out.length < k && pool.length) {
    const ws = pool.map(cardWeight);
    let r = Math.random() * ws.reduce((a, b) => a + b, 0),
      i = 0;
    for (; i < pool.length - 1; i++) {
      r -= ws[i];
      if (r < 0) break;
    }
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

// Acak 3 kartu level-up (dipakai saat naik level & saat REROLL)
function rollCards() {
  cards = pickWeighted(UP.filter((u) => !u[5] || (P.up[u[0]] || 0) < u[5]), 3); // upgrade ber-batas stack disembunyikan setelah maksimal
  if (P.lv == 2) {
    // skill pertama = Q/E/R (Teleport tidak); tanpa kartu kembar
    const sk = pick(UP.filter((u) => u[0].startsWith('SKILL') && !u[0].includes('TELEPORT')));
    cards = [sk, ...cards.filter((c) => c !== sk).slice(0, 2)];
  }
}

// Free Heal: item hijau melayang, memulihkan FH_HP HP saat disentuh pemain
function spawnHeal() {
  let x = W / 2,
    y = H / 2;
  for (let i = 0; i < 12; i++) {
    x = R(W * 0.12, W * 0.88); // jauhi tepi (tertutup tombol sentuh / HUD)
    y = R(H * 0.15, H * 0.85);
    if (Math.hypot(x - P.x, y - P.y) > 140) break; // jangan langsung menempel di pemain
  }
  HL.push({ x, y, ph: R(0, TAU) });
  RG.push({ x, y, r: 0, mr: 60, c: '#39ff88', w: 4, l: 0.4, m: 0.4 });
  pf(x, y, 12, '#39ff88', 160, 0.5);
  snd(700, 0.15, 'sine', 0.04);
}
function updHeals() {
  for (let i = HL.length - 1; i >= 0; i--) {
    const h = HL[i];
    if (Math.hypot(P.x - h.x, P.y - h.y) < P.r + 16 * ZK) {
      HL.splice(i, 1);
      P.hp = Math.min(P.mh, P.hp + FH_HP);
      RG.push({ x: h.x, y: h.y, r: 0, mr: 90, c: '#39ff88', w: 6, l: 0.5, m: 0.5 });
      pf(h.x, h.y, 24, '#39ff88', 260, 0.7);
      if (FT.length < 80) FT.push({ x: P.x, y: P.y - P.r - 10, t: 1, s: '+' + FH_HP + ' HP', c: '#39ff88', z: 18 });
      snd(520, 0.3, 'triangle', 0.07);
      snd(780, 0.3, 'sine', 0.05);
    }
  }
}
