'use strict';

const modal         = document.getElementById('startup-modal');
const startBtn      = document.getElementById('start-btn');
const scanningHud   = document.getElementById('scanning-hud');
const backBtn       = document.getElementById('back-btn');
const scanHint      = document.getElementById('scan-hint');
const playerOverlay = document.getElementById('player-overlay');
const playerFlag    = document.getElementById('player-flag');
const playerName    = document.getElementById('player-name');
const arContainer   = document.getElementById('ar-container');

const PLAYERS = [
  { index: 0, name: 'MIGUEL ALMIRÓN', flag: '🇵🇾', entityId: 'target-almiron' },
  { index: 1, name: 'VOZINHA',        flag: '🇨🇻', entityId: 'target-vozinha' },
];

let activeTarget = null;

startBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  document.body.classList.remove('show-modal');
  document.body.classList.add('ar-active');
  injectAndStartAR();
});

backBtn.addEventListener('click', () => {
  destroyAR();
  document.body.classList.add('show-modal');
  document.body.classList.remove('ar-active');
  modal.classList.remove('hidden');
});

function injectAndStartAR() {
  arContainer.innerHTML = `
    <a-scene
      id="ar-scene"
      mindar-image="imageTargetSrc: assets/targets/targets.mind; filterMinCF:0.001; filterBeta:100; missTolerance:10; warmupTolerance:5; uiLoading: no; uiError: no;"
      renderer="colorManagement: true"
      vr-mode-ui="enabled: false"
      device-orientation-permission-ui="enabled: false"
    >
      <a-assets>
        <a-asset-item id="almiron-model" src="assets/models/AlmironMiguel-optimized.glb"></a-asset-item>
        <a-asset-item id="vozinha-model" src="assets/models/vozinha-optimized.glb"></a-asset-item>
      </a-assets>

      <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

      <a-entity id="target-almiron" mindar-image-target="targetIndex: 0">
        <a-gltf-model
          src="#almiron-model"
          position="0 0 0"
          scale="10 10 10"
          rotation="0 0 0"
          animation-mixer="clip: *; loop: repeat; timeScale: 1">
        </a-gltf-model>
      </a-entity>

      <a-entity id="target-vozinha" mindar-image-target="targetIndex: 1">
        <a-gltf-model
          src="#vozinha-model"
          position="0 0 0"
          scale="20 20 20"
          rotation="0 0 0"
          animation-mixer="clip: *; loop: repeat; timeScale: 1">
        </a-gltf-model>
      </a-entity>

    </a-scene>
  `;

  scanningHud.classList.remove('hidden');

  const arScene = document.getElementById('ar-scene');
  arScene.addEventListener('loaded', () => {
    PLAYERS.forEach(player => registerTargetEvents(player));
  }, { once: true });
}

function destroyAR() {
  const arScene = document.getElementById('ar-scene');
  if (arScene) {
    try {
      const sys = arScene.systems['mindar-image-system'];
      if (sys && sys.stop) sys.stop();
    } catch (e) {}
  }
  arContainer.innerHTML = '';
  activeTarget = null;
  scanHint.style.opacity = '1';
  playerOverlay.classList.add('hidden');
  scanningHud.classList.add('hidden');
}

function registerTargetEvents(player) {
  const entity = document.getElementById(player.entityId);
  if (!entity) return;

  entity.addEventListener('targetFound', () => {
    console.log('ENCONTRADO:', player.name);
    activeTarget = player.index;
    scanHint.style.opacity = '0';
    playerFlag.textContent = player.flag;
    playerName.textContent = player.name;
    playerOverlay.classList.remove('hidden');
  });

  entity.addEventListener('targetLost', () => {
    console.log('PERDIDO:', player.name);
    if (activeTarget === player.index) activeTarget = null;
    playerOverlay.classList.add('hidden');
    scanHint.style.opacity = '1';
  });
}