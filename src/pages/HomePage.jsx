import HeroVideo from '../components/HeroVideo';
import MediaGrid from '../components/MediaGrid';
import PodcastsSection from '../components/PodcastsSection';
import ArticlesSection from '../components/ArticlesSection';
import MostReadSection from '../components/MostReadSection';
import ReelsSection from '../components/ReelsSection';
import MahsobaSection from '../components/MahsobaSection';
import DocumentarySection from '../components/DocumentarySection';   // ← جديد
import { useLanguage } from '../context/LanguageContext';

const HomePage = () => {
  const { t } = useLanguage();

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* <MostReadSection /> */}
      <HeroVideo />
      <ReelsSection />

      {/* ── أفلام تسجيلية ── جديد ──────────────────────────────── */}
      <DocumentarySection />

      <PodcastsSection />

      <MahsobaSection />

      {/* <div className="flex flex-col items-start mb-6">
        <h2
          className="font-extrabold text-xl sm:text-2xl text-[#FCF2ED]"
          style={{ fontFamily: 'Lyon, serif' }}
        >
          {t.categories.home}
        </h2>
        <div className="h-1 w-16 bg-[#CCF47F] rounded mt-1" />

      </div> */}


      {/* <MediaGrid categoryColor="lime" /> */}

      <ArticlesSection />

    </main>
  );
};

export default HomePage;