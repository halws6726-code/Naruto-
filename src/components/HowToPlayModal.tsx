import React from 'react';
import { Language } from '../types/game';
import { X } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;
  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-xl font-black text-amber-400">
            {isAr ? 'دليل التحكم وتقنيات النينجا' : 'NINJA COMBAT & CONTROLS GUIDE'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 my-4 text-xs md:text-sm text-zinc-300">
          
          {/* Controls Tables */}
          <div>
            <h3 className="font-bold text-amber-300 mb-2">
              {isAr ? 'أزرار لوحة المفاتيح (Keyboard Controls)' : 'Keyboard Layout'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* P1 Controls */}
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                <span className="font-bold text-amber-400 block mb-2">{isAr ? 'اللاعب الأول (P1)' : 'Player 1'}</span>
                <ul className="space-y-1.5 font-mono text-xs">
                  <li><span className="text-zinc-400">A / D:</span> {isAr ? 'التحرك يميناً ويساراً' : 'Move Left / Right'}</li>
                  <li><span className="text-zinc-400">W:</span> {isAr ? 'القفز عالياً' : 'Jump'}</li>
                  <li><span className="text-zinc-400">S:</span> {isAr ? 'الدفاع / الصد (Block)' : 'Defend / Block'}</li>
                  <li><span className="text-amber-400 font-bold">J:</span> {isAr ? 'هجوم سريع (لكمة/كومبو)' : 'Light Punch / Combo'}</li>
                  <li><span className="text-orange-400 font-bold">K:</span> {isAr ? 'هجوم قوي (ركلة قاضية)' : 'Heavy Kick'}</li>
                  <li><span className="text-zinc-300">L:</span> {isAr ? 'رمي الشوريكن' : 'Shuriken Throw'}</li>
                  <li><span className="text-sky-400 font-bold">U:</span> {isAr ? 'نينجتسو 1 (راسينغان/تشيدوري...)' : 'Jutsu 1'}</li>
                  <li><span className="text-indigo-400 font-bold">I:</span> {isAr ? 'نينجتسو 2 (نسخ الظل/كرة النار...)' : 'Jutsu 2'}</li>
                  <li><span className="text-red-400 font-bold">O:</span> {isAr ? 'التقنية السرية القصوى (100% تشاكرا)' : 'Ultimate Ougi (100% CP)'}</li>
                  <li><span className="text-yellow-500 font-bold">Space:</span> {isAr ? 'تقنية الاستبدال (جذع الخشب)' : 'Substitution (Kawarimi)'}</li>
                  <li><span className="text-sky-300 font-bold">C (اضغط مطولاً):</span> {isAr ? 'شحن التشاكرا' : 'Charge Chakra'}</li>
                </ul>
              </div>

              {/* P2 Controls for local versus */}
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                <span className="font-bold text-rose-400 block mb-2">{isAr ? 'اللاعب الثاني (P2 - طور المواجهة)' : 'Player 2 (Versus)'}</span>
                <ul className="space-y-1.5 font-mono text-xs">
                  <li><span className="text-zinc-400">الأسهم (Arrows):</span> {isAr ? 'التحرك والقفز والصد' : 'Move, Jump, Block'}</li>
                  <li><span className="text-amber-400 font-bold">Num 1 / B:</span> {isAr ? 'هجوم سريع' : 'Light Attack'}</li>
                  <li><span className="text-orange-400 font-bold">Num 2 / N:</span> {isAr ? 'هجوم قوي' : 'Heavy Attack'}</li>
                  <li><span className="text-zinc-300">Num 3 / M:</span> {isAr ? 'شوريكن' : 'Shuriken'}</li>
                  <li><span className="text-sky-400 font-bold">Num 4 / H:</span> {isAr ? 'نينجتسو 1' : 'Jutsu 1'}</li>
                  <li><span className="text-indigo-400 font-bold">Num 5 / J:</span> {isAr ? 'نينجتسو 2' : 'Jutsu 2'}</li>
                  <li><span className="text-red-400 font-bold">Num 6 / K:</span> {isAr ? 'التقنية القصوى' : 'Ultimate'}</li>
                  <li><span className="text-yellow-500 font-bold">Num 0 / Space:</span> {isAr ? 'الاستبدال' : 'Substitution'}</li>
                  <li><span className="text-sky-300 font-bold">Enter:</span> {isAr ? 'شحن التشاكرا' : 'Charge Chakra'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Core Shinobi Mechanics */}
          <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-2">
            <h4 className="font-bold text-amber-400">{isAr ? 'أسرار القتال والمهارات الخاصة:' : 'Special Combat Mechanics:'}</h4>
            <p>
              • <strong className="text-yellow-400">{isAr ? 'تقنية الاستبدال (كاواريمي - Kawarimi):' : 'Substitution Jutsu:'}</strong> {isAr ? 'عند تعرضك لهجوم قوي أو كومبو، اضغط مسافة (Space) للتلاشي في سحابة دخان وترك جذع خشبي والظهور خلف الخصم فوراً!' : 'When trapped in a combo or attacked, press Space to substitute with a wooden log and teleport behind your foe!'}
            </p>
            <p>
              • <strong className="text-sky-400">{isAr ? 'شحن التشاكرا (Chakra Charge):' : 'Chakra Gathering:'}</strong> {isAr ? 'اضغط مطولاً على زر C للتركيز وتوليد التشاكرا بسرعة حتى تتمكن من إطلاق أقوى التقنيات.' : 'Hold C to channel chakra aura and recharge energy for high-damage jutsu.'}
            </p>
            <p>
              • <strong className="text-red-400">{isAr ? 'التقنية القصوى (Secret Ougi):' : 'Secret Ultimate Ougi:'}</strong> {isAr ? 'عندما يمتلئ شريط التشاكرا بنسبة 100% ويصبح مشعاً، اضغط O لإطلاق الضربة القاضية السينمائية!' : 'When your chakra gauge reaches 100%, trigger O to launch your cinematic finisher!'}
            </p>
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm cursor-pointer transition-colors"
        >
          {isAr ? 'فهمت، لنبدأ القتال! 🥷' : 'GOT IT, LET’S FIGHT! 🥷'}
        </button>

      </div>
    </div>
  );
};
