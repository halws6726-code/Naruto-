import { ArenaDef } from '../types/game';

// Direct paths to generated images
import leafVillageImg from '../assets/images/leaf_village_arena_1791992440854.jpg';
import valleyOfTheEndImg from '../assets/images/valley_of_the_end_1791992443691.jpg';
import chuninArenaImg from '../assets/images/chunin_arena_1791992443437.jpg';

export const ARENAS: Record<string, ArenaDef> = {
  leaf_village: {
    id: 'leaf_village',
    name: { ar: 'قرية كونوها الخفية (ورق الشجر)', en: 'Hidden Leaf Village' },
    location: { ar: 'أمام صخور وجوه الهوكاغي وشوارع القرية عند الغروب', en: 'Hokage Rock Monument & Main Gate' },
    image: leafVillageImg,
    groundY: 420
  },
  valley_of_the_end: {
    id: 'valley_of_the_end',
    name: { ar: 'وادي النهاية الأسطوري', en: 'Valley of the End' },
    location: { ar: 'بين تمثالي هاشيراما ومادارا والشلال الهادر', en: 'Hashirama vs Madara Statues & Waterfall' },
    image: valleyOfTheEndImg,
    groundY: 420
  },
  chunin_arena: {
    id: 'chunin_arena',
    name: { ar: 'حلبة اختبارات التشونين', en: 'Chunin Exam Stadium' },
    location: { ar: 'الحلبة الدائرية التاريخية المحاطة بالجماهير', en: 'Historic Circular Martial Arts Stadium' },
    image: chuninArenaImg,
    groundY: 420
  }
};

export const ARENA_LIST = Object.values(ARENAS);
