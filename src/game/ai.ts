import { FighterEntity, Difficulty } from '../types/game';
import { CHARACTERS } from '../data/characters';

export interface AIActionState {
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  block: boolean;
  attack1: boolean;
  attack2: boolean;
  shuriken: boolean;
  jutsu1: boolean;
  jutsu2: boolean;
  ultimate: boolean;
  substitute: boolean;
  charge: boolean;
}

export function updateAI(
  ai: FighterEntity,
  player: FighterEntity,
  difficulty: Difficulty
): AIActionState {
  const actions: AIActionState = {
    moveLeft: false,
    moveRight: false,
    jump: false,
    block: false,
    attack1: false,
    attack2: false,
    shuriken: false,
    jutsu1: false,
    jutsu2: false,
    ultimate: false,
    substitute: false,
    charge: false
  };

  const dist = Math.abs(ai.x - player.x);
  const isPlayerToLeft = player.x < ai.x;
  const charDef = CHARACTERS[ai.characterId];

  // Reaction speeds per difficulty
  const reactionRate = difficulty === 'easy' ? 0.04 :
                       difficulty === 'normal' ? 0.08 :
                       difficulty === 'hard' ? 0.14 : 0.22;

  // 1. Substitution reaction when being attacked/hit
  if ((ai.state === 'hit' || ai.state === 'knockback') && ai.substitutionGauge >= 35) {
    const subChance = difficulty === 'easy' ? 0.02 :
                      difficulty === 'normal' ? 0.08 :
                      difficulty === 'hard' ? 0.25 : 0.45;
    if (Math.random() < subChance) {
      actions.substitute = true;
      return actions;
    }
  }

  // 2. Defensive Blocking if player is attacking in close range
  if (dist < 100 && (player.state.startsWith('attack') || player.state.startsWith('jutsu'))) {
    const blockChance = difficulty === 'easy' ? 0.15 :
                        difficulty === 'normal' ? 0.4 :
                        difficulty === 'hard' ? 0.7 : 0.9;
    if (Math.random() < blockChance) {
      actions.block = true;
      return actions;
    }
  }

  // 3. Low Chakra Management: retreat & charge
  if (ai.chakra < 25 && dist > 220 && Math.random() < 0.6) {
    actions.charge = true;
    return actions;
  }

  // 4. Movement: Close in or maintain combat spacing
  if (dist > 180) {
    // Run towards player
    if (isPlayerToLeft) actions.moveLeft = true;
    else actions.moveRight = true;

    // Shuriken harass from distance
    if (Math.random() < reactionRate * 0.7) {
      actions.shuriken = true;
    }
  } else if (dist < 40) {
    // Back up slightly or jump
    if (isPlayerToLeft) actions.moveRight = true;
    else actions.moveLeft = true;
    if (Math.random() < 0.08) actions.jump = true;
  } else {
    // Melee combat zone
    if (isPlayerToLeft) actions.moveLeft = true;
    else actions.moveRight = true;

    // Ultimate Jutsu if ready and player is vulnerable
    if (ai.chakra >= 100 && Math.random() < reactionRate * 1.5) {
      actions.ultimate = true;
      return actions;
    }

    // Jutsu 1 / 2 execution
    if (ai.chakra >= charDef.jutsu1.chakraCost && ai.jutsu1Cooldown <= 0 && Math.random() < reactionRate * 0.8) {
      actions.jutsu1 = true;
      return actions;
    }

    if (ai.chakra >= charDef.jutsu2.chakraCost && ai.jutsu2Cooldown <= 0 && Math.random() < reactionRate * 0.7) {
      actions.jutsu2 = true;
      return actions;
    }

    // Normal Attacks / Combos
    if (Math.random() < reactionRate * 2.2) {
      if (Math.random() < 0.6) {
        actions.attack1 = true;
      } else {
        actions.attack2 = true;
      }
    }
  }

  // Random jump dodge
  if (Math.random() < 0.02 && ai.isGrounded) {
    actions.jump = true;
  }

  return actions;
}
