import React, { useState } from 'react';
import { GameMode, Difficulty, CharacterId, ArenaId, Language } from './types/game';
import { CharacterSelect } from './components/CharacterSelect';
import { ArenaSelect } from './components/ArenaSelect';
import { GameCanvas } from './components/GameCanvas';
import { GameCanvas3D } from './components/GameCanvas3D';
import { HowToPlayModal } from './components/HowToPlayModal';
import { sound } from './utils/audio';
import { Swords, Users, ShieldAlert, Award, Sparkles, Volume2, VolumeX, HelpCircle, Globe, Box } from 'lucide-react';
import heroBannerImg from './assets/images/naruto_cover_banner_1791992443528.jpg';

type AppScreen = 'home' | 'character_select' | 'arena_select' | 'game';
type DimensionMode = '3d' | '2d';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [dimension, setDimension] = useState<DimensionMode>('3d');
  const [screen, setScreen] = useState<AppScreen>('home');
  const [gameMode, setGameMode] = useState<GameMode>('arcade');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [p1CharId, setP1CharId] = useState<CharacterId>('naruto');
  const [p2CharId, setP2CharId] = useState<CharacterId>('sasuke');
  const [arenaId, setArenaId] = useState<ArenaId>('leaf_village');
  const [showHelp, setShowHelp] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const isAr = lang === 'ar';

  const handleStartMode = (mode: GameMode) => {
    sound.playHit();
    setGameMode(mode);
    setScreen('character_select');
  };

  const handleCharacterSelected = (p1: CharacterId, p2: CharacterId) => {
    setP1CharId(p1);
    setP2CharId(p2);
    setScreen('arena_select');
  };

  const handleArenaSelected = (arena: ArenaId) => {
    setArenaId(arena);
    setScreen('game');
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const toggleLang = () => {
    sound.playHit();
    const next = isAr ? 'en' : 'ar';
    setLang(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleDimension = () => {
    sound.playHit();
    setDimension(prev => prev === '3d' ? '2d' : '3d');
  };

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans ${isAr ? 'rtl' : 'ltr'}`}>
      
      {/* Top Bar Contract (1 row, 3 zones separated by gap-8) */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            sound.playHit();
            setScreen('home');
          }}
          className="text-lg md:text-xl font-black tracking-tight text-amber-500 whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>🔥</span>
          <span>{isAr ? `ناروتو ${dimension.toUpperCase()}: معركة الشينوبي` : `NARUTO ${dimension.toUpperCase()}: SHINOBI CLASH`}</span>
        </button>

        {/* Zone 2: 4–5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-400">
          <button
            onClick={() => handleStartMode('arcade')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAr ? 'طور الأركيد' : 'Arcade Mode'}
          </button>
          <button
            onClick={() => handleStartMode('versus_p2')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAr ? 'نزال ثنائي (2P)' : '2-Player Versus'}
          </button>
          <button
            onClick={() => handleStartMode('survival')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAr ? 'موجات البقاء' : 'Survival Waves'}
          </button>
          <button
            onClick={() => handleStartMode('training')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAr ? 'دوجو التدريب' : 'Training Dojo'}
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAr ? 'دليل التقنيات' : 'Jutsu Guide'}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dimension Toggle (3D / 2D) */}
          <button
            onClick={toggleDimension}
            className={`px-3 py-1.5 text-xs font-black rounded-lg border transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              dimension === '3d'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-zinc-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{dimension === '3d' ? (isAr ? 'ثري دي 3D' : '3D Mode') : (isAr ? 'تو دي 2D' : '2D Mode')}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
            title={isMuted ? (isAr ? 'تشغيل الصوت' : 'Unmute') : (isAr ? 'كتم الصوت' : 'Mute')}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </header>

      {/* Screen Views */}
      <main className="flex-1 flex flex-col">
        {screen === 'home' && (
          <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full p-4 md:p-8">
            
            {/* Hero Splash Card */}
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 shadow-2xl bg-zinc-900 my-4">
              <div className="relative aspect-[21/9] md:aspect-[24/9] w-full overflow-hidden">
                <img
                  src={heroBannerImg}
                  alt="Naruto 3D Shinobi Battle"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/80" />
                
                {/* Hero Overlay Text */}
                <div className="absolute bottom-6 inset-x-6 md:inset-x-10 flex flex-col items-start gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {dimension === '3d'
                        ? (isAr ? 'محرك قتال شينوبي ثلاثي الأبعاد 3D (Three.js)' : 'Next-Gen 3D Shinobi Combat Engine (Three.js)')
                        : (isAr ? 'محرك قتال نينجا ثنائي الأبعاد 2D' : '2D Ninja Combat Engine')}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-zinc-100 drop-shadow-md">
                    {isAr ? `ناروتو ${dimension.toUpperCase()}: صراع الأساطير` : `NARUTO ${dimension.toUpperCase()}: CLASH OF LEGENDS`}
                  </h1>

                  <p className="text-xs md:text-sm text-zinc-300 max-w-xl line-clamp-2">
                    {isAr 
                      ? 'عش إثارة معارك النينجا ثلاثية الأبعاد مع الراسينغان والتشيدوري، واستدعاء نسخ الظل، وتقنية الاستبدال بجذع الخشب وكاميرات تفاعلية.'
                      : 'Experience dynamic 3D anime shinobi duels with Rasengan, Chidori, Shadow Clones, Kawarimi substitution, and multiple camera angles.'}
                  </p>

                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => handleStartMode('arcade')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs md:text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Swords className="w-4 h-4" />
                      <span>{isAr ? 'خوض معركة الأركيد 3D' : 'Start 3D Arcade'}</span>
                    </button>

                    <button
                      onClick={toggleDimension}
                      className="px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs md:text-sm transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Box className="w-4 h-4 text-amber-400" />
                      <span>{isAr ? `التبديل إلى ${dimension === '3d' ? '2D' : '3D'}` : `Switch to ${dimension === '3d' ? '2D' : '3D'}`}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Modes Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
              
              {/* 1. Arcade Tower */}
              <button
                onClick={() => handleStartMode('arcade')}
                className="group p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/60 hover:bg-zinc-900 transition-all flex flex-col justify-between text-start cursor-pointer hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                    <Swords className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-100 group-hover:text-amber-400 transition-colors">
                    {isAr ? 'طور الأركيد الفردي' : 'Arcade Solo Tower'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {isAr ? 'واجه أقوى الشينوبي وتحدَّ الذكاء الاصطناعي في جولات متتالية.' : 'Battle through challenging AI ninja rivals in best 2-of-3 rounds.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>{isAr ? 'ابدأ الأركيد' : 'Start Arcade'}</span>
                  <span>→</span>
                </div>
              </button>

              {/* 2. Local 2-Player Versus */}
              <button
                onClick={() => handleStartMode('versus_p2')}
                className="group p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-blue-500/60 hover:bg-zinc-900 transition-all flex flex-col justify-between text-start cursor-pointer hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-100 group-hover:text-blue-400 transition-colors">
                    {isAr ? 'نزال محلي لشخصين (2P)' : 'Local 2-Player Clash'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {isAr ? 'تحدَّ صديقك على نفس لوحة المفاتيح في مواجهة ملحمية مباشرة.' : 'Compete head-to-head on the same keyboard in real-time.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold text-blue-400">
                  <span>{isAr ? 'ابدأ النزال الثنائي' : 'Start 2P Versus'}</span>
                  <span>→</span>
                </div>
              </button>

              {/* 3. Survival Mode */}
              <button
                onClick={() => handleStartMode('survival')}
                className="group p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-red-500/60 hover:bg-zinc-900 transition-all flex flex-col justify-between text-start cursor-pointer hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-3 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-100 group-hover:text-red-400 transition-colors">
                    {isAr ? 'موجات البقاء اللانهائية' : 'Shinobi Survival'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {isAr ? 'قاتل موجات الأعداء المتتالية بشريط صحة واحد واختبر قدرتك على الصمود.' : 'Survive continuous enemy waves with a single life bar.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold text-red-400">
                  <span>{isAr ? 'ابدأ البقاء' : 'Start Survival'}</span>
                  <span>→</span>
                </div>
              </button>

              {/* 4. Training Dojo */}
              <button
                onClick={() => handleStartMode('training')}
                className="group p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/60 hover:bg-zinc-900 transition-all flex flex-col justify-between text-start cursor-pointer hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-100 group-hover:text-emerald-400 transition-colors">
                    {isAr ? 'دوجو التدريب الحر' : 'Training Dojo'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {isAr ? 'تدرب على تسديد الكومبو وحساب توقيت الراسينغان والاستبدال.' : 'Free practice without time limits to master combos and jutsu.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>{isAr ? 'دخول الدوجو' : 'Enter Dojo'}</span>
                  <span>→</span>
                </div>
              </button>

            </div>

            {/* Bottom Settings Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
              
              {/* Difficulty Segmented Buttons */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-400">{isAr ? 'مستوى الصعوبة:' : 'Difficulty:'}</span>
                <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                  {(['easy', 'normal', 'hard', 'hokage'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        sound.playHit();
                        setDifficulty(diff);
                      }}
                      className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                        difficulty === diff
                          ? 'bg-amber-500 text-zinc-950 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {diff === 'easy' ? (isAr ? 'جينين (سهل)' : 'Genin (Easy)') :
                       diff === 'normal' ? (isAr ? 'تشونين (عادي)' : 'Chunin (Normal)') :
                       diff === 'hard' ? (isAr ? 'جونين (صعب)' : 'Jonin (Hard)') :
                       (isAr ? 'هوكاغي (خارق)' : 'Hokage (Extreme)')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guide Button */}
              <button
                onClick={() => setShowHelp(true)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'طريقة اللعب والأزرار' : 'How to Play & Controls'}</span>
              </button>

            </div>

          </div>
        )}

        {screen === 'character_select' && (
          <CharacterSelect
            onSelect={handleCharacterSelected}
            lang={lang}
            gameMode={gameMode}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'arena_select' && (
          <ArenaSelect
            onSelect={handleArenaSelected}
            lang={lang}
            onBack={() => setScreen('character_select')}
          />
        )}

        {screen === 'game' && (
          dimension === '3d' ? (
            <GameCanvas3D
              p1CharId={p1CharId}
              p2CharId={p2CharId}
              arenaId={arenaId}
              gameMode={gameMode}
              difficulty={difficulty}
              lang={lang}
              onExit={() => setScreen('home')}
              onChangeFighters={() => setScreen('character_select')}
              onSwitchTo2D={() => setDimension('2d')}
            />
          ) : (
            <GameCanvas
              p1CharId={p1CharId}
              p2CharId={p2CharId}
              arenaId={arenaId}
              gameMode={gameMode}
              difficulty={difficulty}
              lang={lang}
              onExit={() => setScreen('home')}
              onChangeFighters={() => setScreen('character_select')}
            />
          )
        )}
      </main>

      {/* Guide Modal */}
      <HowToPlayModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        lang={lang}
      />

      {/* Clean Footer */}
      <footer className="py-3 px-6 border-t border-zinc-900 bg-zinc-950 text-center text-xs text-zinc-500">
        <span>Naruto 3D Shinobi Battle · {isAr ? 'مستوحاة من عالم النينجا وشخصيات ماساشي كيشيموتو' : 'Fan-tribute 3D ninja action game'} · 2026</span>
      </footer>

    </div>
  );
}
