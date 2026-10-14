import React from 'react';
import { Language } from '../types/game';

interface TouchControlsProps {
  onButtonDown: (btn: string) => void;
  onButtonUp: (btn: string) => void;
  lang: Language;
  p1CharId: string;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onButtonDown,
  onButtonUp,
  lang,
}) => {
  const isAr = lang === 'ar';

  const handleTouchStart = (btn: string, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onButtonDown(btn);
  };

  const handleTouchEnd = (btn: string, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onButtonUp(btn);
  };

  return (
    <div className="w-full flex items-end justify-between p-3 md:p-6 select-none pointer-events-none z-30">
      {/* LEFT: VIRTUAL D-PAD */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5 bg-zinc-950/70 p-2.5 rounded-2xl border border-zinc-800/80 backdrop-blur-md">
        {/* Jump Button (Up) */}
        <button
          onTouchStart={(e) => handleTouchStart('jump', e)}
          onTouchEnd={(e) => handleTouchEnd('jump', e)}
          onMouseDown={(e) => handleTouchStart('jump', e)}
          onMouseUp={(e) => handleTouchEnd('jump', e)}
          className="w-12 h-12 rounded-xl bg-zinc-800 active:bg-amber-500 text-zinc-100 font-black text-sm flex items-center justify-center border border-zinc-700 shadow-md transition-colors"
          aria-label="Jump"
        >
          ▲
        </button>

        {/* Left & Right & Block Row */}
        <div className="flex items-center gap-1.5">
          <button
            onTouchStart={(e) => handleTouchStart('left', e)}
            onTouchEnd={(e) => handleTouchEnd('left', e)}
            onMouseDown={(e) => handleTouchStart('left', e)}
            onMouseUp={(e) => handleTouchEnd('left', e)}
            className="w-12 h-12 rounded-xl bg-zinc-800 active:bg-amber-500 text-zinc-100 font-black text-sm flex items-center justify-center border border-zinc-700 shadow-md transition-colors"
            aria-label="Move Left"
          >
            ◀
          </button>

          {/* Block / Crouch (Down) */}
          <button
            onTouchStart={(e) => handleTouchStart('block', e)}
            onTouchEnd={(e) => handleTouchEnd('block', e)}
            onMouseDown={(e) => handleTouchStart('block', e)}
            onMouseUp={(e) => handleTouchEnd('block', e)}
            className="w-12 h-12 rounded-xl bg-zinc-800 active:bg-blue-600 text-zinc-100 font-black text-xs flex flex-col items-center justify-center border border-zinc-700 shadow-md transition-colors"
            aria-label="Block"
          >
            ▼
            <span className="text-[9px] text-zinc-400">{isAr ? 'صد' : 'DEF'}</span>
          </button>

          <button
            onTouchStart={(e) => handleTouchStart('right', e)}
            onTouchEnd={(e) => handleTouchEnd('right', e)}
            onMouseDown={(e) => handleTouchStart('right', e)}
            onMouseUp={(e) => handleTouchEnd('right', e)}
            className="w-12 h-12 rounded-xl bg-zinc-800 active:bg-amber-500 text-zinc-100 font-black text-sm flex items-center justify-center border border-zinc-700 shadow-md transition-colors"
            aria-label="Move Right"
          >
            ▶
          </button>
        </div>
      </div>

      {/* RIGHT: ACTION COMBAT BUTTONS */}
      <div className="pointer-events-auto flex flex-col items-end gap-2 bg-zinc-950/70 p-2.5 rounded-2xl border border-zinc-800/80 backdrop-blur-md">
        
        {/* Top Jutsu Row: Jutsu 1, Jutsu 2, Ultimate */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={(e) => handleTouchStart('charge', e)}
            onTouchEnd={(e) => handleTouchEnd('charge', e)}
            onMouseDown={(e) => handleTouchStart('charge', e)}
            onMouseUp={(e) => handleTouchEnd('charge', e)}
            className="px-2.5 h-10 rounded-lg bg-sky-900/80 active:bg-sky-500 text-sky-200 font-bold text-xs flex items-center gap-1 border border-sky-600/60 shadow-md transition-colors"
          >
            <span>🌀</span>
            <span>{isAr ? 'شحن' : 'CHG'}</span>
          </button>

          <button
            onTouchStart={(e) => handleTouchStart('jutsu1', e)}
            onTouchEnd={(e) => handleTouchEnd('jutsu1', e)}
            onMouseDown={(e) => handleTouchStart('jutsu1', e)}
            onMouseUp={(e) => handleTouchEnd('jutsu1', e)}
            className="px-2.5 h-10 rounded-lg bg-amber-600 active:bg-amber-400 text-zinc-950 font-black text-xs flex items-center gap-1 border border-amber-400 shadow-md transition-colors"
          >
            <span>⚡</span>
            <span>{isAr ? 'نينجتسو 1' : 'JUTSU 1'}</span>
          </button>

          <button
            onTouchStart={(e) => handleTouchStart('jutsu2', e)}
            onTouchEnd={(e) => handleTouchEnd('jutsu2', e)}
            onMouseDown={(e) => handleTouchStart('jutsu2', e)}
            onMouseUp={(e) => handleTouchEnd('jutsu2', e)}
            className="px-2.5 h-10 rounded-lg bg-indigo-600 active:bg-indigo-400 text-zinc-100 font-black text-xs flex items-center gap-1 border border-indigo-400 shadow-md transition-colors"
          >
            <span>🔥</span>
            <span>{isAr ? 'نينجتسو 2' : 'JUTSU 2'}</span>
          </button>

          <button
            onTouchStart={(e) => handleTouchStart('ultimate', e)}
            onTouchEnd={(e) => handleTouchEnd('ultimate', e)}
            onMouseDown={(e) => handleTouchStart('ultimate', e)}
            onMouseUp={(e) => handleTouchEnd('ultimate', e)}
            className="px-3 h-10 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 active:brightness-125 text-white font-black text-xs flex items-center gap-1 border border-red-400 shadow-lg animate-pulse"
          >
            <span>💥</span>
            <span>{isAr ? 'القصوى' : 'ULT'}</span>
          </button>
        </div>

        {/* Bottom Row: Normal Punch, Kick, Shuriken, Substitution */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={(e) => handleTouchStart('substitute', e)}
            onTouchEnd={(e) => handleTouchEnd('substitute', e)}
            onMouseDown={(e) => handleTouchStart('substitute', e)}
            onMouseUp={(e) => handleTouchEnd('substitute', e)}
            className="w-11 h-11 rounded-xl bg-amber-900/90 active:bg-amber-600 text-amber-100 font-black text-xs flex flex-col items-center justify-center border border-amber-700 shadow-md"
            title={isAr ? 'تقنية الاستبدال' : 'Substitution'}
          >
            <span>🪵</span>
            <span className="text-[8px]">{isAr ? 'استبدال' : 'SUB'}</span>
          </button>

          <button
            onTouchStart={(e) => handleTouchStart('shuriken', e)}
            onTouchEnd={(e) => handleTouchEnd('shuriken', e)}
            onMouseDown={(e) => handleTouchStart('shuriken', e)}
            onMouseUp={(e) => handleTouchEnd('shuriken', e)}
            className="w-11 h-11 rounded-xl bg-zinc-800 active:bg-zinc-600 text-zinc-200 font-black text-xs flex flex-col items-center justify-center border border-zinc-700 shadow-md"
          >
            <span>⭐</span>
            <span className="text-[8px]">{isAr ? 'شوريكن' : 'TOOL'}</span>
          </button>

          <button
            onTouchStart={(e) => handleTouchStart('attack2', e)}
            onTouchEnd={(e) => handleTouchEnd('attack2', e)}
            onMouseDown={(e) => handleTouchStart('attack2', e)}
            onMouseUp={(e) => handleTouchEnd('attack2', e)}
            className="w-12 h-12 rounded-xl bg-orange-700 active:bg-orange-500 text-white font-black text-xs flex flex-col items-center justify-center border border-orange-500 shadow-md"
          >
            <span>K</span>
            <span className="text-[9px]">{isAr ? 'ركلة' : 'KICK'}</span>
          </button>

          <button
            onTouchStart={(e) => handleTouchStart('attack1', e)}
            onTouchEnd={(e) => handleTouchEnd('attack1', e)}
            onMouseDown={(e) => handleTouchStart('attack1', e)}
            onMouseUp={(e) => handleTouchEnd('attack1', e)}
            className="w-13 h-13 rounded-xl bg-amber-500 active:bg-amber-300 text-zinc-950 font-black text-sm flex flex-col items-center justify-center border border-amber-300 shadow-lg"
          >
            <span>J</span>
            <span className="text-[10px] font-bold">{isAr ? 'لكمة' : 'PUNCH'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
