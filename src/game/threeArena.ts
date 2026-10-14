import * as THREE from 'three';
import { ArenaId } from '../types/game';

import { getArenaFloorTexture } from './threeTextures';

export interface ThreeArenaInstance {
  group: THREE.Group;
  update: (delta: number) => void;
  dispose: () => void;
  triggerLightningFlash?: () => void;
}

export function createThreeArena(arenaId: ArenaId): ThreeArenaInstance {
  const group = new THREE.Group();

  const floorTexture = getArenaFloorTexture(arenaId);
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;

  // 1. Procedural PBR Arena Ground
  const groundGeo = new THREE.CylinderGeometry(20, 20, 1.2, 48);
  const groundMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.75,
    metalness: 0.15
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.6;
  ground.receiveShadow = true;
  group.add(ground);

  // Outer Stone Border Rim
  const borderGeo = new THREE.TorusGeometry(19.8, 0.4, 8, 48);
  const borderMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.7 });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.rotation.x = Math.PI / 2;
  border.position.y = 0.02;
  group.add(border);

  // Ancient Ninja Seal Ring (Pulsing glowing glyph ring)
  const ringGeo = new THREE.RingGeometry(8.5, 8.8, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: arenaId === 'valley_of_the_end' ? 0x60a5fa : 0xf59e0b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.55
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);

  // Inner Jutsu Magatama Runes
  const innerRingGeo = new THREE.RingGeometry(4.2, 4.35, 32);
  const innerRing = new THREE.Mesh(innerRingGeo, ringMat);
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.02;
  group.add(innerRing);

  // Animated Weather & Environmental Objects
  const animatedObjects: { mesh: THREE.Object3D; speed: number; axis: 'x' | 'y' | 'z'; basePos?: THREE.Vector3 }[] = [];
  let petalsMesh: THREE.InstancedMesh | null = null;
  let thunderLight: THREE.PointLight | null = null;
  let thunderTimer = 0;

  if (arenaId === 'leaf_village') {
    // Red Torii Gates
    const toriiMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45, metalness: 0.1 });
    const toriiL = createToriiGate(toriiMat);
    toriiL.position.set(-13, 0, -6);
    toriiL.rotation.y = 0.35;
    group.add(toriiL);

    const toriiR = createToriiGate(toriiMat);
    toriiR.position.set(13, 0, -6);
    toriiR.rotation.y = -0.35;
    group.add(toriiR);

    // Hokage Rock Cliff Backdrop
    const cliffGeo = new THREE.BoxGeometry(46, 20, 6);
    const cliffMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.95 });
    const cliff = new THREE.Mesh(cliffGeo, cliffMat);
    cliff.position.set(0, 8, -20);
    group.add(cliff);

    // Carved Hokage Faces Silhouettes
    for (let f = 0; f < 4; f++) {
      const faceMesh = new THREE.Mesh(
        new THREE.SphereGeometry(2.0, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85 })
      );
      faceMesh.position.set(-11 + f * 7.2, 10.5, -17.5);
      faceMesh.scale.set(1, 1.45, 0.65);
      group.add(faceMesh);
    }

    // Sakura Cherry Blossom Trees
    for (let i = 0; i < 4; i++) {
      const tree = createCherryTree();
      const x = (i % 2 === 0 ? -1 : 1) * (15 + Math.random() * 3);
      const z = -4 - Math.random() * 8;
      tree.position.set(x, 0, z);
      group.add(tree);
    }

    // Floating 3D Sakura Petals (InstancedMesh for high performance)
    const petalCount = 80;
    const petalGeo = new THREE.PlaneGeometry(0.12, 0.18);
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    petalsMesh = new THREE.InstancedMesh(petalGeo, petalMat, petalCount);

    const dummy = new THREE.Object3D();
    for (let p = 0; p < petalCount; p++) {
      dummy.position.set(
        (Math.random() - 0.5) * 30,
        1 + Math.random() * 10,
        (Math.random() - 0.5) * 20
      );
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.updateMatrix();
      petalsMesh.setMatrixAt(p, dummy.matrix);
    }
    petalsMesh.instanceMatrix.needsUpdate = true;
    group.add(petalsMesh);

    // Traditional Japanese Stone Lanterns with Warm Lights
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lanternGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.6, 8);
    for (const pos of [[-8, 2.5, -4], [8, 2.5, -4], [-12, 2.5, 4], [12, 2.5, 4]]) {
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(pos[0], pos[1], pos[2]);
      group.add(lantern);
      const light = new THREE.PointLight(0xf59e0b, 1.8, 9);
      light.position.set(pos[0], pos[1], pos[2]);
      group.add(light);
    }

  } else if (arenaId === 'valley_of_the_end') {
    // Massive Colossal Statues (Hashirama & Madara)
    const statueMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
    
    // Statue Hashirama
    const statueL = createDetailedStatue(statueMat, true);
    statueL.position.set(-14, 0, -9);
    statueL.scale.set(2.8, 2.8, 2.8);
    group.add(statueL);

    // Statue Madara
    const statueR = createDetailedStatue(statueMat, false);
    statueR.position.set(14, 0, -9);
    statueR.scale.set(2.8, 2.8, 2.8);
    group.add(statueR);

    // Colossal Waterfall
    const waterGeo = new THREE.PlaneGeometry(16, 28);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.5,
      transparent: true,
      opacity: 0.8
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 6, -18);
    group.add(water);

    // Dynamic Storm Thunder Light
    thunderLight = new THREE.PointLight(0xbae6fd, 0, 80);
    thunderLight.position.set(0, 22, -10);
    group.add(thunderLight);

  } else if (arenaId === 'chunin_arena') {
    // Sandstone Stadium Walls
    const wallGeo = new THREE.CylinderGeometry(22, 22, 10, 48, 1, true);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xa87139, roughness: 0.9, side: THREE.DoubleSide });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 4.5;
    group.add(wall);

    // Tournament Grand Torii Gate
    const gateGeo = new THREE.BoxGeometry(8, 7.5, 2.5);
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
    const gate = new THREE.Mesh(gateGeo, gateMat);
    gate.position.set(0, 3.75, -21);
    group.add(gate);

    // Floating Clan Banners
    for (let b = 0; b < 8; b++) {
      const bannerAngle = (b / 8) * Math.PI - Math.PI / 2;
      const bannerGeo = new THREE.PlaneGeometry(1.4, 4.2);
      const bannerMat = new THREE.MeshStandardMaterial({
        color: b % 2 === 0 ? 0xdc2626 : 0x2563eb,
        side: THREE.DoubleSide
      });
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.set(Math.cos(bannerAngle) * 21.5, 6, Math.sin(bannerAngle) * 21.5);
      banner.rotation.y = -bannerAngle;
      group.add(banner);
    }
  }

  const triggerLightningFlash = () => {
    if (thunderLight) {
      thunderLight.intensity = 8.0;
    }
  };

  const update = (delta: number) => {
    // Pulse ancient chakra seal ring
    ringMat.opacity = 0.45 + Math.sin(Date.now() / 400) * 0.2;

    // Animate Sakura petals drift
    if (petalsMesh) {
      const dummy = new THREE.Object3D();
      for (let p = 0; p < petalsMesh.count; p++) {
        petalsMesh.getMatrixAt(p, dummy.matrix);
        dummy.position.setFromMatrixPosition(dummy.matrix);
        dummy.position.y -= delta * 1.2;
        dummy.position.x += Math.sin(dummy.position.y + p) * 0.02;
        dummy.rotation.x += delta * 1.5;
        dummy.rotation.y += delta * 2.0;

        if (dummy.position.y < 0.1) {
          dummy.position.y = 10 + Math.random() * 2;
          dummy.position.x = (Math.random() - 0.5) * 30;
        }

        dummy.updateMatrix();
        petalsMesh.setMatrixAt(p, dummy.matrix);
      }
      petalsMesh.instanceMatrix.needsUpdate = true;
    }

    // Dynamic Thunder Lightning Flashes
    if (thunderLight) {
      thunderTimer += delta;
      if (thunderTimer > 4.5 && Math.random() < 0.06) {
        thunderLight.intensity = 6.0;
        thunderTimer = 0;
      } else if (thunderLight.intensity > 0) {
        thunderLight.intensity = Math.max(0, thunderLight.intensity - delta * 15);
      }
    }
  };

  const dispose = () => {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  };

  return {
    group,
    update,
    dispose,
    triggerLightningFlash
  };
}

// Helpers
function createToriiGate(mat: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const colGeo = new THREE.CylinderGeometry(0.3, 0.3, 8, 14);
  const colL = new THREE.Mesh(colGeo, mat);
  colL.position.set(-2.2, 4, 0);
  g.add(colL);

  const colR = new THREE.Mesh(colGeo, mat);
  colR.position.set(2.2, 4, 0);
  g.add(colR);

  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.55, 0.7), mat);
  topBeam.position.set(0, 7.8, 0);
  g.add(topBeam);

  const subBeam = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.38, 0.45), mat);
  subBeam.position.set(0, 6.7, 0);
  g.add(subBeam);
  return g;
}

function createCherryTree(): THREE.Group {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3f200c, roughness: 0.95 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 6, 10), trunkMat);
  trunk.position.y = 3;
  g.add(trunk);

  const foliageMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.75 });
  for (let c = 0; c < 5; c++) {
    const cluster = new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 10), foliageMat);
    cluster.position.set(
      (Math.random() - 0.5) * 1.8,
      5.2 + Math.random() * 1.8,
      (Math.random() - 0.5) * 1.8
    );
    g.add(cluster);
  }
  return g;
}

function createDetailedStatue(mat: THREE.Material, isHashirama: boolean): THREE.Group {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.5, 1.8), mat);
  torso.position.y = 2.75;
  g.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(1.1, 14, 14), mat);
  head.position.y = 6.2;
  g.add(head);

  // Samurai Armor Shoulders
  const padL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 1.4), mat);
  padL.position.set(-1.4, 4.6, 0);
  g.add(padL);

  const padR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 1.4), mat);
  padR.position.set(1.4, 4.6, 0);
  g.add(padR);

  // Hand Seal / Weapon
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.5, 8), mat);
  arm.position.set(isHashirama ? 1.6 : -1.6, 3.8, 0.8);
  arm.rotation.x = 0.5;
  g.add(arm);

  return g;
}
