import React from 'react';
import { FighterEntity, Language, CharacterDef } from '../types/game';
import { Volume2, VolumeX, Pause, Play, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface HUDProps {
  p1: FighterEntity;
  p2: FighterEntity;
  p1Char: CharacterDef;
  p2Char: CharacterDef;
  p1RoundsWon: number;
  p2RoundsWon: number;
  timeLeft: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  lang: Language;
  gameMode: string;
  wave?: number;
}

export const HUD: React.FC<HUDProps> = ({
  p1,
  p2,
  p1Char,
  p2Char,
  p1RoundsWon,
  p2RoundsWon,
  timeLeft,
  isPaused,
  onTogglePause,
  onOpenHelp,
  isMuted,
  onToggleMute,
  lang,
  gameMode,
  wave
}) => {
  const isAr = lang === 'ar';

  const p1HpPercent = Math.max(0, (p1.health / p1.maxHealth) * 100);
  const p2HpPercent = Math.max(0, (p2.health / p2.maxHealth) * 100);

  const p1ChakraPercent = Math.max(0, (p1.chakra / p1.maxChakra) * 100);
  const p2ChakraPercent = Math.max(0, (p2.chakra / p2.maxChakra) * 100);

  return (
    <div className="absolute top-0 inset-x-0 p-3 md:p-5 pointer-events-none z-20 flex flex-col gap-2">
      {/* Top Bar: Fighters Health, Timer & Controls */}
      <div className="flex items-center justify-between gap-2 md:gap-4 w-full">
        
        {/* PLAYER 1 HUD */}
        <div className="flex-1 flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base font-black text-amber-400 drop-shadow">
              {p1Char.name[lang]}
            </span>
            {/* Round Win Stars */}
            <div className="flex items-center gap-1">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx < p1RoundsWon ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-zinc-700/60'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* P1 Health Bar */}
          <div className="w-full h-4 md:h-6 bg-zinc-950/80 border border-zinc-700 rounded-sm overflow-hidden p-0.5 shadow-md">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-150 rounded-sm"
              style={{ width: `${p1HpPercent}%` }}
            />
          </div>

          {/* P1 Chakra & Substitution */}
          <div className="w-full flex items-center justify-between gap-2 text-[11px] font-mono">
            {/* Chakra Bar */}
            <div className="flex-1 flex items-center gap-1">
              <span className="text-sky-400 font-bold shrink-0">{isAr ? 'تشاكرا' : 'CHAKRA'}</span>
              <div className="flex-1 h-2 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    p1ChakraPercent >= 100
                      ? 'bg-sky-400 shadow-[0_0_10px_#38bdf8] animate-pulse'
                      : 'bg-sky-600'
                  }`}
                  style={{ width: `${p1ChakraPercent}%` }}
                />
              </div>
            </div>

            {/* Substitution Logs */}
            <div className="flex items-center gap-1 shrink-0 text-amber-500 font-semibold" title={isAr ? 'تقنية الاستبدال' : 'Substitution'}>
              <span>🪵</span>
              <span>{Math.floor(p1.substitutionGauge)}%</span>
            </div>
          </div>
        </div>

        {/* CENTER TIMER & PAUSE / SOUND BUTTONS */}
        <div className="flex flex-col items-center justify-center shrink-0 px-2">
          {/* Timer Display */}
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-zinc-950/90 border-2 border-amber-500/80 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <span className="text-lg md:text-xl font-mono font-black text-amber-300 tabular-nums">
              {gameMode === 'training' ? '∞' : timeLeft}
            </span>
          </div>

          {gameMode === 'survival' && (
            <span className="text-[11px] font-bold text-amber-400 mt-1">
              {isAr ? `موجة ${wave || 1}` : `Wave ${wave || 1}`}
            </span>
          )}

          {/* Quick Controls Bar (Clickable) */}
          <div className="flex items-center gap-1.5 mt-1.5 pointer-events-auto">
            <button
              onClick={onTogglePause}
              className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title={isPaused ? (isAr ? 'استئناف' : 'Resume') : (isAr ? 'إيقاف مؤقت' : 'Pause')}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onToggleMute}
              className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title={isMuted ? (isAr ? 'تشغيل الصوت' : 'Unmute') : (isAr ? 'كتم الصوت' : 'Mute')}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-zinc-300" />}
            </button>
            <button
              onClick={onOpenHelp}
              className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title={isAr ? 'الأزرار والتحكم' : 'Controls'}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PLAYER 2 / CPU HUD */}
        <div className="flex-1 flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {/* Round Win Stars */}
            <div className="flex items-center gap-1">
              {[0, 1].map((idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx < p2RoundsWon ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-zinc-700/60'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm md:text-base font-black text-rose-400 drop-shadow">
              {p2Char.name[lang]} {gameMode === 'arcade' || gameMode === 'survival' ? (isAr ? '(خصم)' : '(CPU)') : ''}
            </span>
          </div>

          {/* P2 Health Bar */}
          <div className="w-full h-4 md:h-6 bg-zinc-950/80 border border-zinc-700 rounded-sm overflow-hidden p-0.5 shadow-md">
            <div
              className="h-full bg-gradient-to-l from-red-600 via-amber-500 to-emerald-500 transition-all duration-150 rounded-sm mr-auto"
              style={{ width: `${p2HpPercent}%`, marginLeft: 'auto' }}
            />
          </div>

          {/* P2 Chakra & Substitution */}
          <div className="w-full flex items-center justify-between gap-2 text-[11px] font-mono">
            {/* Substitution Logs */}
            <div className="flex items-center gap-1 shrink-0 text-amber-500 font-semibold">
              <span>🪵</span>
              <span>{Math.floor(p2.substitutionGauge)}%</span>
            </div>

            {/* Chakra Bar */}
            <div className="flex-1 flex items-center gap-1 justify-end">
              <div className="flex-1 h-2 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    p2ChakraPercent >= 100
                      ? 'bg-rose-400 shadow-[0_0_10px_#fb7185] animate-pulse'
                      : 'bg-rose-600'
                  }`}
                  style={{ width: `${p2ChakraPercent}%`, marginLeft: 'auto' }}
                />
              </div>
              <span className="text-rose-400 font-bold shrink-0">{isAr ? 'تشاكرا' : 'CHAKRA'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Combo Alerts */}
      {p1.comboCount > 1 && (
        <div className="self-start mt-2 px-3 py-1 rounded bg-amber-500/20 border border-amber-500/50 backdrop-blur-sm animate-bounce">
          <span className="text-xs md:text-sm font-black text-amber-400 uppercase tracking-wider">
            {p1.comboCount} {isAr ? 'ضربات متتالية!' : 'COMBO HITS!'}
          </span>
        </div>
      )}

      {p2.comboCount > 1 && (
        <div className="self-end mt-2 px-3 py-1 rounded bg-rose-500/20 border border-rose-500/50 backdrop-blur-sm animate-bounce">
          <span className="text-xs md:text-sm font-black text-rose-400 uppercase tracking-wider">
            {p2.comboCount} {isAr ? 'ضربات متتالية!' : 'COMBO HITS!'}
          </span>
        </div>
      )}
    </div>
  );
};
