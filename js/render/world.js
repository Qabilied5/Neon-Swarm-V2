// Menyusun semua gambar dunia game (dengan screen shake)
function drawWorld() {
  g.translate(R(-1, 1) * shake, R(-1, 1) * shake);
  drawOrbs();
  drawZones();
  drawHeals();
  drawBullets();
  drawEnemyBullets();
  drawEnemies();
  drawMarks();
  drawOrbitals();
  drawGhosts();
  drawDecoy();
  drawPlayer();
  drawAim();
  drawHazards();
  drawRings();
  drawBeams();
  drawArcs();
  drawVortex();
  drawFloatTexts();
  drawParticles();
}
