import { FighterEntity, Projectile, ShadowClone } from '../types/game';

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_Y = 435;
export const GRAVITY = 0.68;

export function checkAABB(
  b1: { x: number; y: number; width: number; height: number },
  b2: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    b1.x < b2.x + b2.width &&
    b1.x + b1.width > b2.x &&
    b1.y < b2.y + b2.height &&
    b1.y + b1.height > b2.y
  );
}

export function checkCircleAABB(
  circle: { x: number; y: number; radius: number },
  box: { x: number; y: number; width: number; height: number }
): boolean {
  const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.width));
  const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.height));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

export function getAttackHitbox(fighter: FighterEntity): { x: number; y: number; width: number; height: number } | null {
  const isRight = fighter.facing === 'right';
  
  switch (fighter.state) {
    case 'attack1':
      return {
        x: isRight ? fighter.x + fighter.width : fighter.x - 38,
        y: fighter.y + 20,
        width: 38,
        height: 35
      };
    case 'attack2':
      return {
        x: isRight ? fighter.x + fighter.width : fighter.x - 48,
        y: fighter.y + 15,
        width: 48,
        height: 40
      };
    case 'attack3':
      return {
        x: isRight ? fighter.x + fighter.width : fighter.x - 56,
        y: fighter.y + 10,
        width: 56,
        height: 50
      };
    case 'jutsu1':
      // Rushing jutsu (Rasengan / Chidori / Raikiri)
      if (fighter.characterId === 'naruto' || fighter.characterId === 'sasuke' || fighter.characterId === 'kakashi') {
        return {
          x: isRight ? fighter.x + fighter.width - 10 : fighter.x - 65,
          y: fighter.y + 15,
          width: 75,
          height: 55
        };
      }
      return null;
    case 'ultimate':
      return {
        x: isRight ? fighter.x + fighter.width - 20 : fighter.x - 110,
        y: fighter.y - 10,
        width: 130,
        height: 90
      };
    default:
      return null;
  }
}

export function updateFighterPhysics(fighter: FighterEntity) {
  // Apply gravity
  if (!fighter.isGrounded) {
    fighter.vy += GRAVITY;
  }

  // Update positions
  fighter.x += fighter.vx;
  fighter.y += fighter.vy;

  // Ground collision
  if (fighter.y + fighter.height >= GROUND_Y) {
    fighter.y = GROUND_Y - fighter.height;
    fighter.vy = 0;
    fighter.isGrounded = true;
    if (fighter.state === 'jump' || fighter.state === 'fall') {
      fighter.state = 'idle';
    }
  } else {
    fighter.isGrounded = false;
    if (fighter.vy > 0 && fighter.state === 'jump') {
      fighter.state = 'fall';
    }
  }

  // Horizontal friction
  if (fighter.isGrounded && fighter.state !== 'run' && fighter.state !== 'jutsu1') {
    fighter.vx *= 0.82;
    if (Math.abs(fighter.vx) < 0.1) fighter.vx = 0;
  }

  // Boundary constraints
  const minX = 30;
  const maxX = CANVAS_WIDTH - fighter.width - 30;
  if (fighter.x < minX) {
    fighter.x = minX;
    fighter.vx = 0;
  } else if (fighter.x > maxX) {
    fighter.x = maxX;
    fighter.vx = 0;
  }

  // Regenerate substitution gauge slowly
  if (fighter.substitutionGauge < 100) {
    fighter.substitutionGauge = Math.min(100, fighter.substitutionGauge + 0.12);
  }

  // Update timers
  if (fighter.invulnerableTimer > 0) {
    fighter.invulnerableTimer--;
    if (fighter.invulnerableTimer <= 0) {
      fighter.isInvulnerable = false;
    }
  }

  if (fighter.hitStun > 0) {
    fighter.hitStun--;
    if (fighter.hitStun <= 0 && (fighter.state === 'hit' || fighter.state === 'knockback')) {
      fighter.state = 'idle';
    }
  }

  if (fighter.jutsu1Cooldown > 0) fighter.jutsu1Cooldown--;
  if (fighter.jutsu2Cooldown > 0) fighter.jutsu2Cooldown--;
  if (fighter.substituteEffectTimer > 0) fighter.substituteEffectTimer--;

  // Combo reset timer
  if (fighter.comboTimer > 0) {
    fighter.comboTimer--;
    if (fighter.comboTimer <= 0) {
      fighter.comboCount = 0;
    }
  }

  // State animation timer
  fighter.stateTimer++;
  if (
    (fighter.state === 'attack1' && fighter.stateTimer > 16) ||
    (fighter.state === 'attack2' && fighter.stateTimer > 20) ||
    (fighter.state === 'attack3' && fighter.stateTimer > 26) ||
    (fighter.state === 'jutsu1' && fighter.stateTimer > 35) ||
    (fighter.state === 'jutsu2' && fighter.stateTimer > 30) ||
    (fighter.state === 'ultimate' && fighter.stateTimer > 50) ||
    (fighter.state === 'substitute' && fighter.stateTimer > 12)
  ) {
    fighter.state = 'idle';
    fighter.stateTimer = 0;
  }

  // Shadow Clones update
  if (fighter.clones && fighter.clones.length > 0) {
    fighter.clones = fighter.clones.filter(clone => {
      clone.stateTimer++;
      clone.x += clone.vx;
      if (clone.stateTimer > 45 || clone.health <= 0) {
        return false;
      }
      return true;
    });
  }
}
