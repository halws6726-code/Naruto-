import * as THREE from 'three';
import { CharacterId, ArenaId } from '../types/game';

// Helper to create an HTML5 canvas and return a Three.js CanvasTexture with proper color space
function createTextureFromCanvas(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 1. ANIME FACE TEXTURES (High detail, anime eyes, headband, markings)
export function getAnimeFaceTexture(charId: CharacterId): THREE.CanvasTexture {
  return createTextureFromCanvas(512, 512, (ctx) => {
    // Base skin tone
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(0, 0, 512, 512);

    // Common Konoha Headband Band (top region)
    if (charId === 'naruto' || charId === 'sasuke' || charId === 'kakashi') {
      ctx.fillStyle = charId === 'naruto' ? '#1e3a8a' : '#0f172a';
      ctx.fillRect(0, 40, 512, 130);

      // Metal Protector Plate
      const grad = ctx.createLinearGradient(120, 50, 392, 150);
      grad.addColorStop(0, '#94a3b8');
      grad.addColorStop(0.3, '#f1f5f9');
      grad.addColorStop(0.7, '#cbd5e1');
      grad.addColorStop(1, '#64748b');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(120, 55, 272, 100, 16);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Plate Rivets
      ctx.fillStyle = '#475569';
      for (const [rx, ry] of [[135, 70], [375, 70], [135, 140], [375, 140]]) {
        ctx.beginPath();
        ctx.arc(rx, ry, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Konoha Spiral Leaf Emblem
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(256, 105, 26, 0.4, Math.PI * 2.3);
      ctx.stroke();
      // Little triangle point on leaf
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(278, 115);
      ctx.lineTo(295, 125);
      ctx.lineTo(275, 132);
      ctx.closePath();
      ctx.fill();
    }

    // Character Specific Face Artwork
    if (charId === 'naruto') {
      // Big expressive Anime Eyes
      for (const [cx, isLeft] of [[190, true], [322, false]] as [number, boolean][]) {
        // Eye White
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx, 260, 42, 32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Eye Iris (Bright Blue Gradient)
        const eyeGrad = ctx.createRadialGradient(cx, 260, 5, cx, 260, 26);
        eyeGrad.addColorStop(0, '#38bdf8');
        eyeGrad.addColorStop(0.6, '#0284c7');
        eyeGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.ellipse(cx, 260, 24, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark Pupil
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx, 260, 11, 0, Math.PI * 2);
        ctx.fill();

        // Gloss Reflection Dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + 6, 250, 7, 0, Math.PI * 2);
        ctx.arc(cx - 8, 268, 4, 0, Math.PI * 2);
        ctx.fill();

        // Upper Eyelash line
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(cx, 252, 44, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }

      // Naruto's Cheek Whiskers
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 5;
      for (let s of [-1, 1]) {
        const startX = s === 1 ? 380 : 132;
        const dir = s === 1 ? 55 : -55;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(startX, 310 + i * 18);
          ctx.lineTo(startX + dir, 305 + i * 22);
          ctx.stroke();
        }
      }

      // Confident Grin Mouth
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(256, 390, 38, 0.1, Math.PI - 0.1);
      ctx.stroke();

    } else if (charId === 'sasuke') {
      // Sasuke: Sharp Intense Sharingan Eyes
      for (const cx of [190, 322]) {
        // Eye White
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx, 260, 44, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Glowing Crimson Sharingan Iris
        const sGrad = ctx.createRadialGradient(cx, 260, 4, cx, 260, 24);
        sGrad.addColorStop(0, '#f87171');
        sGrad.addColorStop(0.7, '#dc2626');
        sGrad.addColorStop(1, '#991b1b');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(cx, 260, 22, 0, Math.PI * 2);
        ctx.fill();

        // Inner Tomoe Ring
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, 260, 13, 0, Math.PI * 2);
        ctx.stroke();

        // Center Pupil
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx, 260, 6, 0, Math.PI * 2);
        ctx.fill();

        // 3 Tomoe Marks
        for (let t = 0; t < 3; t++) {
          const angle = (t * Math.PI * 2) / 3;
          const tx = cx + Math.cos(angle) * 13;
          const ty = 260 + Math.sin(angle) * 13;
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(tx, ty, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Sharp manga eyelash slant
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(cx - 48, 252);
        ctx.lineTo(cx + 48, 245);
        ctx.stroke();
      }

      // Serious stoic mouth
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(235, 400);
      ctx.lineTo(277, 400);
      ctx.stroke();

    } else if (charId === 'kakashi') {
      // Kakashi: Lower Face Mask covering mouth & nose
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 290);
      ctx.lineTo(512, 290);
      ctx.lineTo(512, 512);
      ctx.lineTo(0, 512);
      ctx.closePath();
      ctx.fill();

      // Headband tilted covering right eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, 120);
      ctx.lineTo(512, 170);
      ctx.lineTo(512, 250);
      ctx.lineTo(0, 200);
      ctx.closePath();
      ctx.fill();

      // Exposed Left Sharingan Eye
      const cx = 322;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, 260, 40, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx, 260, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx, 260, 6, 0, Math.PI * 2);
      ctx.fill();

      // Vertical scar line through eye
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 5, 220);
      ctx.lineTo(cx + 5, 305);
      ctx.stroke();

    } else if (charId === 'itachi') {
      // Itachi: Mangekyo Sharingan & Tear Lines
      for (const cx of [190, 322]) {
        // Red Eye
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(cx, 260, 22, 0, Math.PI * 2);
        ctx.fill();

        // Pinwheel Mangekyo Blades
        ctx.fillStyle = '#000000';
        for (let b = 0; b < 3; b++) {
          const a = (b * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * 9, 260 + Math.sin(a) * 9, 12, 5, a + Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, 260, 5, 0, Math.PI * 2);
        ctx.fill();

        // Tear crease lines
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 15, 275);
        ctx.lineTo(cx - 35, 345);
        ctx.stroke();
      }

    } else if (charId === 'gaara') {
      // Gaara: Red Hair roots & "Love" Kanji
      ctx.fillStyle = '#dc2626';
      ctx.font = '900 80px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('愛', 330, 160);

      // Dark Eyeliner Rings & Pale Turquoise Irises
      for (const cx of [190, 322]) {
        // Thick black eyeliner
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx, 265, 32, 0, Math.PI * 2);
        ctx.fill();

        // Eye White
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(cx, 265, 24, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pale Turquoise iris
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.arc(cx, 265, 12, 0, Math.PI * 2);
        ctx.fill();

        // Pinpoint pupil
        ctx.fillStyle = '#083344';
        ctx.beginPath();
        ctx.arc(cx, 265, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

// 2. TORSO CLOTHING TEXTURES
export function getAnimeTorsoTexture(charId: CharacterId): THREE.CanvasTexture {
  return createTextureFromCanvas(512, 512, (ctx) => {
    if (charId === 'naruto') {
      // Vibrant Orange Jacket with blue shoulder trims
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(0, 0, 512, 512);

      // Blue shoulder blocks
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, 512, 120);

      // Silver metal zipper line
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(250, 0, 12, 512);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(250, 0, 12, 512);

      // Uzumaki Red Clan Crest
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(256, 300, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(256, 300, 32, 0, Math.PI * 1.7);
      ctx.stroke();

    } else if (charId === 'sasuke') {
      // Navy Blue Shirt
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, 512, 512);

      // Uchiha Clan Fan Crest on back
      // Top Red Fan
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(256, 260, 80, Math.PI, 0, false);
      ctx.fill();

      // Bottom White Fan
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(256, 260, 80, 0, Math.PI, false);
      ctx.fill();

      // Handle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(246, 340, 20, 45);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.strokeRect(246, 340, 20, 45);

    } else if (charId === 'kakashi') {
      // Jonin Flak Green Vest
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 512, 512);

      // Utility Pouches
      ctx.fillStyle = '#166534';
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 4;
      ctx.roundRect(80, 240, 140, 160, 12);
      ctx.fill(); ctx.stroke();

      ctx.roundRect(292, 240, 140, 160, 12);
      ctx.fill(); ctx.stroke();

      // Red Uzushio Crest on Left Chest
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(150, 140, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

    } else if (charId === 'itachi') {
      // Akatsuki Black Cloak
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, 512, 512);

      // Stylized Akatsuki Red Clouds with White Border
      const drawCloud = (cx: number, cy: number, scale: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        // White border outline
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-40, 0, 36, 0, Math.PI * 2);
        ctx.arc(0, -22, 44, 0, Math.PI * 2);
        ctx.arc(42, 0, 36, 0, Math.PI * 2);
        ctx.arc(75, 12, 22, 0, Math.PI * 2);
        ctx.fill();

        // Inner Red Cloud
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(-40, 0, 30, 0, Math.PI * 2);
        ctx.arc(0, -22, 38, 0, Math.PI * 2);
        ctx.arc(42, 0, 30, 0, Math.PI * 2);
        ctx.arc(75, 12, 17, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      drawCloud(240, 220, 1.2);
      drawCloud(120, 420, 0.8);
      drawCloud(380, 420, 0.8);

    } else if (charId === 'gaara') {
      // Kazekage Red Tunic with white sash
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(0, 0, 512, 512);

      // Diagonal White Cloth Sash
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, 100);
      ctx.lineTo(512, 380);
      ctx.lineTo(512, 450);
      ctx.lineTo(0, 170);
      ctx.closePath();
      ctx.fill();
    }
  });
}

// 3. ARENA FLOOR TEXTURE
export function getArenaFloorTexture(arenaId: ArenaId): THREE.CanvasTexture {
  return createTextureFromCanvas(1024, 1024, (ctx) => {
    // Base surface color
    let baseHex = '#27272a';
    if (arenaId === 'leaf_village') baseHex = '#1e293b';
    if (arenaId === 'valley_of_the_end') baseHex = '#0f172a';
    if (arenaId === 'chunin_arena') baseHex = '#78350f';

    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 1024, 1024);

    // Stone tile grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 4;
    const tileSize = 64;
    for (let x = 0; x < 1024; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke();
    }
    for (let y = 0; y < 1024; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }

    // Ancient Concentric Combat Seal Circles
    ctx.strokeStyle = arenaId === 'valley_of_the_end' ? 'rgba(56, 189, 248, 0.7)' : 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(512, 512, 420, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 512, 390, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(512, 512, 220, 0, Math.PI * 2);
    ctx.stroke();

    // 8 Ninja Kuji-In Seals along perimeter
    ctx.fillStyle = arenaId === 'valley_of_the_end' ? '#38bdf8' : '#fbbf24';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const seals = ['臨', '兵', '闘', '者', '皆', '陣', '烈', '在'];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8;
      const sx = 512 + Math.cos(a) * 405;
      const sy = 512 + Math.sin(a) * 405;
      ctx.fillText(seals[i], sx, sy);
    }
  });
}
