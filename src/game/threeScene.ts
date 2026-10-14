import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js';
import { ArenaId, CharacterId, FighterEntity, Projectile } from '../types/game';
import { createThreeArena, ThreeArenaInstance } from './threeArena';
import { createThreeCharacter, ThreeFighterNode } from './threeCharacters';
import { createThreeVFX, ThreeVFXManager } from './threeVFX';

export type CameraMode = 'cinematic' | 'storm' | 'side' | 'close';

export class ThreeSceneManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private arena: ThreeArenaInstance | null = null;
  private p1Node: ThreeFighterNode | null = null;
  private p2Node: ThreeFighterNode | null = null;
  private vfx: ThreeVFXManager;
  private cameraMode: CameraMode = 'cinematic';
  private screenShake: number = 0;
  private freezeFrames: number = 0; // Hit stop

  constructor(container: HTMLElement, arenaId: ArenaId, p1Id: CharacterId, p2Id: CharacterId) {
    this.container = container;

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 2. Scene & Environment
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090d16);
    this.scene.fog = new THREE.FogExp2(0x090d16, 0.022);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Camera Setup
    this.camera = new THREE.PerspectiveCamera(
      46,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 4.8, 14.5);

    // 4. Lighting Rig
    this.setupLighting();

    // 5. Build Arena & Fighters
    this.setArena(arenaId);
    this.setupFighters(p1Id, p2Id);

    // 6. VFX Manager
    this.vfx = createThreeVFX(this.scene);

    // 7. Post-Processing Pipeline (Unreal Bloom + Anime Vignette + OutputPass)
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Unreal Bloom Pass for dazzling glowing jutsu & eyes
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      1.1,  // strength
      0.45, // radius
      0.7   // threshold
    );
    this.composer.addPass(this.bloomPass);

    // Cinematic Vignette Pass
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms['offset'].value = 0.95;
    vignettePass.uniforms['darkness'].value = 1.25;
    this.composer.addPass(vignettePass);

    // Final Output Pass with ACES Tone mapping & SRGB
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    // Handle Window Resize
    window.addEventListener('resize', this.onResize);
  }

  private setupLighting() {
    // Ambient Light
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    // Key Directional Sun Light with Shadows
    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.6);
    keyLight.position.set(12, 20, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.left = -16;
    keyLight.shadow.camera.right = 16;
    keyLight.shadow.camera.top = 16;
    keyLight.shadow.camera.bottom = -6;
    this.scene.add(keyLight);

    // Anime Colored Rim Lighting (Cyan and Amber backlights)
    const cyanRim = new THREE.DirectionalLight(0x38bdf8, 1.0);
    cyanRim.position.set(-16, 9, -9);
    this.scene.add(cyanRim);

    const amberRim = new THREE.DirectionalLight(0xf59e0b, 0.85);
    amberRim.position.set(16, 7, -9);
    this.scene.add(amberRim);
  }

  public setArena(arenaId: ArenaId) {
    if (this.arena) {
      this.scene.remove(this.arena.group);
      this.arena.dispose();
    }
    this.arena = createThreeArena(arenaId);
    this.scene.add(this.arena.group);
  }

  public setupFighters(p1Id: CharacterId, p2Id: CharacterId) {
    if (this.p1Node) {
      this.scene.remove(this.p1Node.group);
      this.p1Node.dispose();
    }
    if (this.p2Node) {
      this.scene.remove(this.p2Node.group);
      this.p2Node.dispose();
    }

    this.p1Node = createThreeCharacter(p1Id);
    this.scene.add(this.p1Node.group);

    this.p2Node = createThreeCharacter(p2Id);
    this.scene.add(this.p2Node.group);
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
  }

  public triggerScreenShake(intensity: number) {
    this.screenShake = intensity;
    // Boost bloom on heavy hit
    this.bloomPass.strength = Math.min(2.8, 1.1 + intensity * 0.25);
  }

  public triggerHitStop(frames = 3) {
    this.freezeFrames = frames;
  }

  public triggerSubstitution(x: number, y: number) {
    const worldX = (x - 480) * 0.035;
    const worldY = (435 - y) * 0.035;
    this.vfx.spawnSubstitutionLog(worldX, worldY, 0);
  }

  public triggerHitSparks(x: number, y: number, color?: number) {
    const worldX = (x - 480) * 0.035;
    const worldY = (435 - y) * 0.035;
    this.vfx.spawnHitSparks(worldX, worldY + 1.0, 0, color);
  }

  public update(
    p1: FighterEntity,
    p2: FighterEntity,
    projectiles: Projectile[],
    delta: number
  ) {
    // Hit stop freeze frame logic for impactful combat feeling
    if (this.freezeFrames > 0) {
      this.freezeFrames--;
      this.composer.render();
      return;
    }

    // 1. Update Arena
    if (this.arena) {
      this.arena.update(delta);
    }

    // 2. Synchronize P1 in 3D
    if (this.p1Node) {
      const p1WorldX = (p1.x - 480) * 0.035;
      const p1WorldY = Math.max(0, (435 - (p1.y + p1.height)) * 0.035);
      this.p1Node.group.position.set(p1WorldX, p1WorldY, 0);
      this.p1Node.group.rotation.y = p1.facing === 'right' ? Math.PI / 2 : -Math.PI / 2;
      this.p1Node.updatePose(p1.state, p1.stateTimer, delta, Math.abs(p1.vx) > 0.1);
    }

    // 3. Synchronize P2 in 3D
    if (this.p2Node) {
      const p2WorldX = (p2.x - 480) * 0.035;
      const p2WorldY = Math.max(0, (435 - (p2.y + p2.height)) * 0.035);
      this.p2Node.group.position.set(p2WorldX, p2WorldY, 0);
      this.p2Node.group.rotation.y = p2.facing === 'right' ? Math.PI / 2 : -Math.PI / 2;
      this.p2Node.updatePose(p2.state, p2.stateTimer, delta, Math.abs(p2.vx) > 0.1);
    }

    // 4. Update Projectiles & VFX
    this.vfx.updateProjectiles(projectiles, delta);
    this.vfx.updateVFX(delta);

    // 5. Update Dynamic 3D Camera Tracking
    this.updateCamera(p1, p2, delta);

    // Gradually return bloom to normal
    if (this.bloomPass.strength > 1.1) {
      this.bloomPass.strength = THREE.MathUtils.damp(this.bloomPass.strength, 1.1, 8, delta);
    }

    // 6. Render Post-Processed Frame
    this.composer.render();
  }

  private updateCamera(p1: FighterEntity, p2: FighterEntity, delta: number) {
    const p1X = (p1.x - 480) * 0.035;
    const p2X = (p2.x - 480) * 0.035;
    const midX = (p1X + p2X) / 2;
    const dist = Math.abs(p1X - p2X);

    let targetCamX = midX;
    let targetCamY = 3.8;
    let targetCamZ = 12.5 + dist * 0.45;
    let lookAtY = 2.0;

    if (this.cameraMode === 'storm') {
      // Third-person Ninja Storm battle camera over the shoulder
      const behindDir = p1.facing === 'right' ? -3.8 : 3.8;
      targetCamX = p1X + behindDir;
      targetCamY = 2.6;
      targetCamZ = 6.2;
      lookAtY = 1.8;
    } else if (this.cameraMode === 'side') {
      targetCamX = midX;
      targetCamY = 3.0;
      targetCamZ = 14 + dist * 0.35;
      lookAtY = 1.7;
    } else if (this.cameraMode === 'close') {
      targetCamX = p1X + (p1.facing === 'right' ? 2.2 : -2.2);
      targetCamY = 2.4;
      targetCamZ = 7.0;
      lookAtY = 1.6;
    }

    // Smooth exponential damping
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 6.5, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 6.5, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 6.5, delta);

    // Screen Shake application
    if (this.screenShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.screenShake * 0.35;
      this.camera.position.y += (Math.random() - 0.5) * this.screenShake * 0.35;
      this.screenShake = Math.max(0, this.screenShake - delta * 14);
    }

    this.camera.lookAt(midX, lookAtY, 0);
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  };

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    if (this.arena) this.arena.dispose();
    if (this.p1Node) this.p1Node.dispose();
    if (this.p2Node) this.p2Node.dispose();
    this.vfx.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
