// Efek suara sederhana (WebAudio) - snd()
let AC;
function snd(f, d = 0.08, ty = 'square', v = 0.04) {
  if (mute) return;
  try {
    AC = AC || new AudioContext();
    const o = AC.createOscillator(),
      a = AC.createGain();
    o.type = ty;
    o.frequency.value = f;
    a.gain.value = v;
    a.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + d);
    o.connect(a);
    a.connect(AC.destination);
    o.start();
    o.stop(AC.currentTime + d);
  } catch (e) {}
}
