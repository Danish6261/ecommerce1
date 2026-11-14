import * as THREE from 'three';

export interface ProceduralTextureSet {
  woolMap: THREE.CanvasTexture;
  woolBump: THREE.CanvasTexture;
  leatherMap: THREE.CanvasTexture;
  leatherBump: THREE.CanvasTexture;
  stoneMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  // 1. Herringbone Wool Weave (Albedo + Bump)
  const woolCanvas = document.createElement('canvas');
  woolCanvas.width = 256;
  woolCanvas.height = 256;
  const wCtx = woolCanvas.getContext('2d')!;
  wCtx.fillStyle = '#36383c';
  wCtx.fillRect(0, 0, 256, 256);

  const woolBumpCanvas = document.createElement('canvas');
  woolBumpCanvas.width = 256;
  woolBumpCanvas.height = 256;
  const wbCtx = woolBumpCanvas.getContext('2d')!;
  wbCtx.fillStyle = '#808080';
  wbCtx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 4) {
    for (let x = 0; x < 256; x += 8) {
      const col = Math.floor(x / 16) % 2;
      const offset = col === 0 ? (y % 16) / 2 : 8 - (y % 16) / 2;
      const shade = (x + y) % 16 === 0 ? 68 : 48;
      wCtx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 5})`;
      wCtx.fillRect((x + offset) % 256, y, 4, 2);

      const bumpShade = (x + y) % 16 === 0 ? 185 : 95;
      wbCtx.fillStyle = `rgb(${bumpShade}, ${bumpShade}, ${bumpShade})`;
      wbCtx.fillRect((x + offset) % 256, y, 4, 2);
    }
  }

  const woolMap = new THREE.CanvasTexture(woolCanvas);
  woolMap.wrapS = woolMap.wrapT = THREE.RepeatWrapping;
  woolMap.repeat.set(5, 5);
  woolMap.colorSpace = THREE.SRGBColorSpace;
  woolMap.anisotropy = maxAnisotropy;

  const woolBump = new THREE.CanvasTexture(woolBumpCanvas);
  woolBump.wrapS = woolBump.wrapT = THREE.RepeatWrapping;
  woolBump.repeat.set(5, 5);
  woolBump.anisotropy = maxAnisotropy;

  // 2. Full-Grain Bridle Leather (Albedo + Bump)
  const leatherCanvas = document.createElement('canvas');
  leatherCanvas.width = 256;
  leatherCanvas.height = 256;
  const lCtx = leatherCanvas.getContext('2d')!;
  lCtx.fillStyle = '#3b261d';
  lCtx.fillRect(0, 0, 256, 256);

  const leatherBumpCanvas = document.createElement('canvas');
  leatherBumpCanvas.width = 256;
  leatherBumpCanvas.height = 256;
  const lbCtx = leatherBumpCanvas.getContext('2d')!;
  lbCtx.fillStyle = '#787878';
  lbCtx.fillRect(0, 0, 256, 256);

  // Deterministic pseudo-random grain cells
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 2400; i++) {
    const px = rand() * 256;
    const py = rand() * 256;
    const r = 1.2 + rand() * 2.4;
    const v = Math.floor(42 + rand() * 26);
    lCtx.fillStyle = `rgba(${v + 16}, ${v}, ${v - 8}, 0.45)`;
    lCtx.beginPath();
    lCtx.arc(px, py, r, 0, Math.PI * 2);
    lCtx.fill();

    const bv = Math.floor(110 + rand() * 90);
    lbCtx.fillStyle = `rgba(${bv}, ${bv}, ${bv}, 0.55)`;
    lbCtx.beginPath();
    lbCtx.arc(px, py, r * 0.85, 0, Math.PI * 2);
    lbCtx.fill();
  }

  const leatherMap = new THREE.CanvasTexture(leatherCanvas);
  leatherMap.wrapS = leatherMap.wrapT = THREE.RepeatWrapping;
  leatherMap.repeat.set(3, 3);
  leatherMap.colorSpace = THREE.SRGBColorSpace;
  leatherMap.anisotropy = maxAnisotropy;

  const leatherBump = new THREE.CanvasTexture(leatherBumpCanvas);
  leatherBump.wrapS = leatherBump.wrapT = THREE.RepeatWrapping;
  leatherBump.repeat.set(3, 3);
  leatherBump.anisotropy = maxAnisotropy;

  // 3. Honed Travertine Pedestal Map
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = 256;
  stoneCanvas.height = 256;
  const sCtx = stoneCanvas.getContext('2d')!;
  sCtx.fillStyle = '#e8e4da';
  sCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 450; i++) {
    const sx = rand() * 256;
    const sy = rand() * 256;
    const sw = 4 + rand() * 26;
    const sh = 1 + rand() * 2.5;
    const shade = Math.floor(210 + rand() * 25);
    sCtx.fillStyle = `rgba(${shade}, ${shade - 4}, ${shade - 10}, 0.45)`;
    sCtx.fillRect(sx, sy, sw, sh);
  }
  const stoneMap = new THREE.CanvasTexture(stoneCanvas);
  stoneMap.wrapS = stoneMap.wrapT = THREE.RepeatWrapping;
  stoneMap.repeat.set(2, 2);
  stoneMap.colorSpace = THREE.SRGBColorSpace;
  stoneMap.anisotropy = maxAnisotropy;

  // 4. Soft Radial Contact Shadow Plane Map
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const shCtx = shadowCanvas.getContext('2d')!;
  const grad = shCtx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0, 'rgba(20, 18, 16, 0.72)');
  grad.addColorStop(0.55, 'rgba(20, 18, 16, 0.28)');
  grad.addColorStop(1, 'rgba(20, 18, 16, 0)');
  shCtx.fillStyle = grad;
  shCtx.fillRect(0, 0, 256, 256);
  const contactShadowMap = new THREE.CanvasTexture(shadowCanvas);

  return {
    woolMap,
    woolBump,
    leatherMap,
    leatherBump,
    stoneMap,
    contactShadowMap,
    dispose: () => {
      woolMap.dispose();
      woolBump.dispose();
      leatherMap.dispose();
      leatherBump.dispose();
      stoneMap.dispose();
      contactShadowMap.dispose();
    },
  };
}
