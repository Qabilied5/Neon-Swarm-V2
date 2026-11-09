// Menyusun semua gambar dunia game (dengan screen shake)
function drawWorld() {
  g.translate(R(-1, 1) * shake, R(-1, 1) * shake);
  drawOrbs();
  drawHeals();
  drawBullets();
  drawEnemyBullets();
  drawEnemies();
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
