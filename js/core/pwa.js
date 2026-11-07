// PWA & perilaku app mobile: service worker (offline), tombol install, wake lock, blok gesture browser
const STANDALONE =
    matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches ||
    navigator.standalone === true, // sudah terpasang sebagai app
  IOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform == 'MacIntel' && navigator.maxTouchPoints > 1);
const APP_V = (() => {
  try {
    return new URL(document.currentScript.src).searchParams.get('v') || '0';
  } catch (e) {
    return '0';
  }
})(); // versi diambil dari ?v= pada <script> ini: naikkan di index.html saat rilis
let installEv = null,
  installShown = false,
  wakeLock = null;

// Service worker hanya jalan di https atau localhost (di file:// game tetap jalan, tapi tidak offline/installable)
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol))
  addEventListener('load', () =>
    navigator.serviceWorker.register('sw.js?v=' + APP_V).catch(() => {}),
  );

// Tombol INSTALL (Android/Chrome/Edge) - hanya tampil di menu
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEv = e;
});
addEventListener('appinstalled', () => (installEv = null));
function syncInstallBtn() {
  const show = !!installEv && S == 'menu' && !STANDALONE;
  if (show == installShown) return;
  installShown = show;
  const b = document.getElementById('install');
  if (b) b.style.display = show ? 'block' : 'none';
}
addEventListener('DOMContentLoaded', () => {
  const b = document.getElementById('install');
  if (b)
    b.addEventListener('click', async () => {
      if (!installEv) return;
      installEv.prompt();
      try {
        await installEv.userChoice;
      } catch (e) {}
      installEv = null;
    });
});

// Layar tetap menyala saat bermain
async function keepAwake() {
  try {
    if (navigator.wakeLock && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => (wakeLock = null));
    }
  } catch (e) {}
}
addEventListener('touchstart', keepAwake, { passive: true });
addEventListener('click', keepAwake);
addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (S == 'play') S = 'pause'; // app ke background -> pause otomatis
  } else keepAwake();
});

// Matikan menu long-press & pinch-zoom bawaan browser
addEventListener('contextmenu', (e) => e.preventDefault());
addEventListener('gesturestart', (e) => e.preventDefault());
