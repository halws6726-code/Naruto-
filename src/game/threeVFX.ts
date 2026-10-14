import * as THREE from 'three';
import { Projectile } from '../types/game';

export interface ThreeVFXManager {
  addProjectile: (p: Projectile) => void;
  updateProjectiles: (projectiles: Projectile[], delta: number) => void;
  spawnSubstitutionLog: (x: number, y: number, z: number) => void;
  spawnHitSparks: (x: number, y: number, z: number, color?: number) => void;
  updateVFX: (delta: number) => void;
  dispose: () => void;
}

export function createThreeVFX(scene: THREE.Scene): ThreeVFXManager {
  const projectileMeshes: Map<number, THREE.Object3D> = new Map();
  const dynamicEffects: { obj: THREE.Object3D; lifetime: number; maxLifetime: number; update?: (d: number) => void }[] = [];

  // Reusable Geometries & Materials
  const shurikenGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.04, 4);
  const shurikenMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });

  const fireballGeo = new THREE.SphereGeometry(0.65, 16, 16);
  const fireballMat = new THREE.MeshBasicMaterial({ color: 0xea580c });

  const sandGeo = new THREE.DodecahedronGeometry(0.5);
  const sandMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });

  const amaterasuGeo = new THREE.DodecahedronGeometry(0.45);
  const amaterasuMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

  const addProjectile = (p: Projectile) => {
    let mesh: THREE.Object3D;

    // Convert 2D canvas coordinates to 3D world coordinates
    const worldX = (p.x - 480) * 0.035;
    const worldY = (435 - p.y) * 0.035;
    const worldZ = 0;

    if (p.type === 'shuriken') {
      mesh = new THREE.Mesh(shurikenGeo, shurikenMat);
      mesh.rotation.x = Math.PI / 2;
    } else if (p.type === 'fireball') {
      mesh = new THREE.Group();
      const core = new THREE.Mesh(fireballGeo, fireballMat);
      mesh.add(core);
      const light = new THREE.PointLight(0xea580c, 3, 6);
      mesh.add(light);
    } else if (p.type === 'sand_bullet') {
      mesh = new THREE.Mesh(sandGeo, sandMat);
    } else {
      mesh = new THREE.Mesh(amaterasuGeo, amaterasuMat);
    }

    mesh.position.set(worldX, worldY, worldZ);
    scene.add(mesh);
    projectileMeshes.set(p.id, mesh);
  };

  const updateProjectiles = (projectiles: Projectile[], delta: number) => {
    const activeIds = new Set(projectiles.map(p => p.id));

    // Remove dead projectiles
    for (const [id, mesh] of projectileMeshes.entries()) {
      if (!activeIds.has(id)) {
        scene.remove(mesh);
        projectileMeshes.delete(id);
      }
    }

    // Update active projectiles
    for (const p of projectiles) {
      const mesh = projectileMeshes.get(p.id);
      if (mesh) {
        mesh.position.x = (p.x - 480) * 0.035;
        mesh.position.y = (435 - p.y) * 0.035;
        if (p.type === 'shuriken') {
          mesh.rotation.z += delta * 25;
        } else if (p.type === 'fireball') {
          mesh.rotation.y += delta * 6;
        }
      } else {
        addProjectile(p);
      }
    }
  };

  // 3D Kawarimi Wooden Trunk Log
  const spawnSubstitutionLog = (x: number, y: number, z: number) => {
    const logGroup = new THREE.Group();
    const logGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 12);
    const logMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const logMesh = new THREE.Mesh(logGeo, logMat);
    logGroup.add(logMesh);

    // Green leaf cutting on top
    const leafMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x22c55e })
    );
    leafMesh.position.set(0.15, 0.75, 0.05);
    logGroup.add(leafMesh);

    logGroup.position.set(x, y + 0.7, z);
    scene.add(logGroup);

    // Smoke burst around log
    const smokeGroup = new THREE.Group();
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 8; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.35 + Math.random() * 0.25, 8, 8), smokeMat);
      puff.position.set(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8
      );
      smokeGroup.add(puff);
    }
    smokeGroup.position.set(x, y + 0.7, z);
    scene.add(smokeGroup);

    dynamicEffects.push({
      obj: logGroup,
      lifetime: 0,
      maxLifetime: 1.2,
      update: (d) => {
        logGroup.rotation.y += d * 2;
      }
    });

    dynamicEffects.push({
      obj: smokeGroup,
      lifetime: 0,
      maxLifetime: 0.8,
      update: (d) => {
        smokeGroup.scale.multiplyScalar(1 + d * 1.5);
        smokeMat.opacity = Math.max(0, smokeMat.opacity - d * 1.2);
      }
    });
  };

  // 3D Hit Sparks
  const spawnHitSparks = (x: number, y: number, z: number, color = 0xf59e0b) => {
    const sparkGroup = new THREE.Group();
    const sparkMat = new THREE.MeshBasicMaterial({ color });
    for (let i = 0; i < 7; i++) {
      const spark = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), sparkMat);
      spark.position.set(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      sparkGroup.add(spark);
    }
    sparkGroup.position.set(x, y, z);
    scene.add(sparkGroup);

    dynamicEffects.push({
      obj: sparkGroup,
      lifetime: 0,
      maxLifetime: 0.35,
      update: (d) => {
        sparkGroup.scale.multiplyScalar(1 + d * 3);
      }
    });
  };

  const updateVFX = (delta: number) => {
    for (let i = dynamicEffects.length - 1; i >= 0; i--) {
      const fx = dynamicEffects[i];
      fx.lifetime += delta;
      if (fx.update) fx.update(delta);
      if (fx.lifetime >= fx.maxLifetime) {
        scene.remove(fx.obj);
        dynamicEffects.splice(i, 1);
      }
    }
  };

  const dispose = () => {
    for (const [, mesh] of projectileMeshes.entries()) {
      scene.remove(mesh);
    }
    projectileMeshes.clear();
    for (const fx of dynamicEffects) {
      scene.remove(fx.obj);
    }
    dynamicEffects.length = 0;
  };

  return {
    addProjectile,
    updateProjectiles,
    spawnSubstitutionLog,
    spawnHitSparks,
    updateVFX,
    dispose
  };
}
