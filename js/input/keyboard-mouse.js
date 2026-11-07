// Input keyboard & mouse
addEventListener('keydown', (e) => {
  K[e.code] = 1;
  if (e.code == 'Space') e.preventDefault();
  const c = e.code;
  if (c == 'KeyF') goFS();
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
  const u = uiHit(MU.x, MU.y);
  if (u) {
    uiAct(u);
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
