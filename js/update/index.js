// upd(dt) = urutan pembaruan per frame (memanggil file update/* lainnya)
function upd(dt) {
  t += dt;
  updPlayer(dt);
  updWaves(dt);
  updBullets(dt);
  updEnemies(dt);
  updEnemyBullets(dt);
  updHazards(dt);
  updOrbs(dt);
  updParticles(dt);
  updVortex(dt);
  updTimers(dt);
}
