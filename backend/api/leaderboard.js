'use strict';
// Leaderboard NEON SWARM - Vercel Serverless Function + MongoDB Atlas.
//   GET  /api/leaderboard?limit=10  -> { ok, top: [{ name, score, wave, kills, at }] }
//   POST /api/leaderboard           -> body { name, score, wave, kills, time } -> { ok, improved, best, rank }
// Satu dokumen per nama (rekor terbaik). Skor dihitung di sisi klien, jadi server hanya memvalidasi,
// memeriksa kewajaran (plausibility), membatasi laju kirim per IP, dan membersihkan nama.
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const DB_NAME = process.env.MONGODB_DB || 'neonswarm';
const NAME_MAX = 16;
const TOP_DEFAULT = 10;
const TOP_MAX = 50;
const RL_WINDOW_S = 600; // jendela pembatasan laju (detik); harus sama dengan TTL index 'subs'
const RL_MAX = 8; // maks kiriman per IP per jendela
const LIMITS = { score: 5000000, wave: 99, kills: 100000, time: 6 * 3600 };

// ---------- CORS ----------
function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}
function originOk(origin) {
  if (!origin) return false;
  if (allowedOrigins().includes(origin)) return true;
  return process.env.ALLOW_LOCALHOST === '1' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

// ---------- MongoDB (koneksi dipakai ulang antar invocation) ----------
let dbPromise = null;
function getDb() {
  if (!dbPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) return Promise.reject(new Error('MONGODB_URI belum diset'));
    dbPromise = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 6000 })
      .connect()
      .then(async (cl) => {
        const db = cl.db(DB_NAME);
        await ensureIndexes(db);
        return db;
      })
      .catch((e) => {
        dbPromise = null; // coba lagi pada request berikutnya
        throw e;
      });
  }
  return dbPromise;
}
async function ensureIndexes(db) {
  try {
    await Promise.all([
      db.collection('scores').createIndex({ score: -1, at: 1 }),
      db.collection('subs').createIndex({ at: 1 }, { expireAfterSeconds: RL_WINDOW_S }), // TTL: catatan kiriman hilang otomatis
      db.collection('subs').createIndex({ iph: 1, at: 1 }),
    ]);
  } catch (e) {
    console.error('createIndex gagal (diabaikan):', e.message);
  }
}

// ---------- validasi ----------
function cleanName(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N} _.\-]/gu, '') // buang simbol / kontrol / tanda gabung (anti zalgo, anti HTML)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX)
    .trim();
}
const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

// Kewajaran statistik: 1 wave minimal 22 detik waktu-game, skor per kill terbatas (xp maks 8 x 10 x combo 6 = 480),
// boss memberi bonus besar. Ini BUKAN pengganti verifikasi server; hanya menolak angka yang jelas tidak mungkin.
function implausible(s) {
  if (s.wave > 2 + s.time / 20) return 'wave';
  if (s.kills > 30 * s.time + 100) return 'kills';
  if (s.score > s.kills * 480 + s.wave * 3000 + 5000) return 'score';
  return null;
}

function hashIp(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '')
    .split(',')[0]
    .trim();
  return crypto
    .createHash('sha256')
    .update((process.env.IP_SALT || 'neon-swarm') + ip)
    .digest('hex')
    .slice(0, 32);
}

// ---------- handler ----------
async function handleGet(req, res) {
  const lim = Number.parseInt(req.query && req.query.limit, 10);
  const limit = Number.isFinite(lim) ? Math.min(Math.max(lim, 1), TOP_MAX) : TOP_DEFAULT;
  const db = await getDb();
  const rows = await db
    .collection('scores')
    .find({}, { projection: { _id: 0, name: 1, score: 1, wave: 1, kills: 1, at: 1 } })
    .sort({ score: -1, at: 1 })
    .limit(limit)
    .toArray();
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60');
  return res.status(200).json({
    ok: true,
    top: rows.map((r) => ({
      name: r.name,
      score: r.score,
      wave: r.wave,
      kills: r.kills,
      at: r.at instanceof Date ? r.at.getTime() : r.at,
    })),
  });
}

async function handlePost(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = null;
    }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'Data tidak valid' });

  const name = cleanName(body.name);
  if (!name) return res.status(400).json({ ok: false, error: 'Nama tidak valid (huruf, angka, spasi, _ - . maks 16)' });
  const { score, wave, kills } = body;
  const time = typeof body.time === 'number' && Number.isFinite(body.time) ? Math.round(body.time) : NaN;
  if (
    !isInt(score, 1, LIMITS.score) ||
    !isInt(wave, 1, LIMITS.wave) ||
    !isInt(kills, 0, LIMITS.kills) ||
    !isInt(time, 0, LIMITS.time)
  )
    return res.status(400).json({ ok: false, error: 'Data skor tidak valid' });
  if (implausible({ score, wave, kills, time })) return res.status(422).json({ ok: false, error: 'Skor tidak wajar' });

  const db = await getDb();
  const iph = hashIp(req);
  const subs = db.collection('subs');
  const used = await subs.countDocuments({ iph, at: { $gt: new Date(Date.now() - RL_WINDOW_S * 1000) } });
  if (used >= RL_MAX) {
    res.setHeader('Retry-After', String(RL_WINDOW_S));
    return res.status(429).json({ ok: false, error: 'Terlalu banyak percobaan, coba lagi nanti' });
  }
  await subs.insertOne({ iph, at: new Date() });

  // satu dokumen per nama (huruf besar/kecil dianggap sama); hanya naik jika skor lebih tinggi
  const col = db.collection('scores');
  const key = name.toLowerCase();
  const doc = { name, score, wave, kills, time, at: new Date() };
  const up = await col.updateOne({ _id: key, score: { $lt: score } }, { $set: doc, $inc: { plays: 1 } });
  let improved = up.matchedCount === 1;
  if (!improved) {
    try {
      await col.insertOne({ _id: key, ...doc, plays: 1 });
      improved = true;
    } catch (e) {
      if (e && e.code !== 11000) throw e; // 11000 = nama sudah ada dengan skor >= ini
      await col.updateOne({ _id: key }, { $inc: { plays: 1 } });
    }
  }
  const cur = await col.findOne({ _id: key }, { projection: { score: 1 } });
  const best = cur ? cur.score : score;
  const rank = (await col.countDocuments({ score: { $gt: best } })) + 1;
  return res.status(200).json({ ok: true, improved, best, rank });
}

module.exports = async function handler(req, res) {
  const origin = (req.headers && req.headers.origin) || '';
  const ok = originOk(origin);
  res.setHeader('Vary', 'Origin');
  if (ok) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  try {
    if (req.method === 'OPTIONS') return res.status(ok ? 204 : 403).end();
    if (req.method === 'GET') return await handleGet(req, res);
    if (req.method === 'POST') {
      if (!ok) return res.status(403).json({ ok: false, error: 'Origin tidak diizinkan' });
      return await handlePost(req, res);
    }
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method tidak didukung' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Kesalahan server' });
  }
};
module.exports.cleanName = cleanName;
