import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { IframePage } from '@/components/IframePage';
import { GuidesCatalog } from '@/components/GuidesCatalog';
import { AmbientPlayer } from '@/components/AmbientPlayer';
import { PremiumGate } from '@/components/PremiumGate';
import { Seo } from '@/components/Seo';
import { useTranslation } from 'react-i18next';

export const Shrines = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Seo title="Ziyoratgohlar — ZIYORAT UZ" description="Oʻzbekistondagi ziyorat turizm obyektlari reestri va muqaddas joylar boʻyicha to‘liq qoʻllanma." path="/ziyoratgohlar" />
      <Navbar />
      <IframePage
        title={t('sections.shrines.title')}
        description={t('sections.shrines.desc')}
        url="https://uzbekistan.travel/uz/c/ziyorat-turizm-obyektlari-reestri/"
      />
      <Footer />
    </div>
  );
};

export const Guides = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Seo title="Gidlar — ZIYORAT UZ" description="Oʻzbekistonning eng yaxshi gidlari katalogi: koʻp tilli mutaxassis yoʻlboshchilar." path="/gidlar" />
      <Navbar />
      <GuidesCatalog
        title={t('sections.guides.title')}
        description={t('sections.guides.desc')}
      />
      <Footer />
    </div>
  );
};

// Sketchfab — VERIFIED real public 3D models
const UZ_GROUP = "O'zbekiston obidalari";
const WORLD_GROUP = "Dunyo bo'ylab 3D sayohat";

const embed = (id: string) =>
  `https://sketchfab.com/models/${id}/embed?autostart=1&ui_theme=dark&ui_infos=0`;

const TOUR_3D_GALLERY = [
  // O'zbekiston — mavjudlar
  { id: 'af54f5280eb249beb6501eab4769c351', title: 'Registon majmuasi — Samarqand', embed: embed('af54f5280eb249beb6501eab4769c351'), group: UZ_GROUP },
  { id: '6a828d5314994cc28e8e14e4b0ede08e', title: 'Registon (dron) — Samarqand', embed: embed('6a828d5314994cc28e8e14e4b0ede08e'), group: UZ_GROUP },
  { id: 'c830abac7e854e22b51b13b807f0c912', title: 'Bibi-Xonim masjidi — Samarqand', embed: embed('c830abac7e854e22b51b13b807f0c912'), group: UZ_GROUP },
  { id: '8d4d556b0cd14dd693acecaf1105e483', title: 'Bibi-Xonim — Bosh portal', embed: embed('8d4d556b0cd14dd693acecaf1105e483'), group: UZ_GROUP },
  { id: 'fd795227e0bc4f61bc1e4e453d29a74b', title: 'Goʻri Amir maqbarasi — Samarqand', embed: embed('fd795227e0bc4f61bc1e4e453d29a74b'), group: UZ_GROUP },
  { id: '72e06d47f29c4166b394d4066c764823', title: 'Goʻri Amir — ichki ko‘rinish', embed: embed('72e06d47f29c4166b394d4066c764823'), group: UZ_GROUP },
  { id: '2daff8e52b48409da56e43151e4aead1', title: 'Samarqand Registon (alt)', embed: embed('2daff8e52b48409da56e43151e4aead1'), group: UZ_GROUP },
  // O'zbekiston — yangi qo'shildi
  { id: '48e9814f0c9e48ad8355135712becda9', title: 'Abdulazizxon madrasasi — Buxoro (peshtoq)', embed: embed('48e9814f0c9e48ad8355135712becda9'), group: UZ_GROUP },
  { id: '4310bb0a1f4249e1832afa202f80cc2e', title: 'Tilla-Kori — Ibodat zali', embed: embed('4310bb0a1f4249e1832afa202f80cc2e'), group: UZ_GROUP },
  { id: '7bed064cd1a946d5aaac1a5cb5adceaa', title: 'Amir Temur taxti haykali — Samarqand', embed: embed('7bed064cd1a946d5aaac1a5cb5adceaa'), group: UZ_GROUP },
  { id: 'bec57b6b281645d6bb597823a5434878', title: 'Amir Temur haykali — Toshkent', embed: embed('bec57b6b281645d6bb597823a5434878'), group: UZ_GROUP },
  { id: '8f40778113c241d382f83397b3d08826', title: 'Bibi-Xonim — O‘ng gumbaz', embed: embed('8f40778113c241d382f83397b3d08826'), group: UZ_GROUP },
  { id: 'd49febdc03a7490eb3f3a9906239df21', title: 'Amir Temur dafn xonasi — Samarqand', embed: embed('d49febdc03a7490eb3f3a9906239df21'), group: UZ_GROUP },
  { id: '9cd52aa5c2914733ac748a80873e037f', title: 'Toshkent TV minorasi', embed: embed('9cd52aa5c2914733ac748a80873e037f'), group: UZ_GROUP },
  { id: '78a6da3a1c934fafa0c4aa01b69806b3', title: 'Paxtakor metro bekati', embed: embed('78a6da3a1c934fafa0c4aa01b69806b3'), group: UZ_GROUP },
  { id: '0717ad31ae4b48cfb54ed11f12c5b2f2', title: 'Hazrati Imom majmuasi — Shahrisabz', embed: embed('0717ad31ae4b48cfb54ed11f12c5b2f2'), group: UZ_GROUP },
  // Dunyo bo'ylab
  { id: 'f5df073e159044bfa9ce005e841c9607', title: 'Eyfel minorasi — Fransiya', embed: embed('f5df073e159044bfa9ce005e841c9607'), group: WORLD_GROUP },
  { id: '4b665cd0a74e4daa8ba5bbf032085149', title: 'Eyfel minorasi (alt)', embed: embed('4b665cd0a74e4daa8ba5bbf032085149'), group: WORLD_GROUP },
  { id: '297b9caec4e94b02b210eeeafffbd790', title: 'La Tour Eiffel — Parij', embed: embed('297b9caec4e94b02b210eeeafffbd790'), group: WORLD_GROUP },
  { id: 'c461ed8724424ad99500fd058a0ab082', title: 'Ozodlik haykali — AQSh', embed: embed('c461ed8724424ad99500fd058a0ab082'), group: WORLD_GROUP },
  { id: 'feb992251d3540da8a6e5233a9c6fe9a', title: 'Luvr muzeyi — Parij', embed: embed('feb992251d3540da8a6e5233a9c6fe9a'), group: WORLD_GROUP },
  { id: 'd7fe8b4432dc445b93702ffd119949e1', title: 'Mona Liza — Luvr', embed: embed('d7fe8b4432dc445b93702ffd119949e1'), group: WORLD_GROUP },
  { id: '4d9a5b0eb5534ba3b88342e79b50cccd', title: 'Pula Rim amfiteatri', embed: embed('4d9a5b0eb5534ba3b88342e79b50cccd'), group: WORLD_GROUP },
  { id: '4a251113722f4d969b6cf2ca5f35c502', title: 'Giza katta piramidasi — Misr', embed: embed('4a251113722f4d969b6cf2ca5f35c502'), group: WORLD_GROUP },
  { id: 'c8dcba37917a4dcf823cb5a8d60b5149', title: 'Mastaba of Ti — Saqqara', embed: embed('c8dcba37917a4dcf823cb5a8d60b5149'), group: WORLD_GROUP },
  { id: 'bf46a8a24521494ea6dadb9b91d10cf3', title: 'Hatshepsut Sfenksi', embed: embed('bf46a8a24521494ea6dadb9b91d10cf3'), group: WORLD_GROUP },
  { id: 'f5f69f1d7e764eecb2dafd948d6b9fde', title: 'Taj Mahal — 360° Odyssey', embed: embed('f5f69f1d7e764eecb2dafd948d6b9fde'), group: WORLD_GROUP },
  { id: '003544c899484e07a6e2b399a437ad8e', title: 'Taj Mahal — 360° Majesty', embed: embed('003544c899484e07a6e2b399a437ad8e'), group: WORLD_GROUP },
  { id: 'f2bf614c5aac4789a30b5c26d24e29d1', title: 'Taj Mahal — Panorama Journey', embed: embed('f2bf614c5aac4789a30b5c26d24e29d1'), group: WORLD_GROUP },
];

export const Tour3D = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Seo title="3D Sayohat — ZIYORAT UZ" description="Oʻzbekiston obidalarini 3D formatda virtual sayohat: Registon, Bibi-Xonim, Goʻri Amir." path="/3d-sayohat" />
      <Navbar />
      <PremiumGate featureName="3D Sayohat">
        <div className="container pt-8">
          <AmbientPlayer />
        </div>
        <IframePage
          title={t('sections.tour3d.title')}
          description={t('sections.tour3d.desc')}
          url="https://sketchfab.com/search?q=uzbekistan&type=models"
          gallery={TOUR_3D_GALLERY}
        />
      </PremiumGate>
      <Footer />
    </div>
  );
};
