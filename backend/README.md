# Backend leaderboard NEON SWARM

Vercel Serverless Function + MongoDB Atlas. Game (GitHub Pages) hanya mengirim data lewat HTTPS ke API ini; connection string database **tidak pernah** ada di kode game.

```
Game (GitHub Pages) -> HTTPS -> /api/leaderboard (Vercel) -> MongoDB Atlas
```

| Method | Fungsi |
| --- | --- |
| `GET /api/leaderboard?limit=10` | Top skor (maks 50). Dicache CDN 10 detik. |
| `POST /api/leaderboard` | Kirim `{ name, score, wave, kills, time }` -> `{ ok, improved, best, rank }` |

Satu dokumen per nama (huruf besar/kecil dianggap sama), hanya naik jika skor baru lebih tinggi.

## 1. MongoDB Atlas
1. Buat cluster gratis (M0). Dari Jakarta, pilih region **Singapore (ap-southeast-1)**.
2. **Database Access** -> buat user dengan password kuat, role **readWrite** hanya pada database `neonswarm`.
3. **Network Access** -> tambahkan `0.0.0.0/0`. Vercel memakai IP yang berubah-ubah, jadi tidak bisa di-whitelist per IP; keamanannya bergantung pada password user di atas.
4. **Connect -> Drivers** -> salin connection string (`mongodb+srv://...`).

Koleksi & index (`scores`, `subs`) dibuat otomatis saat request pertama.

## 2. Deploy ke Vercel
1. Import repo di Vercel, set **Root Directory = `backend`**.
2. Isi Environment Variables (lihat `.env.example`):
   - `MONGODB_URI` - connection string Atlas
   - `ALLOWED_ORIGINS` - `https://USERNAME.github.io` (tanpa path, tanpa `/` di akhir)
   - `IP_SALT` - string acak panjang
   - `MONGODB_DB` (opsional, bawaan `neonswarm`)
3. Deploy. `vercel.json` memasang fungsi di region `sin1` (Singapore) agar dekat dengan Atlas; ubah jika cluster Anda di region lain.
4. Tes: buka `https://PROJECT.vercel.app/api/leaderboard` -> `{"ok":true,"top":[]}`.

## 3. Sambungkan game
Di `js/net/leaderboard.js` ubah:

```js
const LB_API = 'https://PROJECT.vercel.app/api/leaderboard';
```

Selama masih berisi `GANTI-DENGAN-PROJECT-ANDA`, fitur leaderboard nonaktif dan game berjalan seperti biasa.

## Keamanan - yang perlu diketahui
Skor dihitung di browser, jadi **tidak ada cara memastikan 100% skor asli**. Yang sudah ada: batas nilai & tipe data, pemeriksaan kewajaran (wave vs waktu, kills vs waktu, skor vs kills), pembatasan 8 kiriman / 10 menit per IP (IP disimpan hanya sebagai hash), CORS hanya untuk origin game, nama dibersihkan dari simbol/HTML. Pemain yang sengaja memalsukan request masih bisa menembus skor yang "masuk akal". Jika leaderboard mulai dicurangi, langkah berikutnya: token sesi bertanda tangan dari server yang diminta saat game mulai (membuktikan lama bermain) dan hapus entri curang langsung dari Atlas.

Tidak ada login: siapa pun bisa memakai nama yang sama dengan pemain lain (skor hanya bisa naik, tidak bisa menimpa jadi lebih rendah).

## Tes
```
cd backend
npm install
npm test        # handler diuji dengan database tiruan in-memory
```
