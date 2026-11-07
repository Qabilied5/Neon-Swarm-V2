// Helper umum: TAU, R (random), cl (clamp), pick, shuf
const TAU = Math.PI * 2,
  R = (a, b) => a + Math.random() * (b - a),
  cl = (v, a, b) => Math.max(a, Math.min(b, v)),
  pick = (a) => a[(Math.random() * a.length) | 0],
  shuf = (a) => [...a].sort(() => Math.random() - 0.5);
