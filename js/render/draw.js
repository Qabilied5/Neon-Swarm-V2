// draw() = urutan render per frame
function draw() {
  g.save();
  drawBackground();
  if (S != 'menu' && P) drawWorld();
  g.restore();
  g.save();
  drawOverlayFx();
  drawHud();
  uiDraw();
  drawMenu();
  drawPause();
  drawLevelup();
  drawDead();
  g.restore();
}
