'use strict';
// Tes handler tanpa database sungguhan: modul 'mongodb' diganti penyimpanan in-memory kecil.
// Jalankan: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('module');

function makeFake() {
  const cols = {};
  const match = (d, f) =>
    Object.entries(f).every(([k, c]) => {
      const v = d[k];
      if (c && typeof c === 'object' && !(c instanceof Date)) {
        if ('$lt' in c) return v < c.$lt;
        if ('$gt' in c) return v > c.$gt;
      }
      return v === c;
    });
  const col = (n) =>
    (cols[n] = cols[n] || {
      rows: [],
      async createIndex() {},
      async insertOne(d) {
        if (d._id !== undefined && this.rows.some((r) => r._id === d._id)) throw Object.assign(new Error('dup'), { code: 11000 });
        this.rows.push({ ...d });
      },
      async updateOne(f, u) {
        const r = this.rows.find((x) => match(x, f));
        if (!r) return { matchedCount: 0 };
        Object.assign(r, u.$set || {});
        for (const [k, v] of Object.entries(u.$inc || {})) r[k] = (r[k] || 0) + v;
        return { matchedCount: 1 };
      },
      async findOne(f) {
        return this.rows.find((x) => match(x, f)) || null;
      },
      async countDocuments(f) {
        return this.rows.filter((x) => match(x, f)).length;
      },
      find() {
        const self = this;
        let lim = 1e9, cmp = () => 0;
        const q = {
          sort(s) {
            const [[k, d], [k2, d2]] = Object.entries(s);
            cmp = (a, b) => (a[k] - b[k]) * d || (a[k2] - b[k2]) * d2;
            return q;
          },
          limit(n) {
            lim = n;
            return q;
          },
          async toArray() {
            return [...self.rows].sort(cmp).slice(0, lim).map(({ _id, ...r }) => r);
          },
        };
        return q;
      },
    });
  return { db: () => ({ collection: col }), cols };
}
const fake = makeFake();
class MongoClient {
  async connect() {
    return { db: () => fake.db() };
  }
}
const load = Module._load;
Module._load = function (req, ...a) {
  return req === 'mongodb' ? { MongoClient } : load.call(this, req, ...a);
};
process.env.MONGODB_URI = 'mongodb://fake';
process.env.ALLOWED_ORIGINS = 'https://me.github.io';
const handler = require('../api/leaderboard.js');

function call(method, { origin = 'https://me.github.io', body, query, ip = '1.1.1.1' } = {}) {
  return new Promise((resolve) => {
    const h = {};
    const res = {
      code: 200,
      setHeader: (k, v) => (h[k] = v),
      status(c) { this.code = c; return this; },
      json(o) { resolve({ code: this.code, body: o, h }); },
      end() { resolve({ code: this.code, h }); },
    };
    handler({ method, headers: { origin, 'x-forwarded-for': ip }, body, query }, res);
  });
}
const good = (o = {}) => ({ name: 'Andi', score: 1200, wave: 3, kills: 40, time: 80, ...o });

test('CORS: origin diizinkan / ditolak', async () => {
  const ok = await call('OPTIONS');
  assert.equal(ok.code, 204);
  assert.equal(ok.h['Access-Control-Allow-Origin'], 'https://me.github.io');
  assert.equal((await call('OPTIONS', { origin: 'https://evil.com' })).code, 403);
  assert.equal((await call('POST', { origin: 'https://evil.com', body: good() })).code, 403);
  assert.equal((await call('POST', { origin: '', body: good() })).code, 403);
});

test('POST valid -> tersimpan, rank 1', async () => {
  const r = await call('POST', { body: good() });
  assert.equal(r.code, 200);
  assert.deepEqual([r.body.improved, r.body.best, r.body.rank], [true, 1200, 1]);
});

test('skor lebih rendah untuk nama yang sama tidak menimpa', async () => {
  const r = await call('POST', { body: good({ name: 'ANDI', score: 500 }) });
  assert.equal(r.body.improved, false);
  assert.equal(r.body.best, 1200);
  const hi = await call('POST', { body: good({ name: 'andi', score: 2000, kills: 60, time: 100 }) });
  assert.equal(hi.body.improved, true);
});

test('GET top urut skor desc', async () => {
  await call('POST', { body: good({ name: 'Budi', score: 3000, kills: 80, time: 120, wave: 5 }) });
  const r = await call('GET', { query: { limit: '5' } });
  assert.equal(r.code, 200);
  assert.equal(r.body.top[0].name, 'Budi');
  assert.equal(r.body.top[1].name.toLowerCase(), 'andi');
  assert.ok(r.body.top[0].score > r.body.top[1].score);
  assert.ok(r.h['Cache-Control'].includes('s-maxage'));
});

test('validasi: nama kosong, tipe salah, di luar batas, tidak wajar', async () => {
  assert.equal((await call('POST', { body: good({ name: '<>!!' }) })).code, 400);
  assert.equal((await call('POST', { body: good({ score: '99' }) })).code, 400);
  assert.equal((await call('POST', { body: good({ score: -5 }) })).code, 400);
  assert.equal((await call('POST', { body: good({ wave: 0 }) })).code, 400);
  assert.equal((await call('POST', { body: good({ score: 4000000 }) })).code, 422);
  assert.equal((await call('POST', { body: good({ wave: 50, time: 60 }) })).code, 422);
  assert.equal((await call('POST', { body: 'bukan json' })).code, 400);
});

test('nama dibersihkan', () => {
  assert.equal(handler.cleanName('  <b>Rina</b>   Putri  '), 'bRinab Putri');
  assert.equal(handler.cleanName('x'.repeat(40)).length, 16);
  assert.equal(handler.cleanName(123), '');
});

test('rate limit per IP', async () => {
  let last;
  for (let i = 0; i < 10; i++) last = await call('POST', { ip: '9.9.9.9', body: good({ name: 'Rate' + i }) });
  assert.equal(last.code, 429);
  assert.ok(last.h['Retry-After']);
  assert.equal((await call('POST', { ip: '8.8.8.8', body: good({ name: 'Lain' }) })).code, 200);
});

test('method tidak didukung', async () => {
  assert.equal((await call('DELETE')).code, 405);
});
