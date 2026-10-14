import React, { useState } from 'react';
import { ArenaId, Language } from '../types/game';
import { ARENA_LIST } from '../data/arenas';
import { sound } from '../utils/audio';

interface ArenaSelectProps {
  onSelect: (arenaId: ArenaId) => void;
  lang: Language;
  onBack: () => void;
}

export const ArenaSelect: React.FC<ArenaSelectProps> = ({
  onSelect,
  lang,
  onBack
}) => {
  const isAr = lang === 'ar';
  const [selectedArena, setSelectedArena] = useState<ArenaId>('leaf_village');

  const handlePick = (id: ArenaId) => {
    sound.playHit();
    setSelectedArena(id);
  };

  const handleConfirm = () => {
    sound.playHeavyHit();
    onSelect(selectedArena);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-amber-500 tracking-wide">
            {isAr ? 'اختيار حلبة النينجا' : 'CHOOSE BATTLE ARENA'}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            {isAr ? 'حدد ساحة المعركة التاريخية للقتال' : 'Select the legendary stage for this clash'}
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold transition-colors"
        >
          {isAr ? 'رجوع' : 'Back'}
        </button>
      </div>

      {/* Arenas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-auto py-8">
        {ARENA_LIST.map((arena) => {
          const isSelected = selectedArena === arena.id;
          return (
            <button
              key={arena.id}
              onClick={() => handlePick(arena.id)}
              className={`group relative overflow-hidden rounded-2xl border text-left flex flex-col transition-all cursor-pointer ${
                isSelected
                  ? 'border-amber-400 ring-4 ring-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.35)] scale-[1.02]'
                  : 'border-zinc-800 hover:border-zinc-600 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
                <img
                  src={arena.image}
                  alt={arena.name[lang]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                
                {isSelected && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 text-xs font-black shadow-md">
                    {isAr ? 'المختارة' : 'SELECTED'}
                  </div>
                )}
              </div>

              <div className="p-4 bg-zinc-900/90 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-zinc-100">{arena.name[lang]}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{arena.location[lang]}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Confirm Button */}
      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <button
          onClick={handleConfirm}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-black text-base shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
        >
          {isAr ? 'تأكيد الحلبة ودخول المعركة ⚔️' : 'ENTER ARENA ⚔️'}
        </button>
      </div>
    </div>
  );
};
