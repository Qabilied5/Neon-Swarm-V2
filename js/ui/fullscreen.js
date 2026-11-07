// Fungsi fullscreen
const inFS = () => document.fullscreenElement || document.webkitFullscreenElement;
function enterFS() {
  try {
    const el = document.documentElement,
      f = el.requestFullscreen || el.webkitRequestFullscreen;
    if (f) {
      const p = f.call(el);
      p && p.then && p.then(() => screen.orientation.lock('landscape')).catch(() => {});
    }
  } catch (e) {}
}
function goFS() {
  if (inFS()) {
    try {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } catch (e) {}
  } else enterFS();
}
