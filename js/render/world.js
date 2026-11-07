// Menyusun semua gambar dunia game (dengan screen shake)
function drawWorld() {
  g.translate(R(-1, 1) * shake, R(-1, 1) * shake);
  drawOrbs();
  drawBullets();
  drawEnemyBullets();
  drawEnemies();
  drawOrbitals();
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
