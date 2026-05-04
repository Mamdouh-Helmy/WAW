import ArticlesSection from '../components/ArticlesSection';
import ReelsSection from '../components/ReelsSection';
import MahsobaSection from '../components/MahsobaSection';

const HorizonsPage = () => {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <ReelsSection category="cultural" />
      <MahsobaSection />
      <ArticlesSection />
    </main>
  );
};

export default HorizonsPage;