import ArticlesSection from '../components/ArticlesSection';
import ReelsSection from '../components/ReelsSection';

const SocialPage = () => {
  return (
    <main className="max-w-[1200px] mx-auto px-5">
      <ReelsSection category="social" />
      <ArticlesSection />
    </main>
  );
};

export default SocialPage;