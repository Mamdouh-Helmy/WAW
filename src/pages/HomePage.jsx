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
      <DocumentarySection />
      <PodcastsSection />
      <MahsobaSection />
      <ArticlesSection />

    </main>
  );
};

export default HomePage;