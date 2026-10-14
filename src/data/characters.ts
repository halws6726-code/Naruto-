import { CharacterDef } from '../types/game';

export const CHARACTERS: Record<string, CharacterDef> = {
  naruto: {
    id: 'naruto',
    name: { ar: 'ناروتو أوزوماكي', en: 'Naruto Uzumaki' },
    title: { ar: 'بطل كونوها وشينوبي الإرادة', en: 'Hero of the Hidden Leaf' },
    village: { ar: 'قرية كونوها (ورق الشجر)', en: 'Leaf Village' },
    description: { 
      ar: 'يتميز بقوة التحمل الفائقة، تقنية نسخ الظل والراسينغان الدوارة مع تشاكرا الكيوبي.', 
      en: 'High endurance, Shadow Clone army, and the spinning force of the Rasengan.' 
    },
    quote: { 
      ar: 'لن أتراجع عن كلمتي أبداً، هذا هو طريقي في النينجا!', 
      en: 'I never go back on my word! That is my ninja way!' 
    },
    themeColor: '#ea580c',
    secondaryColor: '#facc15',
    chakraColor: '#38bdf8',
    maxHealth: 1000,
    maxChakra: 100,
    speed: 5.5,
    attackPower: 35,
    defense: 25,
    jutsu1: {
      id: 'rasengan',
      name: { ar: 'راسينغان', en: 'Rasengan' },
      chakraCost: 35,
      damage: 140,
      cooldown: 90,
      description: { ar: 'اندفاع قوي بكرة التشاكرا اللولبية لتحطيم دفاعات الخصم.', en: 'Dashes forward with a swirling sphere of concentrated chakra.' },
      icon: '🌀'
    },
    jutsu2: {
      id: 'clones',
      name: { ar: 'نسخ الظل المتعددة', en: 'Shadow Clones' },
      chakraCost: 40,
      damage: 90,
      cooldown: 120,
      description: { ar: 'استدعاء نسختي ظل تهاجمان الخصم في نفس اللحظة.', en: 'Summons 2 shadow clones that rush and attack the opponent.' },
      icon: '👥'
    },
    ultimate: {
      id: 'odama_rasengan',
      name: { ar: 'أوداما راسينغان العملاقة', en: 'Giant Odama Rasengan' },
      chakraCost: 100,
      damage: 320,
      cooldown: 200,
      description: { ar: 'انفجار هائل بتشاكرا الكيوبي وراسينغان عملاقة تسحق الحلبة.', en: 'Unleashes the Nine-Tails power with a colossal crushing Rasengan.' },
      icon: '🦊'
    }
  },
  sasuke: {
    id: 'sasuke',
    name: { ar: 'ساسكي أوتشيها', en: 'Sasuke Uchiha' },
    title: { ar: 'شبل الأوتشيها وسيد البرق', en: 'Avenger of the Uchiha' },
    village: { ar: 'قرية كونوها / الأوتشيها', en: 'Leaf / Uchiha Clan' },
    description: { 
      ar: 'شينوبي فائق السرعة، يتقن نصل البرق تشيدوري وكرات النار وعين الشارينغان الحادة.', 
      en: 'Blazing speed, deadly piercing Chidori, and devastating Fire Style jutsu.' 
    },
    quote: { 
      ar: 'لقد أغلقت عيني منذ زمن طويل... هدفي الوحيد هو القوة.', 
      en: 'My eyes have been open to darkness for a long time.' 
    },
    themeColor: '#2563eb',
    secondaryColor: '#9333ea',
    chakraColor: '#60a5fa',
    maxHealth: 920,
    maxChakra: 100,
    speed: 6.2,
    attackPower: 38,
    defense: 20,
    jutsu1: {
      id: 'chidori',
      name: { ar: 'تشيدوري (نصل الألف طائر)', en: 'Chidori' },
      chakraCost: 35,
      damage: 155,
      cooldown: 80,
      description: { ar: 'اندفاع صاعق كالبرق يخترق دروع الخصم بضربة قاضية.', en: 'Piercing lightning blade dash that strikes with lethal speed.' },
      icon: '⚡'
    },
    jutsu2: {
      id: 'fireball',
      name: { ar: 'كرة النار العظيمة', en: 'Fireball Jutsu' },
      chakraCost: 30,
      damage: 110,
      cooldown: 90,
      description: { ar: 'إطلاق كرة نارية عملاقة تحرق كل ما يعترض طريقها.', en: 'Exhales a massive flaming orb across the battlefield.' },
      icon: '🔥'
    },
    ultimate: {
      id: 'kirin',
      name: { ar: 'كيرين الصاعق الأسطوري', en: 'Kirin Lightning Beast' },
      chakraCost: 100,
      damage: 340,
      cooldown: 200,
      description: { ar: 'استدعاء صاعقة رعدية عملاقة من الغيوم تمحق الخصم بلمح البصر.', en: 'Calls down heavenly lightning in the shape of a colossal mythical beast.' },
      icon: '⛈️'
    }
  },
  kakashi: {
    id: 'kakashi',
    name: { ar: 'كاكاشي هاتاكي', en: 'Kakashi Hatake' },
    title: { ar: 'النينجا الناسخ والمعلم السادس', en: 'The Copy Ninja' },
    village: { ar: 'قرية كونوها', en: 'Leaf Village' },
    description: { 
      ar: 'يمتلك ترسانة تكتيكية متوازنة بين الدفاع الهجومي وتقنيات الشارينغان والبرق.', 
      en: 'Tactical genius mastering Raikiri lightning and impenetrable Earth Walls.' 
    },
    quote: { 
      ar: 'في عالم الشينوبي، من يخالف القواعد حثالة، لكن من يتخلى عن رفاقه أسوأ من الحثالة!', 
      en: 'Those who break rules are scum, but those who abandon friends are worse.' 
    },
    themeColor: '#475569',
    secondaryColor: '#16a34a',
    chakraColor: '#c084fc',
    maxHealth: 950,
    maxChakra: 100,
    speed: 5.7,
    attackPower: 34,
    defense: 28,
    jutsu1: {
      id: 'raikiri',
      name: { ar: 'رايكيري (قاطع الصواعق)', en: 'Lightning Blade Raikiri' },
      chakraCost: 35,
      damage: 145,
      cooldown: 85,
      description: { ar: 'طعنة برقية حاسمة تخترق خطوط الخصم بتركيز فائق.', en: 'Concentrated lightning blade thrust with surgical precision.' },
      icon: '🗡️'
    },
    jutsu2: {
      id: 'earth_wall',
      name: { ar: 'جدار الأرض الحجري', en: 'Earth Style: Mud Wall' },
      chakraCost: 30,
      damage: 85,
      cooldown: 110,
      description: { ar: 'رفع جدار صخري صلب يصد المقذوفات ويصدم المهاجمين.', en: 'Erects an earthen barricade that stops attacks and harms rushers.' },
      icon: '🧱'
    },
    ultimate: {
      id: 'kamui',
      name: { ar: 'كاموي: البعد الزمكاني', en: 'Kamui Spacetime Rift' },
      chakraCost: 100,
      damage: 310,
      cooldown: 200,
      description: { ar: 'فتح دوامة بصرية تشوه الزمكان وتمزق نقطة الهدف.', en: 'Opens a terrifying spatial rift that shreds whatever enters it.' },
      icon: '👁️'
    }
  },
  itachi: {
    id: 'itachi',
    name: { ar: 'إيتاتشي أوتشيها', en: 'Itachi Uchiha' },
    title: { ar: 'عبقري الأكاتسكي والظل الصامت', en: 'Genius of the Akatsuki' },
    village: { ar: 'منظمة الأكاتسكي / كونوها', en: 'Akatsuki / Leaf' },
    description: { 
      ar: 'سيد الغينجتسو، نيران الأماتيراسو السوداء التي لا تنطفئ، والغربان المضللة.', 
      en: 'Master of dark illusions, teleporting crows, and inextinguishable Amaterasu flames.' 
    },
    quote: { 
      ar: 'الناس يعيشون حياتهم مقيدين بما يقبلونه كحقيقة... لكن الحقيقة مجرد وهم.', 
      en: 'People live their lives bound by what they accept as reality.' 
    },
    themeColor: '#b91c1c',
    secondaryColor: '#1e293b',
    chakraColor: '#f43f5e',
    maxHealth: 900,
    maxChakra: 100,
    speed: 5.8,
    attackPower: 39,
    defense: 22,
    jutsu1: {
      id: 'amaterasu',
      name: { ar: 'أماتيراسو (اللهب الأسود)', en: 'Amaterasu Black Flames' },
      chakraCost: 45,
      damage: 160,
      cooldown: 100,
      description: { ar: 'إشعال نيران سوداء تلتهم دفاعات الخصم وتستمر بالحرق.', en: 'Ignites inextinguishable black flames on the target.' },
      icon: '🖤'
    },
    jutsu2: {
      id: 'crow_clone',
      name: { ar: 'نسخة الغربان المضللة', en: 'Crow Mirage Genjutsu' },
      chakraCost: 25,
      damage: 75,
      cooldown: 90,
      description: { ar: 'التلاشي في سرب غربان والظهور المباغت خلف الخصم مباشرة.', en: 'Dissolves into a swarm of black crows and warps behind the enemy.' },
      icon: '🦅'
    },
    ultimate: {
      id: 'tsukuyomi',
      name: { ar: 'تسوكيومي والقمر الدامي', en: 'Tsukuyomi Red Moon' },
      chakraCost: 100,
      damage: 350,
      cooldown: 200,
      description: { ar: 'إيقاع الخصم في كابوس الوهم المطلق تحت القمر الأحمر.', en: 'Traps the opponent in a psychological torment under a crimson moon.' },
      icon: '🌑'
    }
  },
  gaara: {
    id: 'gaara',
    name: { ar: 'غارا (كازيكاجي الرمال)', en: 'Gaara of the Sand' },
    title: { ar: 'شينوبي قرية الرمال وكازيكاجي الخامس', en: 'Fifth Kazekage' },
    village: { ar: 'قرية الرمال (سونا)', en: 'Sand Village' },
    description: { 
      ar: 'تحكم مطلق بالرمال، درع دفاعي تلقائي وموجات رملية ساحقة بعيدة المدى.', 
      en: 'Absolute control over desert sand, automatic shield, and wide area suppression.' 
    },
    quote: { 
      ar: 'سأقاتل من أجل قريتي وأصدقائي، هذا هو معنى وجودي الآن.', 
      en: 'I fight for my village and the bonds I forged.' 
    },
    themeColor: '#d97706',
    secondaryColor: '#78350f',
    chakraColor: '#fbbf24',
    maxHealth: 1050,
    maxChakra: 100,
    speed: 4.8,
    attackPower: 33,
    defense: 35,
    jutsu1: {
      id: 'sand_tsunami',
      name: { ar: 'تسونامي الرمال الهادر', en: 'Sand Tsunami' },
      chakraCost: 40,
      damage: 135,
      cooldown: 95,
      description: { ar: 'إطلاق موجة رمال جارفة تدفع الخصم وتسحقه أرضاً.', en: 'Sends a crushing tidal wave of heavy desert sand forward.' },
      icon: '⏳'
    },
    jutsu2: {
      id: 'sand_shield',
      name: { ar: 'درع الرمال الدفاعي', en: 'Absolute Sand Shield' },
      chakraCost: 30,
      damage: 60,
      cooldown: 105,
      description: { ar: 'تطويق الجسد بدرع رملي منيع يمتص الضربات ويطلق مقذوفاً رملياً.', en: 'Creates a dome of dense sand that negates damage and fires a sand spike.' },
      icon: '🛡️'
    },
    ultimate: {
      id: 'sand_burial',
      name: { ar: 'جنازة الرمال الإمبراطورية', en: 'Grand Sand Imperial Burial' },
      chakraCost: 100,
      damage: 330,
      cooldown: 200,
      description: { ar: 'دفن الحلبة بأكملها بالرمال وضغطها بقوة هائلة تهز الأرض.', en: 'Entombs the target in a colossal pyramid of sand and crushes it.' },
      icon: '🌪️'
    }
  }
};

export const CHARACTER_LIST = Object.values(CHARACTERS);
