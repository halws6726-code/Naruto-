import React from 'react';
import { MatchStats, CharacterDef, Language, GameMode } from '../types/game';
import { RotateCcw, Users, Home } from 'lucide-react';

interface VictoryModalProps {
  stats: MatchStats;
  p1Char: CharacterDef;
  p2Char: CharacterDef;
  lang: Language;
  gameMode: GameMode;
  onRematch: () => void;
  onChangeFighters: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  p1Char,
  p2Char,
  lang,
  gameMode,
  onRematch,
  onChangeFighters,
  onMainMenu
}) => {
  const isAr = lang === 'ar';

  const isP1Winner = stats.winner === 1;
  const isDraw = stats.winner === 'draw';
  const winnerChar = isP1Winner ? p1Char : p2Char;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border-2 border-amber-500/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center flex flex-col items-center">
        
        {/* Banner Title */}
        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 font-mono text-xs uppercase tracking-widest mb-3">
          {gameMode === 'survival' ? (isAr ? 'انتهاء موجة البقاء' : 'SURVIVAL COMPLETE') : (isAr ? 'نهاية النزال' : 'MATCH FINISHED')}
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">
          {isDraw 
            ? (isAr ? 'تعادل بين الشينوبي!' : 'DRAW MATCH!') 
            : `${winnerChar.name[lang]} ${isAr ? 'ينتصر بالضربة القاضية!' : 'VICTORIOUS!'}`}
        </h2>

        {!isDraw && (
          <p className="text-sm italic text-zinc-300 mt-2 max-w-sm">
            &ldquo;{winnerChar.quote[lang]}&rdquo;
          </p>
        )}

        {/* Combat Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 my-6 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
          <div className="flex flex-col items-start gap-1 p-2 rounded bg-zinc-900/50">
            <span className="text-zinc-400">{isAr ? 'ضرر اللاعب 1' : 'P1 Total Damage'}</span>
            <span className="text-base font-mono font-bold text-amber-400 tabular-nums">
              {stats.p1DamageDealt} HP
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {isAr ? 'أعلى كومبو' : 'Max Combo'}: {stats.p1MaxCombo}x
            </span>
          </div>

          <div className="flex flex-col items-end gap-1 p-2 rounded bg-zinc-900/50">
            <span className="text-zinc-400">{isAr ? 'ضرر اللاعب 2 / الخصم' : 'P2/CPU Damage'}</span>
            <span className="text-base font-mono font-bold text-rose-400 tabular-nums">
              {stats.p2DamageDealt} HP
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {isAr ? 'أعلى كومبو' : 'Max Combo'}: {stats.p2MaxCombo}x
            </span>
          </div>

          {stats.wavesCleared !== undefined && (
            <div className="col-span-2 flex items-center justify-between p-2 rounded bg-zinc-900/50 border border-amber-500/20">
              <span className="text-zinc-300 font-bold">{isAr ? 'الموجات التي تم اجتيازها' : 'Waves Cleared'}</span>
              <span className="text-amber-400 font-mono font-black text-sm">{stats.wavesCleared}</span>
            </div>
          )}

          <div className="col-span-2 flex items-center justify-between p-1.5 text-zinc-400 font-mono text-[11px]">
            <span>{isAr ? 'مدة النزال' : 'Match Duration'}</span>
            <span className="text-zinc-200">{stats.durationSeconds}s</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={onRematch}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'إعادة النزال' : 'Rematch'}</span>
          </button>

          <button
            onClick={onChangeFighters}
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>{isAr ? 'تغيير المقاتلين' : 'Change Fighters'}</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{isAr ? 'القائمة الرئيسية' : 'Main Menu'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
