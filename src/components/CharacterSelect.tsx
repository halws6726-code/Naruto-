import React, { useState } from 'react';
import { CharacterId, Language, GameMode } from '../types/game';
import { CHARACTERS, CHARACTER_LIST } from '../data/characters';
import { sound } from '../utils/audio';

interface CharacterSelectProps {
  onSelect: (p1Id: CharacterId, p2Id: CharacterId) => void;
  lang: Language;
  gameMode: GameMode;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onSelect,
  lang,
  gameMode,
  onBack
}) => {
  const isAr = lang === 'ar';
  const [selectedP1, setSelectedP1] = useState<CharacterId>('naruto');
  const [selectedP2, setSelectedP2] = useState<CharacterId>('sasuke');
  const [selectingFor, setSelectingFor] = useState<'p1' | 'p2'>('p1');

  const p1Data = CHARACTERS[selectedP1];
  const p2Data = CHARACTERS[selectedP2];

  const handlePick = (id: CharacterId) => {
    sound.playHit();
    if (selectingFor === 'p1') {
      setSelectedP1(id);
      if (gameMode === 'versus_p2') {
        setSelectingFor('p2');
      }
    } else {
      setSelectedP2(id);
    }
  };

  const handleConfirm = () => {
    sound.playHeavyHit();
    onSelect(selectedP1, selectedP2);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-amber-500 tracking-wide">
            {isAr ? 'اختيار شينوبي المعركة' : 'CHOOSE YOUR SHINOBI'}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            {isAr 
              ? (gameMode === 'versus_p2' ? 'اختر مقاتل اللاعب الأول ثم مقاتل اللاعب الثاني' : 'اختر بطلك لخوض معارك النينجا الثنائية')
              : 'Select your legendary ninja warrior'}
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold transition-colors"
        >
          {isAr ? 'العودة للقائمة' : 'Back to Menu'}
        </button>
      </div>

      {/* Main Grid: Fighters Selection & Detailed Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-6">
        
        {/* Left Column: Fighter Roster Cards */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {gameMode === 'versus_p2' && (
            <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-lg w-fit">
              <button
                onClick={() => setSelectingFor('p1')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  selectingFor === 'p1' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isAr ? 'اختيار اللاعب 1' : 'Select Player 1'}
              </button>
              <button
                onClick={() => setSelectingFor('p2')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  selectingFor === 'p2' ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isAr ? 'اختيار اللاعب 2' : 'Select Player 2'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CHARACTER_LIST.map((char) => {
              const isP1 = selectedP1 === char.id;
              const isP2 = selectedP2 === char.id;

              return (
                <button
                  key={char.id}
                  onClick={() => handlePick(char.id)}
                  className={`relative flex flex-col items-center p-3 rounded-xl border text-center transition-all transform hover:-translate-y-1 ${
                    isP1 && selectingFor === 'p1'
                      ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-2 ring-amber-400'
                      : isP2 && selectingFor === 'p2'
                      ? 'border-rose-500 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-2 ring-rose-500'
                      : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'
                  }`}
                >
                  {/* Badges for P1 / P2 */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {isP1 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-zinc-950">
                        1P
                      </span>
                    )}
                    {isP2 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white">
                        2P
                      </span>
                    )}
                  </div>

                  {/* Character Avatar Icon Frame */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl my-2 border-2 shadow-inner"
                    style={{ borderColor: char.themeColor, backgroundColor: `${char.themeColor}22` }}
                  >
                    <span>{char.jutsu1.icon}</span>
                  </div>

                  <span className="font-bold text-sm text-zinc-100">{char.name[lang]}</span>
                  <span className="text-[11px] text-zinc-400 truncate max-w-full">{char.village[lang]}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Quote Banner */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 italic text-zinc-300 text-sm">
            &ldquo;{selectingFor === 'p1' ? p1Data.quote[lang] : p2Data.quote[lang]}&rdquo;
          </div>
        </div>

        {/* Right Column: Active Fighter Profile & Jutsu Arsenal */}
        <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-amber-400">
                  {selectingFor === 'p1' ? (isAr ? 'اللاعب 1' : 'PLAYER 1') : (isAr ? 'اللاعب 2 / الخصم' : 'PLAYER 2 / CPU')}
                </span>
                <h2 className="text-xl font-black text-zinc-100">
                  {selectingFor === 'p1' ? p1Data.name[lang] : p2Data.name[lang]}
                </h2>
                <p className="text-xs text-zinc-400">
                  {selectingFor === 'p1' ? p1Data.title[lang] : p2Data.title[lang]}
                </p>
              </div>

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border"
                style={{
                  borderColor: selectingFor === 'p1' ? p1Data.themeColor : p2Data.themeColor,
                  backgroundColor: `${selectingFor === 'p1' ? p1Data.themeColor : p2Data.themeColor}33`
                }}
              >
                {selectingFor === 'p1' ? p1Data.jutsu1.icon : p2Data.jutsu1.icon}
              </div>
            </div>

            {/* Combat Attributes Bars */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>{isAr ? 'الصحة' : 'Health'}</span>
                  <span className="font-mono text-zinc-200">{selectingFor === 'p1' ? p1Data.maxHealth : p2Data.maxHealth}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${((selectingFor === 'p1' ? p1Data.maxHealth : p2Data.maxHealth) / 1100) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>{isAr ? 'قوة الهجوم' : 'Attack'}</span>
                  <span className="font-mono text-zinc-200">{selectingFor === 'p1' ? p1Data.attackPower : p2Data.attackPower}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${((selectingFor === 'p1' ? p1Data.attackPower : p2Data.attackPower) / 45) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>{isAr ? 'السرعة والرشاقة' : 'Speed'}</span>
                  <span className="font-mono text-zinc-200">{selectingFor === 'p1' ? p1Data.speed : p2Data.speed}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${((selectingFor === 'p1' ? p1Data.speed : p2Data.speed) / 7) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>{isAr ? 'الدفاع والصلابة' : 'Defense'}</span>
                  <span className="font-mono text-zinc-200">{selectingFor === 'p1' ? p1Data.defense : p2Data.defense}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${((selectingFor === 'p1' ? p1Data.defense : p2Data.defense) / 40) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Jutsu Arsenal List */}
            <div className="space-y-2 mt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {isAr ? 'ترسانة النينجتسو' : 'JUTSU ARSENAL'}
              </span>

              {/* Jutsu 1 */}
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">{selectingFor === 'p1' ? p1Data.jutsu1.icon : p2Data.jutsu1.icon}</span>
                  <div>
                    <div className="font-bold text-zinc-200">
                      {selectingFor === 'p1' ? p1Data.jutsu1.name[lang] : p2Data.jutsu1.name[lang]}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {selectingFor === 'p1' ? p1Data.jutsu1.description[lang] : p2Data.jutsu1.description[lang]}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono text-[10px]">
                  {selectingFor === 'p1' ? p1Data.jutsu1.chakraCost : p2Data.jutsu1.chakraCost} CP
                </span>
              </div>

              {/* Jutsu 2 */}
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">{selectingFor === 'p1' ? p1Data.jutsu2.icon : p2Data.jutsu2.icon}</span>
                  <div>
                    <div className="font-bold text-zinc-200">
                      {selectingFor === 'p1' ? p1Data.jutsu2.name[lang] : p2Data.jutsu2.name[lang]}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {selectingFor === 'p1' ? p1Data.jutsu2.description[lang] : p2Data.jutsu2.description[lang]}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono text-[10px]">
                  {selectingFor === 'p1' ? p1Data.jutsu2.chakraCost : p2Data.jutsu2.chakraCost} CP
                </span>
              </div>

              {/* Ultimate Ougi */}
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-red-900/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">{selectingFor === 'p1' ? p1Data.ultimate.icon : p2Data.ultimate.icon}</span>
                  <div>
                    <div className="font-bold text-red-400">
                      {selectingFor === 'p1' ? p1Data.ultimate.name[lang] : p2Data.ultimate.name[lang]}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {selectingFor === 'p1' ? p1Data.ultimate.description[lang] : p2Data.ultimate.description[lang]}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-mono text-[10px] font-bold">
                  100 CP (MAX)
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-black text-base shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
          >
            {isAr ? 'بدء المواجهة الآن! ⚔️' : 'START BATTLE! ⚔️'}
          </button>
        </div>

      </div>
    </div>
  );
};
