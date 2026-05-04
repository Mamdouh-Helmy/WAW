import ArticlesSection from '../components/ArticlesSection';
import ReelsSection from '../components/ReelsSection';

const TechPage = () => {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <ReelsSection category="technology" />
      <ArticlesSection />
    </main>
  );
};

export default TechPage;