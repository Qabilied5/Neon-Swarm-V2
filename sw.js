// Service worker NEON SWARM - membuat game bisa dimainkan offline.
// Versi cache = angka ?v= pada URL sw.js (diambil dari <script src="js/core/pwa.js?v=N">).
// Rilis baru: cukup naikkan ?v= di index.html.
const V = new URL(self.location.href).searchParams.get('v') || '0',
  CACHE = 'neon-swarm-' + V;
const PLAIN = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/favicon-32.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];
const VERSIONED = [
  'css/style.css',
  'js/core/canvas.js',
  'js/core/pwa.js',
  'js/core/utils.js',
  'js/core/state.js',
  'js/core/audio.js',
  'js/core/ai.js',
  'js/data/texts.js',
  'js/data/upgrades.js',
  'js/data/enemies.js',
  'js/data/config.js',
  'js/game/init.js',
  'js/game/effects.js',
  'js/game/player.js',
  'js/enemies/spawn.js',
  'js/enemies/boss.js',
  'js/enemies/superboss.js',
  'js/enemies/secretboss.js',
  'js/combat/damage.js',
  'js/combat/skills.js',
  'js/update/player.js',
  'js/update/waves.js',
  'js/update/bullets.js',
  'js/update/enemies.js',
  'js/update/projectiles.js',
  'js/update/pickups.js',
  'js/update/fx.js',
  'js/update/secretboss.js',
  'js/update/index.js',
  'js/input/keyboard-mouse.js',
  'js/input/touch.js',
  'js/ui/cards.js',
  'js/ui/buttons.js',
  'js/ui/fullscreen.js',
  'js/ui/touch-layout.js',
  'js/ui/touch-hud.js',
  'js/ui/skill-hud.js',
  'js/render/primitives.js',
  'js/render/background.js',
  'js/render/entities.js',
  'js/render/aim.js',
  'js/render/effects.js',
  'js/render/world.js',
  'js/render/hud.js',
  'js/render/screens.js',
  'js/render/draw.js',
  'js/main.js',
]; // dimuat index.html dengan ?v=N

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll([...PLAIN, ...VERSIONED.map((u) => u + '?v=' + V)]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) =>
        Promise.all(
          ks.filter((k) => k.startsWith('neon-swarm-') && k != CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method != 'GET' || new URL(req.url).origin != self.location.origin) return;
  if (req.mode == 'navigate') {
    // halaman: online dulu (agar update cepat), offline pakai cache
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('index.html', copy));
          return res;
        })
        .catch(() => caches.match('index.html').then((r) => r || caches.match('./'))),
    );
    return;
  }
  // aset (berversi ?v=N): cache dulu, jaringan sebagai cadangan
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
