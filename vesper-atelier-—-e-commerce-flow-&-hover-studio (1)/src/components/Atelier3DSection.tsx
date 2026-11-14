import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { AtelierModelId } from '../data/products';
import {
  ATELIER_FINISHES,
  AtelierFinishId,
  BuiltAtelierModel,
  buildAtelierModel,
} from '../three/garmentModels';
import { createProceduralTextures } from '../three/proceduralTextures';

export type CameraPresetId = 'front' | 'three-quarter' | 'detail' | 'rear';

interface Atelier3DSectionProps {
  selectedModel: AtelierModelId;
  onSelectModel: (id: AtelierModelId) => void;
}

const MODEL_OPTIONS: { id: AtelierModelId; label: string; subtitle: string }[] = [
  { id: 'alder-overcoat', label: 'Alder Overcoat', subtitle: 'Tailored Wool Form' },
  { id: 'kessler-weekender', label: 'Kessler Weekender', subtitle: 'Bridle Leather Duffel' },
  { id: 'vance-derby', label: 'Vance Derby Boot', subtitle: 'Cordovan Goodyear Last' },
];

const CAMERA_PRESETS: Record<
  CameraPresetId,
  { label: string; pos: [number, number, number]; target: [number, number, number] }
> = {
  front: { label: 'Front', pos: [0, 1.35, 3.25], target: [0, 0.95, 0] },
  'three-quarter': { label: '45° Profile', pos: [2.2, 1.55, 2.5], target: [0, 0.92, 0] },
  detail: { label: 'Detail', pos: [0.85, 1.35, 1.55], target: [0, 1.1, 0] },
  rear: { label: 'Rear', pos: [-0.9, 1.45, -3.05], target: [0, 0.95, 0] },
};

// Module-level pre-allocated math helpers for zero-GC render ticks
const _camGoal = new THREE.Vector3();
const _targetGoal = new THREE.Vector3();

export function Atelier3DSection({ selectedModel, onSelectModel }: Atelier3DSectionProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [finishId, setFinishId] = useState<AtelierFinishId>('signature');
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('three-quarter');
  const [explodeAmount, setExplodeAmount] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [controlsCollapsed, setControlsCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [webglUnavailable, setWebglUnavailable] = useState<boolean>(false);

  // Refs synced into the WebGL engine without tearing down the canvas
  const stateRef = useRef({
    modelId: selectedModel,
    finishId,
    explodeTarget: 0,
    explodeCurrent: 0,
    autoRotate: false,
    cameraAnimating: false,
    presetKey: 'three-quarter' as CameraPresetId,
  });

  const engineApiRef = useRef<{
    rebuildModel: (id: AtelierModelId, fId: AtelierFinishId) => void;
    updateFinish: (fId: AtelierFinishId) => void;
    triggerCameraPreset: (preset: CameraPresetId) => void;
    requestRender: () => void;
    resize: () => void;
  } | null>(null);

  // Keyboard shortcut 'H' to collapse/expand controls dock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === 'h' || e.key === 'H') &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        setControlsCollapsed((prev) => !prev);
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  // Mount Three.js scene once in stable ref container
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initW = container.clientWidth || 960;
    const initH = container.clientHeight || 560;
    renderer.setSize(initW, initH);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xefece5);
    scene.fog = new THREE.FogExp2(0xefece5, 0.045);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(38, initW / initH, 0.1, 60);
    const initialPreset = CAMERA_PRESETS['three-quarter'];
    camera.position.set(...initialPreset.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...initialPreset.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.4;
    controls.maxDistance = 6.2;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.minPolarAngle = 0.15;
    controls.enablePan = false;
    controls.update();

    // Warm/Cool Studio 3-Point Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xdce7f2, 0x5a5248, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.0);
    keyLight.position.set(3.5, 5.2, 3.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    const d = 3;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffe8c8, 0.7);
    rimLight.position.set(-3.2, 3.5, -3.5);
    scene.add(rimLight);

    let rectLight: THREE.RectAreaLight | null = null;
    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      rectLight = new THREE.RectAreaLight(0xfffaf2, 2.6, 2.6, 3.2);
      rectLight.position.set(-2.8, 2.2, 2.2);
      rectLight.lookAt(0, 1.0, 0);
      scene.add(rectLight);
    }

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTextures(maxAniso);

    // Honed Limestone Pedestal + Seamless Gallery Floor
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xe8e4da,
      roughness: 0.92,
      metalness: 0.0,
    });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(22, 48), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.14;
    floor.receiveShadow = true;
    scene.add(floor);

    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xf0ede6,
      map: textures.stoneMap,
      roughness: 0.78,
      metalness: 0.02,
    });
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.24, 0.14, 48), plinthMat);
    plinth.position.y = -0.07;
    plinth.receiveShadow = true;
    scene.add(plinth);

    // Soft Radial Contact Shadow Plane
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.9),
      new THREE.MeshBasicMaterial({
        map: textures.contactShadowMap,
        transparent: true,
        depthWrite: false,
        opacity: 0.45,
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.002;
    scene.add(contactShadow);

    // Active Composite Procedural Model
    let currentBuilt: BuiltAtelierModel | null = null;
    const mountModel = (id: AtelierModelId, fId: AtelierFinishId) => {
      if (currentBuilt) {
        scene.remove(currentBuilt.group);
        currentBuilt.dispose();
      }
      const finishObj = ATELIER_FINISHES.find((f) => f.id === fId) || ATELIER_FINISHES[0];
      currentBuilt = buildAtelierModel(id, textures, finishObj);
      scene.add(currentBuilt.group);
      applyExplodeFactor(stateRef.current.explodeCurrent);
    };

    const applyExplodeFactor = (t: number) => {
      if (!currentBuilt) return;
      for (const part of currentBuilt.explodableParts) {
        part.mesh.position
          .copy(part.basePos)
          .addScaledVector(part.explodeOffset, t);
      }
    };

    mountModel(stateRef.current.modelId, stateRef.current.finishId);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Coalesced Render-on-Demand & Software-WebGL Synchronized Loop
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } catch {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        renderDirty = false;

        const dt = Math.min((now - lastTime) / 1000, 0.08);
        lastTime = now;

        const st = stateRef.current;
        let needsAnotherFrame = false;

        // Exponential damping for exploded-view transition
        if (Math.abs(st.explodeCurrent - st.explodeTarget) > 0.002) {
          st.explodeCurrent = THREE.MathUtils.damp(
            st.explodeCurrent,
            st.explodeTarget,
            8.5,
            dt || 0.016
          );
          applyExplodeFactor(st.explodeCurrent);
          needsAnotherFrame = true;
        } else if (st.explodeCurrent !== st.explodeTarget) {
          st.explodeCurrent = st.explodeTarget;
          applyExplodeFactor(st.explodeCurrent);
        }

        // Exponential damping for camera presets
        if (st.cameraAnimating) {
          const preset = CAMERA_PRESETS[st.presetKey];
          _camGoal.set(...preset.pos);
          _targetGoal.set(...preset.target);
          const alpha = 1 - Math.exp(-7 * (dt || 0.016));
          camera.position.lerp(_camGoal, alpha);
          controls.target.lerp(_targetGoal, alpha);
          if (
            camera.position.distanceTo(_camGoal) < 0.015 &&
            controls.target.distanceTo(_targetGoal) < 0.015
          ) {
            camera.position.copy(_camGoal);
            controls.target.copy(_targetGoal);
            st.cameraAnimating = false;
          } else {
            needsAnotherFrame = true;
          }
        }

        if (st.autoRotate && !isSoftwareGl) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 1.4;
          needsAnotherFrame = true;
        } else {
          controls.autoRotate = false;
        }

        const ctrlMoving = controls.update();
        if (ctrlMoving && !isSoftwareGl) {
          needsAnotherFrame = true;
        }

        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (disposed) return;
          if (renderDirty || needsAnotherFrame) {
            requestRender();
          }
        };

        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    const onControlStart = () => {
      stateRef.current.cameraAnimating = false;
    };
    const onControlChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('change', onControlChange);

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    engineApiRef.current = {
      rebuildModel: (id, fId) => {
        mountModel(id, fId);
        requestRender();
      },
      updateFinish: (fId) => {
        const finishObj = ATELIER_FINISHES.find((f) => f.id === fId) || ATELIER_FINISHES[0];
        if (currentBuilt) {
          if (currentBuilt.primaryMaterials.wool) {
            currentBuilt.primaryMaterials.wool.color.setHex(finishObj.woolHex);
          }
          if (currentBuilt.primaryMaterials.leather) {
            currentBuilt.primaryMaterials.leather.color.setHex(finishObj.leatherHex);
          }
          if (currentBuilt.primaryMaterials.cordovan) {
            currentBuilt.primaryMaterials.cordovan.color.setHex(finishObj.cordovanHex);
          }
        }
        requestRender();
      },
      triggerCameraPreset: (preset) => {
        stateRef.current.presetKey = preset;
        stateRef.current.cameraAnimating = true;
        requestRender();
      },
      requestRender,
      resize: handleResize,
    };

    // Initial render
    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      if (currentBuilt) currentBuilt.dispose();
      floor.geometry.dispose();
      floorMat.dispose();
      plinth.geometry.dispose();
      plinthMat.dispose();
      contactShadow.geometry.dispose();
      (contactShadow.material as THREE.Material).dispose();
      textures.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      engineApiRef.current = null;
    };
  }, []);

  // Sync selected model changes
  useEffect(() => {
    stateRef.current.modelId = selectedModel;
    engineApiRef.current?.rebuildModel(selectedModel, stateRef.current.finishId);
  }, [selectedModel]);

  // Sync finish changes
  useEffect(() => {
    stateRef.current.finishId = finishId;
    engineApiRef.current?.updateFinish(finishId);
  }, [finishId]);

  // Sync explode slider
  useEffect(() => {
    stateRef.current.explodeTarget = explodeAmount;
    engineApiRef.current?.requestRender();
  }, [explodeAmount]);

  // Sync auto-rotate
  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
    engineApiRef.current?.requestRender();
  }, [autoRotate]);

  // Trigger resize when toggling fullscreen
  useEffect(() => {
    const id = window.setTimeout(() => {
      engineApiRef.current?.resize();
    }, 50);
    return () => clearTimeout(id);
  }, [isFullscreen]);

  const handleCameraSelect = (preset: CameraPresetId) => {
    setCameraPreset(preset);
    engineApiRef.current?.triggerCameraPreset(preset);
  };

  return (
    <section
      id="atelier-3d"
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen bg-[#EFECE5]'
          : 'relative border-b border-[#E6E3DC] bg-[#EFECE5]'
      }
    >
      <div
        className={
          isFullscreen
            ? 'relative w-full h-full overflow-hidden'
            : 'relative w-full h-[76vh] min-h-[540px] max-h-[820px] overflow-hidden'
        }
      >
        {/* Dedicated WebGL Mount Container */}
        <div
          ref={mountRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          aria-label="Interactive 3D Atelier Viewport"
        />

        {webglUnavailable && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#EFECE5]">
            <p className="font-display text-2xl text-[#18181B]">
              DASBROTHERS 3D Atelier Preview
            </p>
            <p className="text-sm text-[#52525B] mt-2 max-w-md">
              Hardware 3D acceleration is currently unavailable in this browser session. Browse the
              multi-angle garment reel across the collection below.
            </p>
          </div>
        )}

        {/* Minimal Top-Left Header Overlay (Solid rgba, zero backdrop-filter over WebGL) */}
        <div className="pointer-events-none absolute top-5 left-5 right-5 flex items-start justify-between gap-4">
          <div className="pointer-events-auto bg-[#F8F7F4]/95 border border-[#E6E3DC] rounded-md px-4 py-3 shadow-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#71717A]">
              3D Atelier · Interactive Specimen
            </p>
            <h2 className="font-display text-lg sm:text-xl text-[#18181B] mt-0.5">
              {MODEL_OPTIONS.find((m) => m.id === selectedModel)?.label}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#18181B] bg-[#F8F7F4]/95 border border-[#E6E3DC] hover:border-[#18181B] rounded-md shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Exit 3D Studio</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Full-Viewport 3D</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Bottom Control Dock (Zero backdrop-filter over WebGL) */}
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[min(940px,94vw)] flex flex-col items-center z-10"
        >
          <button
            type="button"
            onClick={() => setControlsCollapsed((prev) => !prev)}
            className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-[#18181B] bg-[#F8F7F4]/95 border border-[#E6E3DC] hover:border-[#18181B] rounded-t-md shadow-sm cursor-pointer"
          >
            {controlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Show 3D Controls (H)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Hide Controls (H)</span>
              </>
            )}
          </button>

          {!controlsCollapsed && (
            <div className="w-full bg-[#FFFFFF]/95 border border-[#E6E3DC] rounded-lg px-4 py-3 shadow-lg flex flex-wrap items-center justify-between gap-4">
              {/* Model Switcher */}
              <div className="flex items-center gap-1.5">
                {MODEL_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectModel(m.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                      selectedModel === m.id
                        ? 'bg-[#18181B] text-white'
                        : 'bg-[#F1EFEA] text-[#52525B] hover:text-[#18181B]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Camera Angle Presets */}
              <div className="flex items-center gap-1">
                {(Object.keys(CAMERA_PRESETS) as CameraPresetId[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCameraSelect(key)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap cursor-pointer ${
                      cameraPreset === key
                        ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
                        : 'bg-[#F8F7F4] text-[#52525B] border-[#E6E3DC] hover:text-[#18181B]'
                    }`}
                  >
                    {CAMERA_PRESETS[key].label}
                  </button>
                ))}
              </div>

              {/* Material Swatches, Exploded View & Auto-Rotate */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5" aria-label="Material palette">
                  {ATELIER_FINISHES.map((fin) => (
                    <button
                      key={fin.id}
                      type="button"
                      title={fin.label}
                      aria-label={`Select finish ${fin.label}`}
                      onClick={() => setFinishId(fin.id)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                        finishId === fin.id
                          ? 'border-[#18181B] scale-110'
                          : 'border-white ring-1 ring-[#D4CFC4]'
                      }`}
                      style={{ backgroundColor: fin.swatch }}
                    />
                  ))}
                </div>

                <label className="flex items-center gap-2 text-xs text-[#52525B] whitespace-nowrap">
                  <span>Layers</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={explodeAmount}
                    onChange={(e) => setExplodeAmount(parseFloat(e.target.value))}
                    className="w-20 accent-[#2D4A3E] cursor-pointer"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setAutoRotate((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap cursor-pointer ${
                    autoRotate
                      ? 'bg-[#18181B] text-white border-[#18181B]'
                      : 'bg-[#F8F7F4] text-[#52525B] border-[#E6E3DC] hover:text-[#18181B]'
                  }`}
                >
                  <RotateCw className="w-3 h-3" aria-hidden="true" />
                  <span>Turntable</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
