// Input keyboard & mouse
addEventListener('keydown', (e) => {
  if (LB.open) return; // sedang mengetik nama di dialog kirim skor
  if (RK.on) {
    // layar ranking: Esc / Enter / Spasi / Backspace = kembali
    if (['Escape', 'Enter', 'Space', 'Backspace', 'NumpadEnter'].includes(e.code)) {
      e.preventDefault();
      rankTap();
    }
    return;
  }
  K[e.code] = 1;
  if (e.code == 'Space') e.preventDefault();
  const c = e.code;
  if (c == 'KeyF') goFS();
  if (S == 'dead' && c == 'KeyS' && lbBtn()) {
    lbOpen();
    e.preventDefault();
    return;
  }
  if (S == 'menu' || S == 'dead') {
    if ((c == 'Enter' || c == 'Space') && deadT <= 0) init();
    return;
  }
  if (c == 'KeyM') mute = !mute;
  if (c == 'KeyP' || c == 'Escape') {
    if (S == 'play') S = 'pause';
    else if (S == 'pause') S = 'play';
  }
  if (S == 'levelup' && '123'.includes(e.key)) pickCard(+e.key - 1);
  if (S == 'play') {
    if (c == 'Space') dash();
    if (c == 'KeyQ') nova();
    if (c == 'KeyE') laser();
    if (c == 'KeyR') hole();
    if (c == 'KeyT') teleport(); // ke posisi kursor (maks TP_RANGE)
    if (c == 'KeyC') heal();
  }
});
addEventListener('keyup', (e) => (K[e.code] = 0));
addEventListener('mousemove', (e) => {
  M.x = e.clientX / ZM;
  M.y = e.clientY / ZM;
  MU.x = e.clientX;
  MU.y = e.clientY;
});
addEventListener('mousedown', (e) => {
  M.x = e.clientX / ZM;
  M.y = e.clientY / ZM;
  MU.x = e.clientX;
  MU.y = e.clientY;
  if (RK.on) {
    rankTap(); // klik di mana saja = kembali
    return;
  }
  const u = uiHit(MU.x, MU.y);
  if (u) {
    uiAct(u);
    return;
  }
  if (S == 'play' && TUT.on) {
    const k = tutBtnAt(MU.x, MU.y);
    if (k) {
      tutAct(k); // LEWATI / KELUAR / MAIN / MENU
      return;
    }
  }
  if (S == 'pause') {
    const k = pauseBtnAt(MU.x, MU.y);
    if (k) pauseAct(k);
    return;
  }
  const mb = menuBtnHit(MU.x, MU.y);
  if (mb) {
    if (mb == 'rank') rankOpen(); // tombol RANKING
    else tutStart(); // tombol TUTORIAL
    return;
  }
  if (S == 'dead' && lbBtnHit(MU.x, MU.y)) {
    e.preventDefault(); // jangan biarkan klik mencuri fokus dari input nama
    lbOpen();
    return;
  }
  if ((S == 'menu' || S == 'dead') && deadT <= 0) init();
  else if (S == 'levelup') {
    const i = cardAt(MU.x, MU.y);
    if (i >= 0) pickCard(i);
  }
});
addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (S == 'play') dash();
});
