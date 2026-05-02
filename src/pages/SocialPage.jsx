import HeroSlider from '../components/HeroSlider';
import MediaGrid from '../components/MediaGrid';
import PodcastsSection from '../components/PodcastsSection';
import ArticlesSection from '../components/ArticlesSection';
import MostReadSection from '../components/MostReadSection';
import { useLanguage } from '../context/LanguageContext';
import ReelsSection from '../components/ReelsSection';
import DocumentarySection from '../components/DocumentarySection';

const SocialPage = () => {
  const { t } = useLanguage();

  return (
    <main className="max-w-[1200px] mx-auto px-5">
       <MostReadSection />
      <HeroSlider />
       <ReelsSection />

       {/* ── أفلام تسجيلية ── جديد ──────────────────────────────── */}
             <DocumentarySection />
            
             <PodcastsSection />

      {/* Category Header */}
      <div className="flex flex-col items-start mb-6">
        <h2 className="font-extrabold text-2xl text-[#FCF2ED]" style={{ fontFamily: 'Lyon, serif' }}>
          {t.categories.social}
        </h2>
        <div className="h-1 w-16 bg-[#E20E3C] rounded mt-1"></div>
      </div>

      <MediaGrid categoryColor="red" />
     
      <ArticlesSection />
      
    </main>
  );
};

export default SocialPage;
