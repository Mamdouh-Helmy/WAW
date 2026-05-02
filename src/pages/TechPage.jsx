import HeroSlider from '../components/HeroSlider';
import MediaGrid from '../components/MediaGrid';
import PodcastsSection from '../components/PodcastsSection';
import ArticlesSection from '../components/ArticlesSection';
import MostReadSection from '../components/MostReadSection';
import { useLanguage } from '../context/LanguageContext';
import ReelsSection from '../components/ReelsSection';
import DocumentarySection from '../components/DocumentarySection';

const TechPage = () => {
  const { t } = useLanguage();

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
       <MostReadSection />
      <HeroSlider />
       <ReelsSection />

      {/* ── أفلام تسجيلية ── جديد ──────────────────────────────── */}
      <DocumentarySection />
     
      <PodcastsSection />

      {/* Category Header */}
      <div className="flex flex-col items-start mb-6">
        <h2 className="font-extrabold text-2xl text-[#FCF2ED]" style={{ fontFamily: 'Lyon, serif' }}>
          {t.categories.tech}
        </h2>
        <div className="h-1 w-16 bg-[#4469F2] rounded mt-1"></div>
      </div>

      <MediaGrid categoryColor="blue" />
     
      <ArticlesSection />
      
    </main>
  );
};

export default TechPage;
