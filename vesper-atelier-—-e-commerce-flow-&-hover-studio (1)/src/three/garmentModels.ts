import * as THREE from 'three';
import { AtelierModelId } from '../data/products';
import { ProceduralTextureSet } from './proceduralTextures';

export type AtelierFinishId = 'signature' | 'royal-navy' | 'botanical';

export interface AtelierFinishOption {
  id: AtelierFinishId;
  label: string;
  swatch: string;
  woolHex: number;
  leatherHex: number;
  cordovanHex: number;
}

export const ATELIER_FINISHES: AtelierFinishOption[] = [
  {
    id: 'signature',
    label: 'Charcoal & Espresso',
    swatch: '#323438',
    woolHex: 0x3b3e42,
    leatherHex: 0x3d251b,
    cordovanHex: 0x3b1f1a,
  },
  {
    id: 'royal-navy',
    label: 'Midnight & Cognac',
    swatch: '#1F2D42',
    woolHex: 0x223046,
    leatherHex: 0x7a4220,
    cordovanHex: 0x5c3118,
  },
  {
    id: 'botanical',
    label: 'Forest & Oxblood',
    swatch: '#2D4A3E',
    woolHex: 0x2b453a,
    leatherHex: 0x292624,
    cordovanHex: 0x4d1d21,
  },
];

export interface BuiltAtelierModel {
  group: THREE.Group;
  primaryMaterials: {
    wool?: THREE.MeshPhysicalMaterial;
    leather?: THREE.MeshStandardMaterial;
    cordovan?: THREE.MeshPhysicalMaterial;
  };
  explodableParts: {
    mesh: THREE.Object3D;
    basePos: THREE.Vector3;
    explodeOffset: THREE.Vector3;
  }[];
  dispose: () => void;
}

function registerExplode(
  list: BuiltAtelierModel['explodableParts'],
  mesh: THREE.Object3D,
  ox: number,
  oy: number,
  oz: number
) {
  list.push({
    mesh,
    basePos: mesh.position.clone(),
    explodeOffset: new THREE.Vector3(ox, oy, oz),
  });
}

export function buildAtelierModel(
  modelId: AtelierModelId,
  textures: ProceduralTextureSet,
  finish: AtelierFinishOption
): BuiltAtelierModel {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const explodableParts: BuiltAtelierModel['explodableParts'] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // Shared high-contrast metallic & horn materials (roughness delta >= 0.25 vs cloth/matte leather)
  const brassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xc5a358,
      metalness: 0.94,
      roughness: 0.2,
      anisotropy: 0.8,
    })
  );
  const darkWalnutMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3b281c,
      roughness: 0.45,
      metalness: 0.05,
    })
  );
  const hornMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x221d18,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 0.55,
    })
  );

  const primaryMaterials: BuiltAtelierModel['primaryMaterials'] = {};

  if (modelId === 'alder-overcoat') {
    const woolMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: finish.woolHex,
        map: textures.woolMap,
        bumpMap: textures.woolBump,
        bumpScale: 0.015,
        roughness: 0.88,
        metalness: 0.0,
        sheen: 0.55,
        sheenRoughness: 0.65,
        sheenColor: new THREE.Color(0x9ca3af),
      })
    );
    primaryMaterials.wool = woolMat;

    // Part 1: Turned walnut stand base (LatheGeometry) grounded at y = 0
    const basePts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.42, 0.0),
      new THREE.Vector2(0.4, 0.05),
      new THREE.Vector2(0.24, 0.08),
      new THREE.Vector2(0.08, 0.14),
      new THREE.Vector2(0.04, 0.18),
    ];
    const standBase = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(basePts, 32)), darkWalnutMat);
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    group.add(standBase);
    registerExplode(explodableParts, standBase, 0, -0.18, 0);

    // Part 2: Telescoping brushed brass pole
    const pole = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.032, 0.036, 0.72, 24)),
      brassMat
    );
    pole.position.set(0, 0.48, 0);
    pole.castShadow = true;
    group.add(pole);

    // Part 3: Sculpted coat torso body (LatheGeometry profile)
    const coatPts = [
      new THREE.Vector2(0.39, 0.0),
      new THREE.Vector2(0.36, 0.35),
      new THREE.Vector2(0.31, 0.68),
      new THREE.Vector2(0.37, 0.98),
      new THREE.Vector2(0.35, 1.18),
      new THREE.Vector2(0.14, 1.28),
      new THREE.Vector2(0.11, 1.35),
    ];
    const coatBodyGeo = trackGeo(new THREE.LatheGeometry(coatPts, 40));
    coatBodyGeo.scale(1.06, 1.0, 0.68);
    const coatBody = new THREE.Mesh(coatBodyGeo, woolMat);
    coatBody.position.set(0, 0.72, 0);
    coatBody.castShadow = true;
    coatBody.receiveShadow = true;
    group.add(coatBody);

    // Part 4 & 5: Left & Right Beveled Peak Lapels (ExtrudeGeometry)
    const lapelShape = new THREE.Shape();
    lapelShape.moveTo(0, 0);
    lapelShape.lineTo(0.16, 0.42);
    lapelShape.lineTo(0.06, 0.56);
    lapelShape.lineTo(-0.02, 0.48);
    lapelShape.lineTo(-0.04, 0.05);
    lapelShape.closePath();

    const lapelGeo = trackGeo(
      new THREE.ExtrudeGeometry(lapelShape, {
        depth: 0.028,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 3,
      })
    );

    const rightLapel = new THREE.Mesh(lapelGeo, woolMat);
    rightLapel.position.set(0.04, 1.46, 0.22);
    rightLapel.rotation.set(-0.08, 0.22, -0.08);
    rightLapel.castShadow = true;
    group.add(rightLapel);
    registerExplode(explodableParts, rightLapel, 0.14, 0.06, 0.22);

    const leftLapel = new THREE.Mesh(lapelGeo, woolMat);
    leftLapel.scale.x = -1;
    leftLapel.position.set(-0.04, 1.46, 0.22);
    leftLapel.rotation.set(-0.08, -0.22, 0.08);
    leftLapel.castShadow = true;
    group.add(leftLapel);
    registerExplode(explodableParts, leftLapel, -0.14, 0.06, 0.22);

    // Part 6 & 7: Sculpted Left & Right Tailored Sleeves (TubeGeometry)
    const rightSleeveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.34, 1.85, 0.0),
      new THREE.Vector3(0.45, 1.54, 0.02),
      new THREE.Vector3(0.47, 1.2, 0.07),
    ]);
    const rightSleeve = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(rightSleeveCurve, 18, 0.092, 18, false)),
      woolMat
    );
    rightSleeve.castShadow = true;
    group.add(rightSleeve);
    registerExplode(explodableParts, rightSleeve, 0.28, 0, 0);

    const leftSleeveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.34, 1.85, 0.0),
      new THREE.Vector3(-0.45, 1.54, 0.02),
      new THREE.Vector3(-0.47, 1.2, 0.07),
    ]);
    const leftSleeve = new THREE.Mesh(
      trackGeo(new THREE.TubeGeometry(leftSleeveCurve, 18, 0.092, 18, false)),
      woolMat
    );
    leftSleeve.castShadow = true;
    group.add(leftSleeve);
    registerExplode(explodableParts, leftSleeve, -0.28, 0, 0);

    // Part 8: Turned Brass Neck Finial Cap (LatheGeometry)
    const finialPts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.11, 0.0),
      new THREE.Vector2(0.11, 0.04),
      new THREE.Vector2(0.055, 0.09),
      new THREE.Vector2(0.065, 0.14),
      new THREE.Vector2(0.0, 0.16),
    ];
    const finial = new THREE.Mesh(trackGeo(new THREE.LatheGeometry(finialPts, 28)), brassMat);
    finial.position.set(0, 2.06, 0);
    finial.castShadow = true;
    group.add(finial);
    registerExplode(explodableParts, finial, 0, 0.22, 0);

    // Part 9: Six Double-Breasted Horn Buttons (Grouped)
    const buttonGroup = new THREE.Group();
    const buttonGeo = trackGeo(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 20));
    buttonGeo.rotateX(Math.PI / 2);
    const btnRows = [1.56, 1.38, 1.2];
    for (const y of btnRows) {
      for (const x of [-0.095, 0.095]) {
        const btn = new THREE.Mesh(buttonGeo, hornMat);
        btn.position.set(x, y, 0.25);
        buttonGroup.add(btn);
      }
    }
    group.add(buttonGroup);
    registerExplode(explodableParts, buttonGroup, 0, 0, 0.28);

    // Part 10: Welt Pocket Flaps
    const flapGeo = trackGeo(new THREE.BoxGeometry(0.15, 0.048, 0.016));
    for (const side of [-1, 1]) {
      const flap = new THREE.Mesh(flapGeo, woolMat);
      flap.position.set(side * 0.21, 1.22, 0.22);
      flap.rotation.y = side * 0.28;
      group.add(flap);
    }
  } else if (modelId === 'kessler-weekender') {
    const leatherMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: finish.leatherHex,
        map: textures.leatherMap,
        bumpMap: textures.leatherBump,
        bumpScale: 0.018,
        roughness: 0.42,
        metalness: 0.04,
      })
    );
    primaryMaterials.leather = leatherMat;

    // Part 1: Rounded Architectural Duffel Body (ExtrudeGeometry with bevels)
    const bodyProfile = new THREE.Shape();
    bodyProfile.moveTo(-0.36, 0.02);
    bodyProfile.lineTo(0.36, 0.02);
    bodyProfile.quadraticCurveTo(0.46, 0.02, 0.44, 0.24);
    bodyProfile.quadraticCurveTo(0.42, 0.64, 0.22, 0.72);
    bodyProfile.lineTo(-0.22, 0.72);
    bodyProfile.quadraticCurveTo(-0.42, 0.64, -0.44, 0.24);
    bodyProfile.quadraticCurveTo(-0.46, 0.02, -0.36, 0.02);

    const bodyGeo = trackGeo(
      new THREE.ExtrudeGeometry(bodyProfile, {
        depth: 1.38,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.04,
        bevelSegments: 5,
      })
    );
    bodyGeo.center();
    bodyGeo.rotateY(Math.PI / 2);

    const bagBody = new THREE.Mesh(bodyGeo, leatherMat);
    bagBody.position.set(0, 0.46, 0);
    bagBody.castShadow = true;
    bagBody.receiveShadow = true;
    group.add(bagBody);

    // Part 2 & 3: Twin Vertical Bridle Wrap Straps
    const strapShape = new THREE.Shape();
    strapShape.moveTo(-0.46, 0);
    strapShape.lineTo(0.46, 0);
    strapShape.quadraticCurveTo(0.48, 0.56, 0.24, 0.75);
    strapShape.lineTo(-0.24, 0.75);
    strapShape.quadraticCurveTo(-0.48, 0.56, -0.46, 0);
    const strapGeo = trackGeo(
      new THREE.ExtrudeGeometry(strapShape, {
        depth: 0.055,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 2,
      })
    );
    strapGeo.center();
    strapGeo.rotateY(Math.PI / 2);

    for (const xPos of [-0.34, 0.34]) {
      const strap = new THREE.Mesh(strapGeo, leatherMat);
      strap.position.set(xPos, 0.46, 0);
      strap.scale.set(1.03, 1.03, 1.03);
      strap.castShadow = true;
      group.add(strap);
      registerExplode(explodableParts, strap, 0, 0.14, 0);
    }

    // Part 4 & 5: Twin Rolled Leather Handles (TubeGeometry)
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.34, 0.84, 0),
      new THREE.Vector3(-0.26, 1.14, 0),
      new THREE.Vector3(0, 1.24, 0),
      new THREE.Vector3(0.26, 1.14, 0),
      new THREE.Vector3(0.34, 0.84, 0),
    ]);
    const handleGeo = trackGeo(new THREE.TubeGeometry(handleCurve, 28, 0.026, 14, false));

    const frontHandle = new THREE.Mesh(handleGeo, leatherMat);
    frontHandle.position.set(0, 0, 0.16);
    frontHandle.castShadow = true;
    group.add(frontHandle);
    registerExplode(explodableParts, frontHandle, 0, 0.24, 0.06);

    const backHandle = new THREE.Mesh(handleGeo, leatherMat);
    backHandle.position.set(0, 0, -0.16);
    backHandle.castShadow = true;
    group.add(backHandle);
    registerExplode(explodableParts, backHandle, 0, 0.24, -0.06);

    // Part 6: Solid Brass Center Zipper Track & Pull
    const zipTrack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.36, 0.024, 0.042)), brassMat);
    zipTrack.position.set(0, 0.86, 0);
    group.add(zipTrack);
    registerExplode(explodableParts, zipTrack, 0, 0.22, 0);

    // Part 7: Front Buckle Pocket Flap & Brass Buckles
    const pocket = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 0.36, 0.06)), leatherMat);
    pocket.position.set(0, 0.4, 0.45);
    pocket.castShadow = true;
    group.add(pocket);
    registerExplode(explodableParts, pocket, 0, 0, 0.22);

    // Part 8: Brass D-Rings & Strap Anchors
    const dRingGeo = trackGeo(new THREE.TorusGeometry(0.036, 0.009, 10, 20));
    for (const x of [-0.34, 0.34]) {
      for (const z of [-0.16, 0.16]) {
        const ring = new THREE.Mesh(dRingGeo, brassMat);
        ring.position.set(x, 0.84, z);
        ring.rotation.y = Math.PI / 2;
        group.add(ring);
      }
    }
    // Side brass strap loops
    for (const side of [-1, 1]) {
      const sideRing = new THREE.Mesh(dRingGeo, brassMat);
      sideRing.position.set(side * 0.77, 0.62, 0);
      group.add(sideRing);
    }

    // Part 9: Five Brass Base Studs (sitting flush at y = 0.02)
    const studGeo = trackGeo(new THREE.CylinderGeometry(0.022, 0.028, 0.022, 16));
    for (const sx of [-0.52, 0, 0.52]) {
      for (const sz of [-0.26, 0.26]) {
        const stud = new THREE.Mesh(studGeo, brassMat);
        stud.position.set(sx, 0.015, sz);
        group.add(stud);
      }
    }
  } else {
    // Vance Shell Cordovan Derby Boot
    const cordovanMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: finish.cordovanHex,
        map: textures.leatherMap,
        bumpMap: textures.leatherBump,
        bumpScale: 0.006,
        roughness: 0.22,
        metalness: 0.05,
        clearcoat: 0.85,
        clearcoatRoughness: 0.16,
      })
    );
    primaryMaterials.cordovan = cordovanMat;

    const soleRubberMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e1d1b,
        roughness: 0.86,
        metalness: 0.02,
      })
    );

    // Part 1: Goodyear Welt Outsole (ExtrudeGeometry) grounded at y = 0
    const soleShape = new THREE.Shape();
    soleShape.moveTo(-0.18, -0.58);
    soleShape.quadraticCurveTo(-0.22, -0.2, -0.2, 0.12);
    soleShape.quadraticCurveTo(-0.24, 0.45, 0, 0.68);
    soleShape.quadraticCurveTo(0.24, 0.45, 0.2, 0.12);
    soleShape.quadraticCurveTo(0.22, -0.2, 0.18, -0.58);
    soleShape.closePath();

    const outsole = new THREE.Mesh(
      trackGeo(
        new THREE.ExtrudeGeometry(soleShape, {
          depth: 0.055,
          bevelEnabled: true,
          bevelThickness: 0.012,
          bevelSize: 0.012,
          bevelSegments: 2,
        })
      ),
      soleRubberMat
    );
    outsole.rotation.x = Math.PI / 2;
    outsole.position.set(0, 0.11, 0);
    outsole.castShadow = true;
    outsole.receiveShadow = true;
    group.add(outsole);
    registerExplode(explodableParts, outsole, 0, -0.14, 0);

    // Part 2: Stacked Leather Heel Block
    const heelGeo = trackGeo(new THREE.CylinderGeometry(0.185, 0.19, 0.12, 24));
    heelGeo.scale(0.95, 1, 1.15);
    const heel = new THREE.Mesh(heelGeo, darkWalnutMat);
    heel.position.set(0, 0.06, -0.38);
    heel.castShadow = true;
    group.add(heel);
    registerExplode(explodableParts, heel, 0, -0.2, -0.06);

    // Part 3: Storm Welt Midsole Rim
    const welt = new THREE.Mesh(
      trackGeo(
        new THREE.ExtrudeGeometry(soleShape, {
          depth: 0.028,
          bevelEnabled: true,
          bevelThickness: 0.006,
          bevelSize: 0.016,
          bevelSegments: 2,
        })
      ),
      darkWalnutMat
    );
    welt.rotation.x = Math.PI / 2;
    welt.position.set(0, 0.145, 0);
    group.add(welt);

    // Part 4: Sculpted Cordovan Vamp & Toe Box
    const vampGeo = trackGeo(new THREE.SphereGeometry(0.22, 28, 22));
    vampGeo.scale(0.88, 0.62, 1.85);
    const vamp = new THREE.Mesh(vampGeo, cordovanMat);
    vamp.position.set(0, 0.22, 0.18);
    vamp.castShadow = true;
    group.add(vamp);

    // Part 5: Tall Ankle Quarter Shaft (LatheGeometry)
    const shaftPts = [
      new THREE.Vector2(0.18, 0.0),
      new THREE.Vector2(0.195, 0.18),
      new THREE.Vector2(0.17, 0.48),
      new THREE.Vector2(0.165, 0.72),
    ];
    const shaftGeo = trackGeo(new THREE.LatheGeometry(shaftPts, 32));
    shaftGeo.scale(0.9, 1.0, 1.12);
    const shaft = new THREE.Mesh(shaftGeo, cordovanMat);
    shaft.position.set(0, 0.16, -0.22);
    shaft.castShadow = true;
    group.add(shaft);
    registerExplode(explodableParts, shaft, 0, 0.18, -0.1);

    // Part 6: Derby Facings & Speed-Hook Eyestays
    const eyeletGeo = trackGeo(new THREE.TorusGeometry(0.014, 0.005, 8, 16));
    const eyeletsGroup = new THREE.Group();
    for (let row = 0; row < 5; row++) {
      const y = 0.38 + row * 0.085;
      const z = 0.02 - row * 0.032;
      for (const side of [-1, 1]) {
        const eyelet = new THREE.Mesh(eyeletGeo, brassMat);
        eyelet.position.set(side * 0.082, y, z);
        eyelet.rotation.y = side * 0.45;
        eyeletsGroup.add(eyelet);
      }
    }
    group.add(eyeletsGroup);
    registerExplode(explodableParts, eyeletsGroup, 0, 0.1, 0.2);

    // Part 7: Waxed Cotton Criss-Cross Laces (TubeGeometry)
    const laceGroup = new THREE.Group();
    for (let row = 0; row < 4; row++) {
      const y0 = 0.38 + row * 0.085;
      const y1 = 0.38 + (row + 1) * 0.085;
      const z0 = 0.02 - row * 0.032;
      const z1 = 0.02 - (row + 1) * 0.032;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.08, y0, z0),
        new THREE.Vector3(0, (y0 + y1) * 0.5, (z0 + z1) * 0.5 + 0.022),
        new THREE.Vector3(0.08, y1, z1),
      ]);
      const lace = new THREE.Mesh(
        trackGeo(new THREE.TubeGeometry(curve, 10, 0.006, 8, false)),
        soleRubberMat
      );
      laceGroup.add(lace);
    }
    group.add(laceGroup);
    registerExplode(explodableParts, laceGroup, 0, 0.12, 0.26);

    // Scale up boot comfortably for studio inspection
    group.scale.setScalar(1.35);
  }

  return {
    group,
    primaryMaterials,
    explodableParts,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
