import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  FighterEntity,
  Projectile,
  CharacterId,
  ArenaId,
  GameMode,
  Difficulty,
  Language,
  MatchStats
} from '../types/game';
import { CHARACTERS } from '../data/characters';
import {
  CANVAS_WIDTH,
  GROUND_Y,
  checkAABB,
  checkCircleAABB,
  getAttackHitbox,
  updateFighterPhysics
} from '../game/physics';
import { ThreeSceneManager, CameraMode } from '../game/threeScene';
import { updateAI } from '../game/ai';
import { sound } from '../utils/audio';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';
import { VictoryModal } from './VictoryModal';
import { HowToPlayModal } from './HowToPlayModal';
import { Camera, Eye, Video } from 'lucide-react';

interface GameCanvas3DProps {
  p1CharId: CharacterId;
  p2CharId: CharacterId;
  arenaId: ArenaId;
  gameMode: GameMode;
  difficulty: Difficulty;
  lang: Language;
  onExit: () => void;
  onChangeFighters: () => void;
  onSwitchTo2D?: () => void;
}

export const GameCanvas3D: React.FC<GameCanvas3DProps> = ({
  p1CharId,
  p2CharId,
  arenaId,
  gameMode,
  difficulty,
  lang,
  onExit,
  onChangeFighters,
  onSwitchTo2D
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneManagerRef = useRef<ThreeSceneManager | null>(null);

  // Match State
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(99);
  const [p1RoundsWon, setP1RoundsWon] = useState(0);
  const [p2RoundsWon, setP2RoundsWon] = useState(0);
  const [wave, setWave] = useState(1);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('cinematic');

  // Input tracking
  const keysPressed = useRef<Record<string, boolean>>({});

  // Match Entities State
  const p1Ref = useRef<FighterEntity>(createInitialFighter(1, p1CharId, 220, 'right'));
  const p2Ref = useRef<FighterEntity>(createInitialFighter(2, p2CharId, CANVAS_WIDTH - 260, 'left'));
  const projectilesRef = useRef<Projectile[]>([]);

  // Statistics
  const statsTracker = useRef({
    p1Damage: 0,
    p2Damage: 0,
    p1MaxCombo: 0,
    p2MaxCombo: 0,
    startTime: Date.now()
  });

  // State mirror for HUD
  const [hudState, setHudState] = useState({
    p1: p1Ref.current,
    p2: p2Ref.current,
    time: 99
  });

  function createInitialFighter(id: number, charId: CharacterId, x: number, facing: 'left' | 'right'): FighterEntity {
    const char = CHARACTERS[charId];
    return {
      id,
      characterId: charId,
      x,
      y: GROUND_Y - 80,
      vx: 0,
      vy: 0,
      width: 44,
      height: 80,
      facing,
      health: char.maxHealth,
      maxHealth: char.maxHealth,
      chakra: 50,
      maxChakra: char.maxChakra,
      substitutionGauge: 100,
      state: 'idle',
      stateTimer: 0,
      comboCount: 0,
      comboTimer: 0,
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
    };
  }

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      keysPressed.current[e.code.toLowerCase()] = true;
      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code.toLowerCase()] = false;
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isPaused || matchStats || gameMode === 'training') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleRoundTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, matchStats, gameMode]);

  const handleRoundTimeout = useCallback(() => {
    const p1 = p1Ref.current;
    const p2 = p2Ref.current;
    if (p1.health > p2.health) {
      handleRoundEnd(1);
    } else if (p2.health > p1.health) {
      handleRoundEnd(2);
    } else {
      handleRoundEnd('draw');
    }
  }, []);

  // Substitution Kawarimi in 3D
  const triggerSubstitution = (f: FighterEntity, opponent: FighterEntity) => {
    if (f.substitutionGauge < 35) return;
    f.substitutionGauge -= 35;
    f.substituteEffectTimer = 16;
    f.isInvulnerable = true;
    f.invulnerableTimer = 25;
    f.state = 'idle';
    f.hitStun = 0;

    // Trigger 3D Log & Smoke in Three.js
    if (sceneManagerRef.current) {
      sceneManagerRef.current.triggerSubstitution(f.x + 22, f.y + 40);
    }

    sound.playSubstitution();

    // Teleport behind opponent
    const behindX = opponent.facing === 'right' ? opponent.x - 60 : opponent.x + opponent.width + 20;
    f.x = Math.max(50, Math.min(CANVAS_WIDTH - 90, behindX));
    f.facing = opponent.x > f.x ? 'right' : 'left';
  };

  const applyHit = (attacker: FighterEntity, defender: FighterEntity, rawDamage: number, knockbackX = 6, knockbackY = -4, isHeavy = false) => {
    if (defender.isInvulnerable || defender.substituteEffectTimer > 0) return;

    let finalDamage = rawDamage;

    if (defender.isBlocking) {
      finalDamage = Math.max(1, Math.floor(rawDamage * 0.2));
      sound.playBlock();
      if (sceneManagerRef.current) {
        sceneManagerRef.current.triggerHitSparks(defender.x + defender.width / 2, defender.y + 35, 0x38bdf8);
      }
    } else {
      defender.health = Math.max(0, defender.health - finalDamage);
      defender.hitStun = isHeavy ? 24 : 14;
      defender.state = isHeavy ? 'knockback' : 'hit';

      const dir = attacker.x < defender.x ? 1 : -1;
      defender.vx = dir * knockbackX;
      defender.vy = knockbackY;
      defender.isGrounded = false;

      attacker.comboCount++;
      attacker.comboTimer = 70;

      if (attacker.id === 1) {
        statsTracker.current.p1Damage += finalDamage;
        statsTracker.current.p1MaxCombo = Math.max(statsTracker.current.p1MaxCombo, attacker.comboCount);
      } else {
        statsTracker.current.p2Damage += finalDamage;
        statsTracker.current.p2MaxCombo = Math.max(statsTracker.current.p2MaxCombo, attacker.comboCount);
      }

      if (isHeavy) {
        sound.playHeavyHit();
        if (sceneManagerRef.current) {
          sceneManagerRef.current.triggerScreenShake(6);
          sceneManagerRef.current.triggerHitStop(4);
        }
      } else {
        sound.playHit();
      }

      if (sceneManagerRef.current) {
        sceneManagerRef.current.triggerHitSparks(defender.x + defender.width / 2, defender.y + 35, isHeavy ? 0xea580c : 0xf59e0b);
      }
    }

    if (defender.health <= 0) {
      handleRoundEnd(attacker.id === 1 ? 1 : 2);
    }
  };

  const handleRoundEnd = (winnerId: 1 | 2 | 'draw') => {
    if (winnerId === 1) {
      const nextRounds = p1RoundsWon + 1;
      setP1RoundsWon(nextRounds);
      sound.playVictory();

      if (gameMode === 'survival') {
        setWave(w => w + 1);
        resetFightersForNextRound();
      } else if (nextRounds >= 2 || gameMode === 'arcade') {
        finishMatch(1);
      } else {
        setTimeout(resetFightersForNextRound, 1500);
      }
    } else if (winnerId === 2) {
      const nextRounds = p2RoundsWon + 1;
      setP2RoundsWon(nextRounds);
      sound.playDefeat();

      if (nextRounds >= 2 || gameMode === 'survival') {
        finishMatch(2);
      } else {
        setTimeout(resetFightersForNextRound, 1500);
      }
    } else {
      sound.playDefeat();
      finishMatch('draw');
    }
  };

  const finishMatch = (winner: 1 | 2 | 'draw') => {
    const elapsedSecs = Math.max(1, Math.floor((Date.now() - statsTracker.current.startTime) / 1000));
    setMatchStats({
      winner,
      p1DamageDealt: statsTracker.current.p1Damage,
      p2DamageDealt: statsTracker.current.p2Damage,
      p1MaxCombo: statsTracker.current.p1MaxCombo,
      p2MaxCombo: statsTracker.current.p2MaxCombo,
      durationSeconds: elapsedSecs,
      wavesCleared: gameMode === 'survival' ? wave - 1 : undefined
    });
  };

  const resetFightersForNextRound = () => {
    p1Ref.current = createInitialFighter(1, p1CharId, 220, 'right');
    p2Ref.current = createInitialFighter(2, p2CharId, CANVAS_WIDTH - 260, 'left');
    projectilesRef.current = [];
    setTimeLeft(99);
  };

  // Cast Jutsu
  const executeJutsu = (f: FighterEntity, opponent: FighterEntity, jutsuSlot: 'jutsu1' | 'jutsu2' | 'ultimate') => {
    const char = CHARACTERS[f.characterId];
    const jutsu = jutsuSlot === 'ultimate' ? char.ultimate : jutsuSlot === 'jutsu1' ? char.jutsu1 : char.jutsu2;

    if (f.chakra < jutsu.chakraCost) return;
    if (jutsuSlot === 'jutsu1' && f.jutsu1Cooldown > 0) return;
    if (jutsuSlot === 'jutsu2' && f.jutsu2Cooldown > 0) return;

    f.chakra -= jutsu.chakraCost;
    f.state = jutsuSlot;
    f.stateTimer = 0;

    if (jutsuSlot === 'jutsu1') f.jutsu1Cooldown = jutsu.cooldown;
    if (jutsuSlot === 'jutsu2') f.jutsu2Cooldown = jutsu.cooldown;

    const dir = f.facing === 'right' ? 1 : -1;

    if (f.characterId === 'naruto') {
      if (jutsuSlot === 'jutsu1') {
        f.vx = dir * 14;
        sound.playRasengan();
      } else if (jutsuSlot === 'jutsu2') {
        sound.playSubstitution();
        if (sceneManagerRef.current) sceneManagerRef.current.triggerSubstitution(f.x + dir * 30, f.y);
      } else if (jutsuSlot === 'ultimate') {
        f.vx = dir * 16;
        if (sceneManagerRef.current) sceneManagerRef.current.triggerScreenShake(8);
        sound.playUltimateImpact();
      }
    } else if (f.characterId === 'sasuke') {
      if (jutsuSlot === 'jutsu1') {
        f.vx = dir * 16;
        sound.playChidori();
      } else if (jutsuSlot === 'jutsu2') {
        sound.playFireball();
        projectilesRef.current.push({
          id: Math.random(),
          ownerId: f.id,
          x: f.x + (dir > 0 ? f.width + 10 : -10),
          y: f.y + 25,
          vx: dir * 9,
          vy: 0,
          radius: 22,
          damage: jutsu.damage,
          type: 'fireball',
          lifetime: 0,
          maxLifetime: 65,
          color: '#ea580c'
        });
      } else if (jutsuSlot === 'ultimate') {
        if (sceneManagerRef.current) sceneManagerRef.current.triggerScreenShake(9);
        sound.playUltimateImpact();
        applyHit(f, opponent, jutsu.damage, 14, -8, true);
      }
    } else if (f.characterId === 'kakashi') {
      if (jutsuSlot === 'jutsu1') {
        f.vx = dir * 15;
        sound.playChidori();
      } else if (jutsuSlot === 'jutsu2') {
        sound.playHeavyHit();
        applyHit(f, opponent, jutsu.damage, 8, -5, false);
      } else if (jutsuSlot === 'ultimate') {
        if (sceneManagerRef.current) sceneManagerRef.current.triggerScreenShake(8);
        sound.playUltimateImpact();
        applyHit(f, opponent, jutsu.damage, 12, -7, true);
      }
    } else if (f.characterId === 'itachi') {
      if (jutsuSlot === 'jutsu1') {
        sound.playFireball();
        projectilesRef.current.push({
          id: Math.random(),
          ownerId: f.id,
          x: f.x + (dir > 0 ? f.width + 10 : -10),
          y: f.y + 25,
          vx: dir * 11,
          vy: 0,
          radius: 18,
          damage: jutsu.damage,
          type: 'amaterasu_flame',
          lifetime: 0,
          maxLifetime: 75,
          color: '#000000'
        });
      } else if (jutsuSlot === 'jutsu2') {
        sound.playSubstitution();
        triggerSubstitution(f, opponent);
      } else if (jutsuSlot === 'ultimate') {
        if (sceneManagerRef.current) sceneManagerRef.current.triggerScreenShake(8);
        sound.playUltimateImpact();
        applyHit(f, opponent, jutsu.damage, 14, -7, true);
      }
    } else if (f.characterId === 'gaara') {
      if (jutsuSlot === 'jutsu1') {
        sound.playFireball();
        projectilesRef.current.push({
          id: Math.random(),
          ownerId: f.id,
          x: f.x + (dir > 0 ? f.width + 10 : -10),
          y: GROUND_Y - 25,
          vx: dir * 8,
          vy: 0,
          radius: 26,
          damage: jutsu.damage,
          type: 'sand_bullet',
          lifetime: 0,
          maxLifetime: 80,
          color: '#d97706'
        });
      } else if (jutsuSlot === 'jutsu2') {
        f.sandShieldActive = true;
        sound.playBlock();
        setTimeout(() => {
          f.sandShieldActive = false;
        }, 1200);
      } else if (jutsuSlot === 'ultimate') {
        if (sceneManagerRef.current) sceneManagerRef.current.triggerScreenShake(8);
        sound.playUltimateImpact();
        applyHit(f, opponent, jutsu.damage, 14, -8, true);
      }
    }
  };

  // Throw Shuriken
  const throwShuriken = (f: FighterEntity) => {
    sound.playShuriken();
    const dir = f.facing === 'right' ? 1 : -1;
    projectilesRef.current.push({
      id: Math.random(),
      ownerId: f.id,
      x: f.x + (dir > 0 ? f.width + 5 : -5),
      y: f.y + 30,
      vx: dir * 13,
      vy: 0,
      radius: 9,
      damage: 22,
      type: 'shuriken',
      lifetime: 0,
      maxLifetime: 70,
      color: '#64748b'
    });
  };

  // Virtual Gamepad Handlers
  const handleVirtualButtonDown = (btn: string) => {
    keysPressed.current[btn] = true;
  };

  const handleVirtualButtonUp = (btn: string) => {
    keysPressed.current[btn] = false;
  };

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const sceneManager = new ThreeSceneManager(mountRef.current, arenaId, p1CharId, p2CharId);
    sceneManagerRef.current = sceneManager;

    const clock = new THREE.Clock();
    let animId: number;

    const loop = () => {
      const delta = Math.min(0.05, clock.getDelta());

      if (!isPaused && !matchStats) {
        const p1 = p1Ref.current;
        const p2 = p2Ref.current;
        const keys = keysPressed.current;

        // Auto facing
        if (p1.state === 'idle' || p1.state === 'run') {
          p1.facing = p1.x < p2.x ? 'right' : 'left';
        }
        if (p2.state === 'idle' || p2.state === 'run') {
          p2.facing = p2.x < p1.x ? 'right' : 'left';
        }

        // ================= PLAYER 1 =================
        const p1Char = CHARACTERS[p1.characterId];

        // Chakra Charging
        if ((keys['c'] || keys['keyc'] || keys['charge']) && p1.isGrounded && p1.state === 'idle') {
          p1.isChargingChakra = true;
          p1.state = 'charge';
          p1.chakra = Math.min(p1.maxChakra, p1.chakra + 0.45);
          p1.chargeParticleTimer++;
          if (p1.chargeParticleTimer % 5 === 0) {
            sound.playChakraCharge();
          }
        } else if (p1.state === 'charge') {
          p1.isChargingChakra = false;
          p1.state = 'idle';
        }

        // Blocking & Movement
        p1.isBlocking = (keys['s'] || keys['keys'] || keys['block']) && p1.isGrounded;

        if (!p1.isBlocking && !p1.isChargingChakra && p1.state !== 'hit' && p1.state !== 'knockback' && p1.state !== 'jutsu1') {
          if (keys['a'] || keys['keya'] || keys['left']) {
            p1.vx = -p1Char.speed;
            if (p1.isGrounded) p1.state = 'run';
          } else if (keys['d'] || keys['keyd'] || keys['right']) {
            p1.vx = p1Char.speed;
            if (p1.isGrounded) p1.state = 'run';
          } else if (p1.isGrounded && p1.state === 'run') {
            p1.state = 'idle';
          }

          if ((keys['w'] || keys['keyw'] || keys['jump']) && p1.isGrounded) {
            p1.vy = -14.5;
            p1.isGrounded = false;
            p1.state = 'jump';
          }
        }

        // Attacks
        if (p1.state === 'idle' || p1.state === 'run') {
          if (keys['j'] || keys['keyj'] || keys['attack1']) {
            p1.state = 'attack1';
            p1.stateTimer = 0;
            keys['j'] = false; keys['keyj'] = false; keys['attack1'] = false;
          } else if (keys['k'] || keys['keyk'] || keys['attack2']) {
            p1.state = 'attack2';
            p1.stateTimer = 0;
            keys['k'] = false; keys['keyk'] = false; keys['attack2'] = false;
          } else if (keys['l'] || keys['keyl'] || keys['shuriken']) {
            throwShuriken(p1);
            keys['l'] = false; keys['keyl'] = false; keys['shuriken'] = false;
          } else if (keys['u'] || keys['keyu'] || keys['jutsu1']) {
            executeJutsu(p1, p2, 'jutsu1');
            keys['u'] = false; keys['keyu'] = false; keys['jutsu1'] = false;
          } else if (keys['i'] || keys['keyi'] || keys['jutsu2']) {
            executeJutsu(p1, p2, 'jutsu2');
            keys['i'] = false; keys['keyi'] = false; keys['jutsu2'] = false;
          } else if (keys['o'] || keys['keyo'] || keys['ultimate']) {
            executeJutsu(p1, p2, 'ultimate');
            keys['o'] = false; keys['keyo'] = false; keys['ultimate'] = false;
          }
        }

        if ((keys['space'] || keys['substitute']) && p1.substitutionGauge >= 35) {
          triggerSubstitution(p1, p2);
          keys['space'] = false; keys['substitute'] = false;
        }

        // ================= PLAYER 2 / AI =================
        const p2Char = CHARACTERS[p2.characterId];

        if (gameMode === 'versus_p2') {
          p2.isBlocking = (keys['arrowdown'] || keys['numpad0']) && p2.isGrounded;

          if (!p2.isBlocking && p2.state !== 'hit' && p2.state !== 'knockback' && p2.state !== 'jutsu1') {
            if (keys['arrowleft']) {
              p2.vx = -p2Char.speed;
              if (p2.isGrounded) p2.state = 'run';
            } else if (keys['arrowright']) {
              p2.vx = p2Char.speed;
              if (p2.isGrounded) p2.state = 'run';
            } else if (p2.isGrounded && p2.state === 'run') {
              p2.state = 'idle';
            }

            if (keys['arrowup'] && p2.isGrounded) {
              p2.vy = -14.5;
              p2.isGrounded = false;
              p2.state = 'jump';
            }
          }

          if (p2.state === 'idle' || p2.state === 'run') {
            if (keys['numpad1'] || keys['b']) {
              p2.state = 'attack1';
              p2.stateTimer = 0;
              keys['numpad1'] = false; keys['b'] = false;
            } else if (keys['numpad2'] || keys['n']) {
              p2.state = 'attack2';
              p2.stateTimer = 0;
              keys['numpad2'] = false; keys['n'] = false;
            } else if (keys['numpad3'] || keys['m']) {
              throwShuriken(p2);
              keys['numpad3'] = false; keys['m'] = false;
            } else if (keys['numpad4'] || keys['h']) {
              executeJutsu(p2, p1, 'jutsu1');
              keys['numpad4'] = false; keys['h'] = false;
            } else if (keys['numpad5']) {
              executeJutsu(p2, p1, 'jutsu2');
              keys['numpad5'] = false;
            } else if (keys['numpad6']) {
              executeJutsu(p2, p1, 'ultimate');
              keys['numpad6'] = false;
            }
          }
        } else {
          // AI Controller
          const aiAction = updateAI(p2, p1, difficulty);
          p2.isBlocking = aiAction.block && p2.isGrounded;

          if (aiAction.charge && p2.isGrounded && p2.state === 'idle') {
            p2.isChargingChakra = true;
            p2.state = 'charge';
            p2.chakra = Math.min(p2.maxChakra, p2.chakra + 0.4);
          } else if (p2.state === 'charge') {
            p2.isChargingChakra = false;
            p2.state = 'idle';
          }

          if (!p2.isBlocking && !p2.isChargingChakra && p2.state !== 'hit' && p2.state !== 'knockback' && p2.state !== 'jutsu1') {
            if (aiAction.moveLeft) {
              p2.vx = -p2Char.speed;
              if (p2.isGrounded) p2.state = 'run';
            } else if (aiAction.moveRight) {
              p2.vx = p2Char.speed;
              if (p2.isGrounded) p2.state = 'run';
            } else if (p2.isGrounded && p2.state === 'run') {
              p2.state = 'idle';
            }

            if (aiAction.jump && p2.isGrounded) {
              p2.vy = -14.5;
              p2.isGrounded = false;
              p2.state = 'jump';
            }
          }

          if (p2.state === 'idle' || p2.state === 'run') {
            if (aiAction.attack1) {
              p2.state = 'attack1';
              p2.stateTimer = 0;
            } else if (aiAction.attack2) {
              p2.state = 'attack2';
              p2.stateTimer = 0;
            } else if (aiAction.shuriken) {
              throwShuriken(p2);
            } else if (aiAction.ultimate) {
              executeJutsu(p2, p1, 'ultimate');
            } else if (aiAction.jutsu1) {
              executeJutsu(p2, p1, 'jutsu1');
            } else if (aiAction.jutsu2) {
              executeJutsu(p2, p1, 'jutsu2');
            }
          }

          if (aiAction.substitute && p2.substitutionGauge >= 35) {
            triggerSubstitution(p2, p1);
          }
        }

        // ================= PHYSICS & HIT DETECTION =================
        updateFighterPhysics(p1);
        updateFighterPhysics(p2);

        // P1 Hitbox check
        const p1Hitbox = getAttackHitbox(p1);
        if (p1Hitbox && p1.stateTimer === 6) {
          if (checkAABB(p1Hitbox, p2)) {
            const isHeavy = p1.state === 'attack2' || p1.state === 'attack3' || p1.state === 'ultimate';
            const baseDmg = p1.state === 'attack1' ? 25 : p1.state === 'attack2' ? 40 : p1.state === 'attack3' ? 60 : 120;
            applyHit(p1, p2, baseDmg, isHeavy ? 9 : 4, isHeavy ? -5 : -2, isHeavy);
          }
        }

        // P2 Hitbox check
        const p2Hitbox = getAttackHitbox(p2);
        if (p2Hitbox && p2.stateTimer === 6) {
          if (checkAABB(p2Hitbox, p1)) {
            const isHeavy = p2.state === 'attack2' || p2.state === 'attack3' || p2.state === 'ultimate';
            const baseDmg = p2.state === 'attack1' ? 25 : p2.state === 'attack2' ? 40 : p2.state === 'attack3' ? 60 : 120;
            applyHit(p2, p1, baseDmg, isHeavy ? 9 : 4, isHeavy ? -5 : -2, isHeavy);
          }
        }

        // Projectiles collision
        projectilesRef.current = projectilesRef.current.filter(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.lifetime++;

          const target = p.ownerId === 1 ? p2 : p1;
          const attacker = p.ownerId === 1 ? p1 : p2;

          if (checkCircleAABB(p, target)) {
            applyHit(attacker, target, p.damage, 6, -3, p.type !== 'shuriken');
            return false;
          }

          if (p.x < 0 || p.x > CANVAS_WIDTH || p.lifetime > p.maxLifetime) {
            return false;
          }
          return true;
        });

        // Mirror for HUD
        setHudState({
          p1: { ...p1 },
          p2: { ...p2 },
          time: timeLeft
        });
      }

      // Render Three.js Scene
      if (sceneManagerRef.current) {
        sceneManagerRef.current.update(p1Ref.current, p2Ref.current, projectilesRef.current, delta);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      sceneManager.dispose();
      sceneManagerRef.current = null;
    };
  }, [arenaId, p1CharId, p2CharId, difficulty, gameMode, isPaused, matchStats, timeLeft]);

  const p1CharDef = CHARACTERS[p1CharId];
  const p2CharDef = CHARACTERS[p2CharId];

  const handleCameraChange = (mode: CameraMode) => {
    sound.playHit();
    setCameraMode(mode);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setCameraMode(mode);
    }
  };

  return (
    <div className="relative w-full h-screen bg-zinc-950 flex flex-col items-center justify-center overflow-hidden select-none">
      
      {/* Top HUD */}
      <HUD
        p1={hudState.p1}
        p2={hudState.p2}
        p1Char={p1CharDef}
        p2Char={p2CharDef}
        p1RoundsWon={p1RoundsWon}
        p2RoundsWon={p2RoundsWon}
        timeLeft={timeLeft}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(prev => !prev)}
        onOpenHelp={() => setShowHelp(true)}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          sound.setMuted(next);
        }}
        lang={lang}
        gameMode={gameMode}
        wave={wave}
      />

      {/* 3D Viewport Mount */}
      <div
        ref={mountRef}
        className="w-full h-full relative"
      />

      {/* Camera Mode Selector Dock (Pinned cleanly) */}
      <div className="absolute top-20 right-4 z-20 flex items-center gap-1.5 p-1 bg-zinc-950/80 border border-zinc-800/80 rounded-xl backdrop-blur-md">
        <button
          onClick={() => handleCameraChange('storm')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            cameraMode === 'storm' ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Ninja Storm 3rd Person Cam"
        >
          <Video className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'ar' ? 'كاميرا ستورم 3D' : 'Storm 3D'}</span>
        </button>

        <button
          onClick={() => handleCameraChange('cinematic')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            cameraMode === 'cinematic' ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Dynamic Action Camera"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'ar' ? 'أكشن ديناميكي' : 'Action 3D'}</span>
        </button>

        <button
          onClick={() => handleCameraChange('side')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            cameraMode === 'side' ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Classic Side Angle"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'ar' ? 'جانبي كلاسيكي' : 'Side Cam'}</span>
        </button>

        {onSwitchTo2D && (
          <button
            onClick={() => {
              sound.playHit();
              onSwitchTo2D();
            }}
            className="px-2 py-1 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 ml-1 cursor-pointer"
          >
            2D
          </button>
        )}
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-40 gap-4">
          <h2 className="text-3xl font-black text-amber-400">
            {lang === 'ar' ? 'اللعبة متوقفة مؤقتاً' : 'GAME PAUSED'}
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black transition-all cursor-pointer"
            >
              {lang === 'ar' ? 'استئناف النزال' : 'Resume Match'}
            </button>
            <button
              onClick={onExit}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-all cursor-pointer"
            >
              {lang === 'ar' ? 'الخروج للقائمة' : 'Exit to Menu'}
            </button>
          </div>
        </div>
      )}

      {/* Touch / Virtual Controls Bar */}
      <TouchControls
        onButtonDown={handleVirtualButtonDown}
        onButtonUp={handleVirtualButtonUp}
        lang={lang}
        p1CharId={p1CharId}
      />

      {/* Victory / Results Modal */}
      {matchStats && (
        <VictoryModal
          stats={matchStats}
          p1Char={p1CharDef}
          p2Char={p2CharDef}
          lang={lang}
          gameMode={gameMode}
          onRematch={() => {
            setMatchStats(null);
            setP1RoundsWon(0);
            setP2RoundsWon(0);
            statsTracker.current = {
              p1Damage: 0,
              p2Damage: 0,
              p1MaxCombo: 0,
              p2MaxCombo: 0,
              startTime: Date.now()
            };
            resetFightersForNextRound();
          }}
          onChangeFighters={onChangeFighters}
          onMainMenu={onExit}
        />
      )}

      {/* Controls & Moves Modal */}
      <HowToPlayModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        lang={lang}
      />
    </div>
  );
};
