import * as THREE from 'three';
import { CharacterId, FighterState } from '../types/game';
import { getAnimeFaceTexture, getAnimeTorsoTexture } from './threeTextures';

export interface ThreeFighterNode {
  group: THREE.Group;
  head: THREE.Group;
  torso: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  auraMesh: THREE.Mesh;
  specialMesh: THREE.Group;
  specialLight: THREE.PointLight;
  characterId: CharacterId;
  updatePose: (state: FighterState, timer: number, delta: number, isMoving: boolean) => void;
  dispose: () => void;
}

// Inverted Hull Material for crisp Manga / Anime Ink Outlines
const outlineMat = new THREE.MeshBasicMaterial({
  color: 0x09090b,
  side: THREE.BackSide
});

function addOutline(mesh: THREE.Mesh, scale = 1.07): THREE.Mesh {
  const outline = new THREE.Mesh(mesh.geometry, outlineMat);
  outline.scale.set(scale, scale, scale);
  mesh.add(outline);
  return outline;
}

export function createThreeCharacter(characterId: CharacterId): ThreeFighterNode {
  const root = new THREE.Group();

  // Face & Torso Procedural Textures
  const faceTexture = getAnimeFaceTexture(characterId);
  const torsoTexture = getAnimeTorsoTexture(characterId);

  // Organic Humanoid Proportions & Smooth Silhouettes
  // 1. Torso Group
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 1.0;
  root.add(torsoGroup);

  // 2. Head Group
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.88;
  torsoGroup.add(headGroup);

  // 3. Limbs with organic tapering
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(0.38, 0.46, 0);
  torsoGroup.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(-0.38, 0.46, 0);
  torsoGroup.add(rightArmGroup);

  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(0.18, 0, 0);
  torsoGroup.add(leftLegGroup);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(-0.18, 0, 0);
  torsoGroup.add(rightLegGroup);

  // Special Jutsu Group & Point Light
  const specialGroup = new THREE.Group();
  specialGroup.visible = false;
  rightArmGroup.add(specialGroup);

  const specialLight = new THREE.PointLight(0x38bdf8, 0, 10);
  specialGroup.add(specialLight);

  // Holographic Glowing Chakra Aura
  const auraGeo = new THREE.SphereGeometry(1.3, 24, 24);
  const auraMat = new THREE.MeshBasicMaterial({
    color: characterId === 'naruto' ? 0x38bdf8 :
           characterId === 'sasuke' ? 0x60a5fa :
           characterId === 'kakashi' ? 0xc084fc :
           characterId === 'itachi' ? 0xf43f5e : 0xfbbf24,
    transparent: true,
    opacity: 0.0,
    wireframe: true
  });
  const auraMesh = new THREE.Mesh(auraGeo, auraMat);
  auraMesh.position.y = 1.0;
  root.add(auraMesh);

  // ================= HEAD & FACE (Anime Expression) =================
  const headGeo = new THREE.SphereGeometry(0.26, 24, 24);
  const headMat = new THREE.MeshStandardMaterial({
    map: faceTexture,
    roughness: 0.6,
    metalness: 0.05
  });
  const headMesh = new THREE.Mesh(headGeo, headMat);
  // Rotate texture so the face points forward (+Z)
  headMesh.rotation.y = -Math.PI / 2;
  headMesh.castShadow = true;
  addOutline(headMesh, 1.06);
  headGroup.add(headMesh);

  // ================= TORSO WITH CONTOURED SHAPE =================
  const torsoGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.65, 16);
  const torsoMat = new THREE.MeshStandardMaterial({
    map: torsoTexture,
    roughness: 0.65,
    metalness: 0.1
  });
  const chestMesh = new THREE.Mesh(torsoGeo, torsoMat);
  chestMesh.position.y = 0.32;
  chestMesh.castShadow = true;
  chestMesh.rotation.y = -Math.PI / 2;
  addOutline(chestMesh, 1.06);
  torsoGroup.add(chestMesh);

  // ================= CHARACTER SPECIFIC HAIR & CLOTHING =================
  buildCharacterHairAndAccs(characterId, headGroup, torsoGroup, leftArmGroup, rightArmGroup, leftLegGroup, rightLegGroup, specialGroup, specialLight);

  // Animation Kinematics
  const updatePose = (state: FighterState, timer: number, delta: number, isMoving: boolean) => {
    const t = timer * 0.16;

    headGroup.rotation.set(0, 0, 0);
    torsoGroup.rotation.set(0, 0, 0);
    leftArmGroup.rotation.set(0, 0, 0);
    rightArmGroup.rotation.set(0, 0, 0);
    leftLegGroup.rotation.set(0, 0, 0);
    rightLegGroup.rotation.set(0, 0, 0);
    specialGroup.visible = false;
    specialLight.intensity = 0;

    if (state === 'charge') {
      auraMat.opacity = 0.55 + Math.sin(t * 4) * 0.25;
      auraMesh.rotation.y += delta * 5;
      auraMesh.rotation.x += delta * 2.5;
    } else {
      auraMat.opacity = 0;
    }

    switch (state) {
      case 'idle': {
        const breath = Math.sin(t) * 0.04;
        torsoGroup.position.y = 1.0 + breath;
        headGroup.rotation.x = Math.sin(t) * 0.03;
        leftArmGroup.rotation.x = Math.sin(t) * 0.1 + 0.15;
        rightArmGroup.rotation.x = -Math.sin(t) * 0.1 + 0.15;
        break;
      }

      case 'run': {
        torsoGroup.rotation.x = 0.52;
        const runCycle = Math.sin(t * 2.8);
        leftLegGroup.rotation.x = runCycle * 0.95;
        rightLegGroup.rotation.x = -runCycle * 0.95;
        leftArmGroup.rotation.x = -1.25;
        rightArmGroup.rotation.x = -1.25;
        leftArmGroup.rotation.z = -0.35;
        rightArmGroup.rotation.z = 0.35;
        break;
      }

      case 'jump':
      case 'fall': {
        torsoGroup.rotation.x = 0.25;
        leftLegGroup.rotation.x = -0.7;
        rightLegGroup.rotation.x = 0.5;
        leftArmGroup.rotation.x = 1.4;
        rightArmGroup.rotation.x = -0.9;
        break;
      }

      case 'attack1': {
        rightArmGroup.rotation.x = Math.PI / 2 + 0.15;
        rightArmGroup.rotation.y = -0.35;
        leftArmGroup.rotation.x = -0.25;
        torsoGroup.rotation.y = 0.4;
        break;
      }

      case 'attack2': {
        rightLegGroup.rotation.x = Math.PI / 2 + 0.2;
        rightLegGroup.rotation.z = -0.45;
        torsoGroup.rotation.y = -0.6;
        leftArmGroup.rotation.z = 0.7;
        break;
      }

      case 'attack3': {
        rightArmGroup.rotation.x = 2.4;
        torsoGroup.rotation.x = -0.3;
        break;
      }

      case 'jutsu1': {
        specialGroup.visible = true;
        specialLight.intensity = 4.0;
        rightArmGroup.rotation.x = 1.45;
        rightArmGroup.rotation.y = -0.25;
        torsoGroup.rotation.y = 0.45;
        torsoGroup.rotation.x = 0.25;
        specialGroup.rotation.z += delta * 22;
        specialGroup.rotation.y += delta * 14;
        break;
      }

      case 'jutsu2': {
        leftArmGroup.rotation.x = 1.25;
        leftArmGroup.rotation.z = 0.65;
        rightArmGroup.rotation.x = 1.25;
        rightArmGroup.rotation.z = -0.65;
        break;
      }

      case 'ultimate': {
        specialGroup.visible = true;
        specialLight.intensity = 7.0;
        specialGroup.scale.set(2.4, 2.4, 2.4);
        specialGroup.rotation.z += delta * 28;
        rightArmGroup.rotation.x = 1.65;
        torsoGroup.rotation.x = 0.35;
        auraMat.opacity = 0.85;
        break;
      }

      case 'block': {
        leftArmGroup.rotation.x = 1.35;
        leftArmGroup.rotation.z = 0.55;
        rightArmGroup.rotation.x = 1.35;
        rightArmGroup.rotation.z = -0.55;
        torsoGroup.rotation.x = 0.22;
        break;
      }

      case 'hit':
      case 'knockback': {
        torsoGroup.rotation.x = -0.55;
        headGroup.rotation.x = -0.35;
        leftArmGroup.rotation.x = -0.9;
        rightArmGroup.rotation.x = -0.9;
        break;
      }

      case 'charge': {
        torsoGroup.position.y = 0.82;
        leftLegGroup.rotation.x = -0.45;
        rightLegGroup.rotation.x = -0.45;
        leftArmGroup.rotation.x = 0.85;
        leftArmGroup.rotation.z = 0.55;
        rightArmGroup.rotation.x = 0.85;
        rightArmGroup.rotation.z = -0.55;
        break;
      }
    }
  };

  const dispose = () => {
    faceTexture.dispose();
    torsoTexture.dispose();
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
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
    group: root,
    head: headGroup,
    torso: torsoGroup,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    leftLeg: leftLegGroup,
    rightLeg: rightLegGroup,
    auraMesh,
    specialMesh: specialGroup,
    specialLight,
    characterId,
    updatePose,
    dispose
  };
}

function buildCharacterHairAndAccs(
  charId: CharacterId,
  head: THREE.Group,
  torso: THREE.Group,
  leftArm: THREE.Group,
  rightArm: THREE.Group,
  leftLeg: THREE.Group,
  rightLeg: THREE.Group,
  special: THREE.Group,
  specialLight: THREE.PointLight
) {
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.55 });
  const armGeo = new THREE.CylinderGeometry(0.085, 0.08, 0.52, 14);
  const handGeo = new THREE.SphereGeometry(0.095, 12, 12);
  const legGeo = new THREE.CylinderGeometry(0.095, 0.085, 0.68, 14);

  if (charId === 'naruto') {
    // Spiky Hair with Manga Cel highlights
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 });
    const hairHigh = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 });

    for (let i = 0; i < 16; i++) {
      const isHigh = i % 3 === 0;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 6), isHigh ? hairHigh : hairMat);
      const angle = (i / 16) * Math.PI * 2;
      spike.position.set(Math.cos(angle) * 0.19, 0.23 + (i % 2) * 0.05, Math.sin(angle) * 0.19);
      spike.rotation.set(Math.sin(angle) * 0.48, 0, -Math.cos(angle) * 0.48);
      addOutline(spike, 1.08);
      head.add(spike);
    }

    // White Fleece Collar
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.065, 8, 20), collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.65;
    torso.add(collar);

    // Arms (Orange Sleeves & Hands)
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.65 });
    for (const arm of [leftArm, rightArm]) {
      const s = new THREE.Mesh(armGeo, orangeMat);
      s.position.y = -0.26;
      addOutline(s, 1.06);
      arm.add(s);
      const h = new THREE.Mesh(handGeo, skinMat);
      h.position.y = -0.54;
      arm.add(h);
    }

    // Legs with bandages and sandals
    const sandalMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 });
    for (const leg of [leftLeg, rightLeg]) {
      const l = new THREE.Mesh(legGeo, orangeMat);
      l.position.y = -0.34;
      addOutline(l, 1.06);
      leg.add(l);
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.11, 0.25), sandalMat);
      f.position.set(0, -0.71, 0.06);
      leg.add(f);
    }

    // 3D Rasengan
    specialLight.color.setHex(0x38bdf8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), coreMat);
    special.add(core);

    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.72,
      roughness: 0.1
    });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), shellMat);
    special.add(shell);

    // Rotating Energy Ribbon Rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.016, 8, 24), ringMat);
      ring.rotation.set((r * Math.PI) / 3, (r * Math.PI) / 4, 0);
      special.add(ring);
    }
    special.position.set(0, -0.55, 0.18);

  } else if (charId === 'sasuke') {
    // Ducktail Dark Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    for (let i = 0; i < 16; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 6), hairMat);
      const angle = (i / 16) * Math.PI * 2;
      spike.position.set(Math.cos(angle) * 0.19, 0.24, Math.sin(angle) * 0.19);
      spike.rotation.set(Math.sin(angle) * 0.52, 0, -Math.cos(angle) * 0.52);
      addOutline(spike, 1.08);
      head.add(spike);
    }

    // White Arm Warmers & Navy Pants
    const navyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    for (const arm of [leftArm, rightArm]) {
      const s = new THREE.Mesh(armGeo, navyMat);
      s.position.y = -0.26;
      addOutline(s, 1.06);
      arm.add(s);
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.22, 14), whiteMat);
      w.position.y = -0.38;
      arm.add(w);
      const h = new THREE.Mesh(handGeo, skinMat);
      h.position.y = -0.54;
      arm.add(h);
    }

    for (const leg of [leftLeg, rightLeg]) {
      const l = new THREE.Mesh(legGeo, whiteMat);
      l.position.y = -0.34;
      addOutline(l, 1.06);
      leg.add(l);
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.11, 0.25), navyMat);
      f.position.set(0, -0.71, 0.06);
      leg.add(f);
    }

    // 3D Chidori Lightning
    specialLight.color.setHex(0x93c5fd);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.75 });
    for (let b = 0; b < 12; b++) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.48, 4), boltMat);
      bolt.position.set((Math.random() - 0.5) * 0.35, -0.55 + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.35);
      bolt.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      special.add(bolt);

      const glowPuff = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), glowMat);
      glowPuff.position.copy(bolt.position);
      special.add(glowPuff);
    }

  } else if (charId === 'kakashi') {
    // Silver Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 });
    for (let i = 0; i < 15; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.34, 6), hairMat);
      spike.position.set(-0.1 + Math.random() * 0.2, 0.26, -0.05 + Math.random() * 0.2);
      spike.rotation.set(0.35, 0, -0.52);
      addOutline(spike, 1.08);
      head.add(spike);
    }

    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    for (const arm of [leftArm, rightArm]) {
      const s = new THREE.Mesh(armGeo, darkMat);
      s.position.y = -0.26;
      addOutline(s, 1.06);
      arm.add(s);
      const h = new THREE.Mesh(handGeo, skinMat);
      h.position.y = -0.54;
      arm.add(h);
    }
    for (const leg of [leftLeg, rightLeg]) {
      const l = new THREE.Mesh(legGeo, darkMat);
      l.position.y = -0.34;
      addOutline(l, 1.06);
      leg.add(l);
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.11, 0.25), darkMat);
      f.position.set(0, -0.71, 0.06);
      leg.add(f);
    }

    // Raikiri
    specialLight.color.setHex(0xc084fc);
    const raikiri = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshBasicMaterial({ color: 0xc084fc }));
    special.add(raikiri);
    special.position.set(0, -0.55, 0.18);

  } else if (charId === 'itachi') {
    // Long Akatsuki Cloak Lower Half
    const cloakMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.85 });
    const cloakLower = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.25, 20), cloakMat);
    cloakLower.position.y = -0.18;
    addOutline(cloakLower, 1.05);
    torso.add(cloakLower);

    // Amaterasu
    specialLight.color.setHex(0xdc2626);
    const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28), new THREE.MeshBasicMaterial({ color: 0x09090b }));
    special.add(core);
    const rim = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36), new THREE.MeshBasicMaterial({ color: 0xdc2626, wireframe: true }));
    special.add(rim);
    special.position.set(0, -0.55, 0.18);

  } else if (charId === 'gaara') {
    // Gaara Red Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 });
    for (let i = 0; i < 15; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), hairMat);
      spike.position.set((Math.random() - 0.5) * 0.28, 0.24, (Math.random() - 0.5) * 0.28);
      addOutline(spike, 1.08);
      head.add(spike);
    }

    // Sand Gourd
    const gourdMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
    const gourdTop = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), gourdMat);
    gourdTop.position.set(0, 0.52, -0.34);
    addOutline(gourdTop, 1.06);
    torso.add(gourdTop);

    const gourdBottom = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), gourdMat);
    gourdBottom.position.set(0, 0.1, -0.36);
    addOutline(gourdBottom, 1.06);
    torso.add(gourdBottom);

    // Sand Shield
    specialLight.color.setHex(0xf59e0b);
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.9, transparent: true, opacity: 0.75 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), sandMat);
    special.add(dome);
  }
}
