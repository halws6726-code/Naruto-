import { FighterEntity, Projectile, Particle, DamageNumber, CharacterId } from '../types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from './physics';

export class GameRenderer {
  private arenaImages: Record<string, HTMLImageElement> = {};

  public loadArenaImage(id: string, src: string) {
    if (!this.arenaImages[id]) {
      const img = new Image();
      img.src = src;
      img.crossOrigin = 'anonymous';
      this.arenaImages[id] = img;
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    arenaId: string,
    fighters: FighterEntity[],
    projectiles: Projectile[],
    particles: Particle[],
    damageNumbers: DamageNumber[],
    screenShake: number
  ) {
    ctx.save();

    // Screen Shake effect on heavy impacts / ultimate
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 8;
      const shakeY = (Math.random() - 0.5) * screenShake * 8;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Arena Background
    this.drawArena(ctx, arenaId);

    // 2. Draw Ground Shadows
    for (const f of fighters) {
      this.drawShadow(ctx, f.x + f.width / 2, GROUND_Y, f.width * 0.9, f.y + f.height);
      // Clones shadows
      if (f.clones) {
        for (const clone of f.clones) {
          this.drawShadow(ctx, clone.x + 22, GROUND_Y, 36, GROUND_Y);
        }
      }
    }

    // 3. Draw Projectiles Shadows
    for (const p of projectiles) {
      this.drawShadow(ctx, p.x, GROUND_Y, p.radius * 1.2, p.y);
    }

    // 4. Draw Clones
    for (const f of fighters) {
      if (f.clones) {
        for (const clone of f.clones) {
          this.drawClone(ctx, clone, f.characterId);
        }
      }
    }

    // 5. Draw Fighters
    for (const f of fighters) {
      this.drawFighter(ctx, f);
    }

    // 6. Draw Projectiles
    for (const p of projectiles) {
      this.drawProjectile(ctx, p);
    }

    // 7. Draw Particles
    this.drawParticles(ctx, particles);

    // 8. Draw Damage Numbers
    this.drawDamageNumbers(ctx, damageNumbers);

    ctx.restore();
  }

  private drawArena(ctx: CanvasRenderingContext2D, arenaId: string) {
    const img = this.arenaImages[arenaId];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      // Fallback stylized anime gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.6, '#312e81');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Cinematic Arena Depth Vignette & Ground line
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
    groundGrad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    groundGrad.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Subtle arena battle baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();
  }

  private drawShadow(ctx: CanvasRenderingContext2D, centerX: number, groundY: number, baseWidth: number, currentY: number) {
    const distToGround = Math.max(0, groundY - currentY);
    const scale = Math.max(0.3, 1 - distToGround / 350);
    const alpha = Math.max(0.1, 0.45 * scale);

    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(centerX, groundY + 4, (baseWidth / 2) * scale, (8 * scale), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawFighter(ctx: CanvasRenderingContext2D, f: FighterEntity) {
    ctx.save();

    // Blink on invulnerability
    if (f.isInvulnerable && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Substitution wood log effect
    if (f.substituteEffectTimer > 0) {
      this.drawWoodLog(ctx, f.x, f.y);
      ctx.restore();
      return;
    }

    // Chakra Charge Aura
    if (f.isChargingChakra || f.specialAura) {
      this.drawChakraAura(ctx, f);
    }

    // Direction flip
    const isFacingLeft = f.facing === 'left';
    ctx.translate(f.x + f.width / 2, f.y + f.height / 2);
    if (isFacingLeft) {
      ctx.scale(-1, 1);
    }

    // Character drawing centered at (0, 0)
    switch (f.characterId) {
      case 'naruto':
        this.renderNaruto(ctx, f);
        break;
      case 'sasuke':
        this.renderSasuke(ctx, f);
        break;
      case 'kakashi':
        this.renderKakashi(ctx, f);
        break;
      case 'itachi':
        this.renderItachi(ctx, f);
        break;
      case 'gaara':
        this.renderGaara(ctx, f);
        break;
    }

    ctx.restore();
  }

  private drawChakraAura(ctx: CanvasRenderingContext2D, f: FighterEntity) {
    const time = Date.now() / 150;
    const auraColor = f.characterId === 'naruto' ? 'rgba(56, 189, 248, 0.5)' :
                      f.characterId === 'sasuke' ? 'rgba(96, 165, 250, 0.5)' :
                      f.characterId === 'kakashi' ? 'rgba(192, 132, 252, 0.5)' :
                      f.characterId === 'itachi' ? 'rgba(244, 63, 94, 0.5)' :
                      'rgba(251, 191, 36, 0.5)';

    ctx.save();
    ctx.fillStyle = auraColor;
    ctx.filter = 'blur(6px)';

    const pulse = Math.sin(time) * 6;
    ctx.beginPath();
    ctx.ellipse(f.x + f.width / 2, f.y + f.height / 2 + 5, f.width / 2 + 14 + pulse, f.height / 2 + 10 + pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawWoodLog(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    // Wooden log substitution
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(x + 5, y + 20, 34, 55);
    ctx.fillStyle = '#a16207';
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 20, 17, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wood rings
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 20, 10, 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Ninja leaf cut
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 16, 6, 3, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- CHARACTER SPRITES VECTORS ---

  // 1. NARUTO
  private renderNaruto(ctx: CanvasRenderingContext2D, f: FighterEntity) {
    const isAttacking = f.state.startsWith('attack');
    const isJutsu1 = f.state === 'jutsu1';
    const isJumping = f.state === 'jump' || f.state === 'fall';
    const isBlocking = f.state === 'block';

    // Body Offset for animation
    let punchOffset = 0;
    let kickOffset = 0;
    if (f.state === 'attack1') punchOffset = 18;
    if (f.state === 'attack2') kickOffset = 16;
    if (f.state === 'attack3') punchOffset = 25;

    // Head
    const headY = -24;
    ctx.fillStyle = '#fed7aa'; // Skin tone
    ctx.beginPath();
    ctx.arc(0, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Spiky Yellow Hair
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(-14, headY - 5);
    ctx.lineTo(-18, headY - 18);
    ctx.lineTo(-8, headY - 14);
    ctx.lineTo(-4, headY - 24);
    ctx.lineTo(4, headY - 16);
    ctx.lineTo(12, headY - 25);
    ctx.lineTo(16, headY - 14);
    ctx.lineTo(20, headY - 18);
    ctx.lineTo(15, headY - 4);
    ctx.closePath();
    ctx.fill();

    // Leaf Headband (Konoha Protector)
    ctx.fillStyle = '#1e293b'; // Dark blue band
    ctx.fillRect(-12, headY - 7, 24, 7);
    ctx.fillStyle = '#94a3b8'; // Metal plate
    ctx.fillRect(-7, headY - 6, 14, 5);
    // Spiral insignia
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, headY - 3.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers marks on cheeks
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(3, headY + 1); ctx.lineTo(10, headY);
    ctx.moveTo(3, headY + 3); ctx.lineTo(10, headY + 3);
    ctx.moveTo(3, headY + 5); ctx.lineTo(10, headY + 6);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#0284c7'; // Blue eyes
    ctx.fillRect(4, headY - 2, 3, 3);

    // Torso (Orange Jacket + Blue collar)
    ctx.fillStyle = '#ea580c'; // Vibrant orange
    ctx.fillRect(-11, headY + 12, 22, 26);
    // Blue shoulder trim
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-11, headY + 12, 22, 6);
    // White collar
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-6, headY + 11, 12, 4);

    // Legs (Orange pants + bandage on right leg)
    ctx.fillStyle = '#ea580c';
    if (isJumping) {
      // Tucked jump legs
      ctx.fillRect(-10, headY + 38, 8, 14);
      ctx.fillRect(2, headY + 36, 12, 12);
    } else if (kickOffset > 0) {
      // High kick
      ctx.fillRect(-8, headY + 38, 8, 22);
      ctx.fillRect(0, headY + 36, 24, 9);
    } else {
      ctx.fillRect(-10, headY + 38, 9, 22);
      ctx.fillRect(2, headY + 38, 9, 22);
      // Bandage tape on knee
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(2, headY + 44, 9, 5);
    }

    // Ninja Blue Sandals
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-11, headY + 58, 11, 5);
    ctx.fillRect(kickOffset > 0 ? 18 : 2, headY + (kickOffset > 0 ? 36 : 58), 10, 5);

    // Arms & Hands
    ctx.fillStyle = '#ea580c';
    if (isBlocking) {
      // Guard stance
      ctx.fillRect(4, headY + 14, 12, 16);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(8, headY + 12, 8, 8);
    } else if (punchOffset > 0) {
      // Extended punch
      ctx.fillRect(4, headY + 15, 14 + punchOffset, 7);
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(18 + punchOffset, headY + 18.5, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (isJutsu1 || f.state === 'ultimate') {
      // Rasengan stance: holding sphere in right hand
      ctx.fillRect(4, headY + 16, 14, 7);
      this.drawRasenganSphere(ctx, 22, headY + 20, f.state === 'ultimate' ? 24 : 15);
    } else {
      // Idle arm
      ctx.fillRect(-6, headY + 16, 7, 16);
      ctx.fillRect(3, headY + 16, 7, 16);
    }
  }

  private drawRasenganSphere(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    const time = Date.now() / 80;
    ctx.save();
    // Outer glow
    const grad = ctx.createRadialGradient(x, y, 2, x, y, radius * 1.3);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#38bdf8');
    grad.addColorStop(0.8, '#0284c7');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Swirling energy filaments
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 0.9, radius * 0.45, time + (i * Math.PI) / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2. SASUKE
  private renderSasuke(ctx: CanvasRenderingContext2D, f: FighterEntity) {
    const isJumping = f.state === 'jump' || f.state === 'fall';
    const isJutsu1 = f.state === 'jutsu1';
    const isBlocking = f.state === 'block';

    let punchOffset = 0;
    if (f.state === 'attack1') punchOffset = 18;
    if (f.state === 'attack3') punchOffset = 25;

    const headY = -24;

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Dark Spiky Sasuke Hair (Fringe + Ducktail back spikes)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-16, headY - 4);
    ctx.lineTo(-24, headY - 14);
    ctx.lineTo(-14, headY - 20);
    ctx.lineTo(-6, headY - 26);
    ctx.lineTo(2, headY - 24);
    ctx.lineTo(14, headY - 18);
    ctx.lineTo(20, headY - 8);
    ctx.lineTo(12, headY);
    ctx.lineTo(14, headY + 12); // Long side bang
    ctx.lineTo(8, headY + 6);
    ctx.lineTo(-2, headY + 12);
    ctx.closePath();
    ctx.fill();

    // Headband
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, headY - 7, 24, 7);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-7, headY - 6, 14, 5);

    // Sharingan Red Eye
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(5, headY - 1, 3, 0, Math.PI * 2);
    ctx.fill();
    // Tomoe pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(5, headY - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Torso (Navy Blue Shirt + High Collar)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-11, headY + 12, 22, 26);
    // White high popped collar
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-12, headY + 10, 6, 9);
    ctx.fillRect(6, headY + 10, 6, 9);

    // White Arm Warmers
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-12, headY + 20, 4, 12);
    ctx.fillRect(8, headY + 20, 4, 12);

    // Pants (White/Cream shorts)
    ctx.fillStyle = '#f8fafc';
    if (isJumping) {
      ctx.fillRect(-10, headY + 38, 8, 14);
      ctx.fillRect(2, headY + 36, 12, 12);
    } else {
      ctx.fillRect(-10, headY + 38, 9, 14);
      ctx.fillRect(2, headY + 38, 9, 14);
    }

    // Shin warmers & sandals
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-10, headY + 48, 8, 15);
    ctx.fillRect(2, headY + 48, 8, 15);

    // Arms & Jutsu effects
    if (isBlocking) {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(4, headY + 14, 12, 16);
    } else if (punchOffset > 0) {
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(4, headY + 15, 14 + punchOffset, 7);
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(18 + punchOffset, headY + 18.5, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (isJutsu1 || f.state === 'ultimate') {
      // Chidori Electric Blade in hand
      this.drawChidoriLightning(ctx, 22, headY + 22, f.state === 'ultimate' ? 32 : 20);
    }
  }

  private drawChidoriLightning(ctx: CanvasRenderingContext2D, x: number, y: number, length: number) {
    ctx.save();
    // Inner white core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    for (let i = 0; i < 4; i++) {
      const segX = x + (i * length) / 3;
      const segY = y + (Math.random() - 0.5) * 16;
      ctx.lineTo(segX, segY);
    }
    ctx.stroke();

    // Secondary blue sparks
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.2) * length, y + (Math.random() - 0.5) * 24);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. KAKASHI
  private renderKakashi(ctx: CanvasRenderingContext2D, f: FighterEntity) {
    const isJutsu1 = f.state === 'jutsu1';
    const headY = -24;

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Spiky Silver/White Hair tilted to left
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-16, headY - 4);
    ctx.lineTo(-24, headY - 18);
    ctx.lineTo(-12, headY - 26);
    ctx.lineTo(-4, headY - 30);
    ctx.lineTo(6, headY - 26);
    ctx.lineTo(16, headY - 14);
    ctx.lineTo(12, headY - 2);
    ctx.closePath();
    ctx.fill();

    // Tilted Headband showing Sharingan
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, headY - 7, 24, 7);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-7, headY - 6, 14, 5);

    // Left eye Sharingan uncovered
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(4, headY - 2, 3, 3);

    // Mask covering lower face
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-10, headY + 1);
    ctx.lineTo(10, headY + 1);
    ctx.lineTo(6, headY + 13);
    ctx.lineTo(-6, headY + 13);
    ctx.closePath();
    ctx.fill();

    // Torso: Jonin Green Flak Jacket + Dark Blue undershirt
    ctx.fillStyle = '#15803d'; // Green vest
    ctx.fillRect(-12, headY + 12, 24, 25);
    // Vest pockets
    ctx.fillStyle = '#166534';
    ctx.fillRect(-9, headY + 22, 7, 8);
    ctx.fillRect(2, headY + 22, 7, 8);
    // Red spiral badge on left arm
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(-11, headY + 18, 3, 0, Math.PI * 2);
    ctx.fill();

    // Dark blue pants
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, headY + 37, 9, 23);
    ctx.fillRect(2, headY + 37, 9, 23);

    // White holster pouch on right leg
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(4, headY + 44, 7, 6);

    // Raikiri lightning on jutsu
    if (isJutsu1 || f.state === 'ultimate') {
      this.drawChidoriLightning(ctx, 24, headY + 22, 26);
    }
  }

  // 4. ITACHI
  private renderItachi(ctx: CanvasRenderingContext2D, f: FighterEntity) {
    const headY = -24;

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Dark sleek hair + low ponytail
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, headY - 4, 14, Math.PI, Math.PI * 2);
    ctx.lineTo(12, headY + 10);
    ctx.lineTo(-12, headY + 10);
    ctx.closePath();
    ctx.fill();
    // Ponytail behind
    ctx.fillRect(-14, headY + 4, 6, 20);

    // Tear troughs line marks under eyes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(2, headY + 2); ctx.lineTo(-2, headY + 10);
    ctx.moveTo(7, headY + 2); ctx.lineTo(12, headY + 10);
    ctx.stroke();

    // Mangekyo Sharingan Red Eyes
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(5, headY - 1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Akatsuki Cloak (Black with high flared collar and Red Cloud)
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.moveTo(-14, headY + 6);
    ctx.lineTo(14, headY + 6);
    ctx.lineTo(16, headY + 56);
    ctx.lineTo(-16, headY + 56);
    ctx.closePath();
    ctx.fill();

    // High Red-lined inner collar
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-14, headY + 6, 4, 14);
    ctx.fillRect(10, headY + 6, 4, 14);

    // Akatsuki Red Cloud symbol
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.ellipse(0, headY + 28, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 5. GAARA
  private renderGaara(ctx: CanvasRenderingContext2D, f: FighterEntity) {
    const headY = -24;

    // Sand Gourd on back (Giant Calabash)
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(-14, headY + 18, 12, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(-14, headY + 36, 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    // Gourd brown cork & ribbon
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-16, headY + 2, 6, 6);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Red Spiky Hair
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-14, headY - 4);
    ctx.lineTo(-18, headY - 14);
    ctx.lineTo(-8, headY - 18);
    ctx.lineTo(0, headY - 22);
    ctx.lineTo(8, headY - 18);
    ctx.lineTo(16, headY - 14);
    ctx.lineTo(14, headY - 2);
    ctx.closePath();
    ctx.fill();

    // Love Kanji (愛) on forehead
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('愛', 3, headY - 5);

    // Dark Eyeliner Ring around pale eyes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(3, headY - 2, 5, 4);
    ctx.fillStyle = '#67e8f9'; // Pale turquoise eye
    ctx.fillRect(4, headY - 1, 3, 2);

    // Kazekage Red Tunic + White sash
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(-11, headY + 12, 22, 28);
    // White diagonal sash holding gourd
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-12, headY + 12);
    ctx.lineTo(-7, headY + 12);
    ctx.lineTo(12, headY + 36);
    ctx.lineTo(7, headY + 36);
    ctx.closePath();
    ctx.fill();

    // Dark pants
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-10, headY + 40, 9, 20);
    ctx.fillRect(2, headY + 40, 9, 20);

    // Swirling Sand Shield if active
    if (f.state === 'jutsu2' || f.sandShieldActive) {
      this.drawSandShieldEffect(ctx, 0, headY + 20);
    }
  }

  private drawSandShieldEffect(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const time = Date.now() / 120;
    ctx.save();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y, 32 + Math.sin(time) * 4, 46, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(217, 119, 6, 0.25)';
    ctx.fill();
    ctx.restore();
  }

  // --- SHADOW CLONES ---
  private drawClone(ctx: CanvasRenderingContext2D, clone: { x: number; y: number; facing: 'left' | 'right' }, characterId: CharacterId) {
    ctx.save();
    ctx.globalAlpha = 0.72; // Slightly transparent to distinguish clones
    const isFacingLeft = clone.facing === 'left';
    ctx.translate(clone.x + 22, GROUND_Y - 40);
    if (isFacingLeft) {
      ctx.scale(-1, 1);
    }
    // Render as a running/attacking clone
    this.renderNaruto(ctx, {
      id: 99,
      characterId,
      x: clone.x,
      y: GROUND_Y - 80,
      vx: 0,
      vy: 0,
      width: 44,
      height: 80,
      facing: clone.facing,
      health: 100,
      maxHealth: 100,
      chakra: 100,
      maxChakra: 100,
      substitutionGauge: 100,
      state: 'attack1',
      stateTimer: 5,
      comboCount: 1,
      comboTimer: 10,
      isGrounded: true,
      isBlocking: false,
      isInvulnerable: false,
      invulnerableTimer: 0,
      hitStun: 0,
      jutsu1Cooldown: 0,
      jutsu2Cooldown: 0,
      substituteEffectTimer: 0,
      isChargingChakra: false,
      chargeParticleTimer: 0,
      specialAura: false,
      clones: []
    });
    ctx.restore();
  }

  // --- PROJECTILES ---
  private drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile) {
    ctx.save();
    switch (p.type) {
      case 'shuriken': {
        const angle = (Date.now() / 20) % (Math.PI * 2);
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);

        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;

        // 4 pointed star
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.lineTo(Math.cos(a) * p.radius, Math.sin(a) * p.radius);
          const aMid = a + Math.PI / 4;
          ctx.lineTo(Math.cos(aMid) * (p.radius * 0.35), Math.sin(aMid) * (p.radius * 0.35));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Center hole
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'fireball': {
        const grad = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, p.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#fbbf24');
        grad.addColorStop(0.7, '#ea580c');
        grad.addColorStop(1, 'rgba(185, 28, 28, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Fire tail
        const tailDir = p.vx > 0 ? -1 : 1;
        ctx.fillStyle = 'rgba(234, 88, 12, 0.6)';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.radius * 0.7);
        ctx.lineTo(p.x + tailDir * p.radius * 1.8, p.y);
        ctx.lineTo(p.x, p.y + p.radius * 0.7);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'amaterasu_flame': {
        ctx.fillStyle = '#000000';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'sand_bullet': {
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      default: {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // --- PARTICLES ---
  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const part of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, part.alpha);

      if (part.shape === 'smoke') {
        ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (part.shape === 'spark') {
        ctx.fillStyle = part.color;
        ctx.fillRect(part.x, part.y, part.size, part.size);
      } else if (part.shape === 'crow' || part.shape === 'feather') {
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.ellipse(part.x, part.y, part.size * 1.5, part.size * 0.6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- DAMAGE NUMBERS ---
  private drawDamageNumbers(ctx: CanvasRenderingContext2D, numbers: DamageNumber[]) {
    ctx.save();
    for (const num of numbers) {
      ctx.globalAlpha = Math.max(0, num.alpha);
      ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = num.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(num.text, num.x, num.y);
      ctx.fillText(num.text, num.x, num.y);
    }
    ctx.restore();
  }
}

export const renderer = new GameRenderer();
