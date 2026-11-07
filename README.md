# NEON SWARM

Game arcade survival berbasis canvas, bisa dimainkan di desktop dan **HP (landscape)**, dan bisa dipasang sebagai **PWA**.

## Menjalankan

- **Cepat (desktop):** buka `index.html` langsung di browser.
- **PWA / install / offline:** harus lewat **HTTPS** atau `localhost`, misalnya `npx serve .` atau `python3 -m http.server`, atau hosting GitHub Pages / Netlify / Vercel. Dari `file://` game tetap jalan tapi tidak bisa diinstal.
  - Android (Chrome/Edge): tombol **INSTAL APP** muncul di menu.
  - iPhone/iPad (Safari): Bagikan → **Tambah ke Layar Utama**.

## Kontrol

| | Desktop | Mobile (landscape) |
|---|---|---|
| Gerak | WASD / panah | stik kiri (melayang di setengah kiri layar) |
| Bidik | mouse (tembak otomatis) | tahan tombol serang kanan -> muncul lingkaran bidik, geser jari untuk menggerakkan lingkaran ke mana saja; pemain menembak ke arah lingkaran selama ditahan |
| Dash | Space / klik kanan | **double-tap cepat** di area serang kanan (hanya memicu dash); arah dash = stik kiri yang sedang ditahan, jika tidak -> arah gerak terakhir. Tombol DASH juga tetap ada |
| Skill | Q / E / R | tombol Q / E / R |
| Heal | C (cooldown 60 dtk) | tombol ✚ |
| Pause | P | tombol pause |
| Atur HUD | - | tombol **HUD** (kanan atas) di menu / pause |

## Atur HUD (mobile)

Tombol **HUD** di menu utama / layar pause membuka editor tata letak kontrol:

- **Seret** tombol DASH, Q, E, R, ✚ untuk memindahkannya; pilih lalu **− / +** untuk mengubah ukurannya.
- **Area gerak** (hijau, tempat stik gerak muncul) dan **area serang** (merah, tahan = tembak, double-tap = dash): seret untuk memindahkan, tarik sudut **◢** untuk mengubah luas, atau pakai − / +.
- **GARIS AREA: ON** menampilkan garis tepi kedua area saat bermain. **RESET** (tekan 2x) mengembalikan tata letak bawaan.
- Pengaturan tersimpan otomatis di perangkat (`localStorage` kunci `ns_hud`).

## Leaderboard online (opsional)

Skor dihitung lokal. Saat **game over**, tombol **KIRIM SKOR** (desktop: tombol `S`) membuka dialog untuk mengisi nama; baru setelah ditekan KIRIM, nama + skor dikirim lewat HTTPS ke API di Vercel dan disimpan di MongoDB Atlas (folder `backend/`, panduan di `backend/README.md`).

- **TOP 3** tampil di menu dan layar pause saat online. Top 10 di-cache di `localStorage` (`ns_lb`), diperbarui saat game dibuka, saat pause, dan setelah kirim skor.
- Saat bermain, skor dibandingkan dengan cache (tanpa jaringan). Melewati skor pemain lain memunculkan notifikasi kecil kiri atas: *"Mengalahkan skor NAMA (12345)"*.
- Aktifkan dengan mengisi `LB_API` di `js/net/leaderboard.js`. Dibiarkan placeholder = fitur mati, game tetap jalan offline.

## Rilis versi baru

Naikkan angka `?v=` pada **semua** tag `<script>`/`<link>` di `index.html` (cari-ganti). Angka itu juga dipakai `sw.js` sebagai versi cache (dibaca dari `core/pwa.js?v=N`), jadi pemain mendapat update otomatis dan cache lama dibuang.

## Struktur

```
index.html  manifest.webmanifest  sw.js
css/style.css
icons/      icon-192/512, icon-maskable-512, apple-touch-icon, favicon, icon.svg
js/
  core/canvas.js                  Setup canvas, ukuran layar (W,H), safe-area (notch), deteksi portrait, resize
  core/pwa.js                     PWA & perilaku app mobile: service worker (offline), tombol install, wake lock, blok gesture browser
  core/utils.js                   Helper umum: TAU, R (random), cl (clamp), pick, shuf
  core/state.js                   Semua variabel state global game (P, E, B, wave, score, S=state layar, dll)
  core/audio.js                   Efek suara sederhana (WebAudio) - snd()
  core/ai.js                      AI opsional (Ollama lokal) untuk ejekan boss & epitaf; fallback jika offline
  data/texts.js                   Daftar kalimat ejekan boss, secret boss & epitaf cadangan
  data/upgrades.js                Daftar upgrade level-up (UP) - tambah upgrade baru di sini
  data/enemies.js                 Definisi stat musuh (ET) - tambah tipe musuh baru di sini
  data/config.js                  Konstanta balance: tier(wave), LET (zona maut), SUP (super boss), heal, orbital blade, wave secret boss
  game/init.js                    init() = reset & mulai game, banner() = teks tengah layar
  game/effects.js                 pf() = efek partikel
  game/player.js                  Aksi pemain: dash(), hurt(), die()
  enemies/spawn.js                spawn(), edge(), evolve() (evolusi tier), blast() (ledakan bomber)
  enemies/boss.js                 spawnBoss() & spawnSuper() - kemunculan boss
  enemies/superboss.js            AI & pola serangan Super Boss (sup())
  enemies/secretboss.js           spawnSecret() - Secret Boss "Prism Sentinel": diam di tengah, hanya laser layar penuh
  combat/damage.js                kill(), hit(), chain() petir, boom() ledakan peluru
  combat/skills.js                Skill aktif: nova() Q, laser() E, hole() R
  update/player.js                Gerak, bidik (mouse / tombol serang sentuh / auto), dash, tembak otomatis pemain
  update/waves.js                 Timer wave & spawn musuh
  update/bullets.js               Gerak & tabrakan peluru pemain
  update/enemies.js               AI per tipe musuh + tabrakan dengan pemain + orbital blade
  update/projectiles.js           Peluru musuh & hazard (ring/beam/laser) musuh
  update/pickups.js               Orb XP, level up, pilihan kartu
  update/fx.js                    Partikel, vortex black hole, timer efek, combo
  update/secretboss.js            AI Secret Boss: diam, menembakkan pola laser layar penuh dengan pre-laser (garis kuning peringatan)
  update/index.js                 upd(dt) = urutan pembaruan per frame (memanggil file update/* lainnya)
  input/keyboard-mouse.js         Input keyboard & mouse
  input/touch.js                  Input sentuh: jari kiri = stik gerak, jari kanan = tombol serang (geser untuk bidik, double-tap = dash) + skill
  ui/cards.js                     Layout & klik kartu upgrade
  ui/buttons.js                   Tombol UI kecil (fullscreen, pause) + hit test
  ui/fullscreen.js                Fungsi fullscreen
  ui/touch-layout.js              Layout kontrol sentuh (landscape) + konfigurasi HUD (HC: area gerak/serang, posisi & ukuran tombol, disimpan ke localStorage)
  net/leaderboard.js              Leaderboard online: cache top skor, notif, dialog kirim skor (lihat backend/)
  ui/hud-edit.js                  Editor HUD sentuh (tombol HUD di menu/pause): seret/ubah ukuran tombol & area gerak/serang
  ui/touch-hud.js                 Gambar kontrol sentuh: stik kiri, tombol serang (dengan knob bidik), tombol dash & skill
  ui/skill-hud.js                 Gambar ikon skill Q/E/R + heal C di desktop
  render/primitives.js            Helper gambar: poly(), neon(), tx() teks, bar()
  render/background.js            Latar & grid
  render/entities.js              Gambar orb, peluru, musuh, pemain
  render/aim.js                   Garis bidik (khusus sentuh): redup = bidik otomatis, terang + panah = bidik manual
  render/effects.js               Gambar hazard, pre-laser, ring, beam, petir, vortex, teks damage, partikel
  render/world.js                 Menyusun semua gambar dunia game (dengan screen shake)
  render/hud.js                   Vignette, flash merah, HUD (HP, XP, skor, wave, boss bar)
  render/screens.js               Layar menu, pause, level-up, game over
  render/draw.js                  draw() = urutan render per frame
  main.js                         Game loop - HARUS dimuat paling akhir
```

## Catatan pengembangan

- Semua file JS adalah script klasik yang berbagi scope global (bukan ES module). Urutan `<script>` di `index.html` penting; `main.js` harus terakhir.
- State global (P, E, B, wave, score, S, dll) ada di `js/core/state.js`. `S` = `menu | play | pause | levelup | dead`.
- Jika menambah file JS baru: daftarkan di `index.html` **dan** di daftar `VERSIONED` pada `sw.js` supaya ikut tersedia offline.
- Hindari `shadowBlur` pada garis layar penuh (sangat berat); lihat `render/effects.js` (`drawLasers`).

## Cara menambah sesuatu

| Mau tambah... | Edit file... |
| --- | --- |
| Upgrade baru | `data/upgrades.js` |
| Tipe musuh baru | `data/enemies.js` (stat) + `update/enemies.js` (AI) + `enemies/spawn.js` / `update/waves.js` (kapan muncul) |
| Skill baru | `combat/skills.js` + tombol di `input/keyboard-mouse.js`, `ui/skill-hud.js`, dan `TBTN` di `ui/touch-layout.js` |
| Posisi / ukuran tombol sentuh | `ui/touch-layout.js` (sudut `a` & radius `r` per tombol) |
| Pola / kesulitan secret boss | `update/secretboss.js`, `enemies/secretboss.js`, `data/config.js` (`SEC_WAVES`) |
| Balance wave | `data/config.js`, `update/waves.js` |
| HUD | `render/hud.js` |
| Menu / game over | `render/screens.js` |

Tips hemat token saat prompting: sebutkan hanya file yang relevan (mis. "ubah `js/ui/touch-layout.js`").
