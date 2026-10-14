export type CharacterId = 'naruto' | 'sasuke' | 'kakashi' | 'itachi' | 'gaara';
export type ArenaId = 'leaf_village' | 'valley_of_the_end' | 'chunin_arena';
export type GameMode = 'arcade' | 'versus_p2' | 'survival' | 'training';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'hokage';
export type Language = 'ar' | 'en';

export interface JutsuInfo {
  id: string;
  name: { ar: string; en: string };
  chakraCost: number;
  damage: number;
  cooldown: number; // in frames or seconds
  description: { ar: string; en: string };
  icon: string;
}

export interface CharacterDef {
  id: CharacterId;
  name: { ar: string; en: string };
  title: { ar: string; en: string };
  village: { ar: string; en: string };
  description: { ar: string; en: string };
  quote: { ar: string; en: string };
  themeColor: string;
  secondaryColor: string;
  chakraColor: string;
  maxHealth: number;
  maxChakra: number;
  speed: number;
  attackPower: number;
  defense: number;
  jutsu1: JutsuInfo;
  jutsu2: JutsuInfo;
  ultimate: JutsuInfo;
}

export type FighterState = 
  | 'idle' 
  | 'run' 
  | 'jump' 
  | 'fall' 
  | 'attack1' 
  | 'attack2' 
  | 'attack3' 
  | 'jutsu1' 
  | 'jutsu2' 
  | 'ultimate' 
  | 'block' 
  | 'hit' 
  | 'knockback' 
  | 'substitute' 
  | 'charge';

export interface Projectile {
  id: number;
  ownerId: number; // 1 = P1, 2 = P2
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  type: 'shuriken' | 'fireball' | 'rasengan_sphere' | 'chidori_bolt' | 'sand_bullet' | 'amaterasu_flame' | 'kamui_slice';
  lifetime: number;
  maxLifetime: number;
  color: string;
}

export interface ShadowClone {
  id: number;
  x: number;
  y: number;
  vx: number;
  facing: 'left' | 'right';
  health: number;
  state: 'run' | 'attack';
  stateTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'spark' | 'smoke' | 'sand' | 'crow' | 'feather' | 'wood';
}

export interface DamageNumber {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface FighterEntity {
  id: number; // 1 or 2
  characterId: CharacterId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  health: number;
  maxHealth: number;
  chakra: number;
  maxChakra: number;
  substitutionGauge: number; // 0 to 100
  state: FighterState;
  stateTimer: number;
  comboCount: number;
  comboTimer: number;
  isGrounded: boolean;
  isBlocking: boolean;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  hitStun: number;
  jutsu1Cooldown: number;
  jutsu2Cooldown: number;
  substituteEffectTimer: number;
  isChargingChakra: boolean;
  chargeParticleTimer: number;
  specialAura: boolean;
  clones: ShadowClone[];
  sandShieldActive?: boolean;
}

export interface ArenaDef {
  id: ArenaId;
  name: { ar: string; en: string };
  location: { ar: string; en: string };
  image: string;
  groundY: number; // Floor level Y percentage
}

export interface MatchStats {
  winner: 1 | 2 | 'draw';
  p1DamageDealt: number;
  p2DamageDealt: number;
  p1MaxCombo: number;
  p2MaxCombo: number;
  durationSeconds: number;
  wavesCleared?: number;
}
