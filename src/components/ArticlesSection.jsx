import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const ROUTE_CATEGORY = {
  '/': '',
  '/tech': 'tech',
  '/horizons': 'horizons',
  '/social': 'social',
  '/podcast': 'podcast',
};

const TAG_COLORS = {
  tech: 'bg-[#4469F2] text-white',
  horizons: 'bg-[#F7E328] text-black',
  social: 'bg-[#E20E3C] text-white',
  podcast: 'bg-[#CCF47F] text-black',
  default: 'bg-white/10 text-white',
};

const TYPE_ICONS = {
  video: 'fa-play',
  images: 'fa-image',
  article: 'fa-file-lines',
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getVisibleCards = () => {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const ArticlesSection = () => {
  const { t, dir, language } = useLanguage();
  const location = useLocation();

  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(getVisibleCards());
  const [paused, setPaused] = useState(false);

  // ─────────────────────────────────────────────
  // Resize handling
  // ─────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setVisible(getVisibleCards());
      setCurrent(0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─────────────────────────────────────────────
  // Data fetching
  // ─────────────────────────────────────────────
  const category = ROUTE_CATEGORY[location.pathname] ?? '';

  const { data, loading, error } = useFetch(
    () => api.getArticles(category, 1, language),
    [category, language]
  );

  const articles = data?.articles || [];
  const maxIndex = Math.max(0, articles.length - visible);

  // ─────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────
  const next = useCallback(() => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // ─────────────────────────────────────────────
  // Auto slide
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (paused || articles.length <= visible) return;

    const interval = setInterval(next, 3500);
    return () => clearInterval(interval);
  }, [paused, next, articles.length, visible]);

  useEffect(() => setCurrent(0), [category]);

  // ─────────────────────────────────────────────
  // حالات التحميل
  // ─────────────────────────────────────────────
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  if (!articles.length) {
    return (
      <div className="text-center py-16 text-[#898989]">
        <i className="fa-solid fa-newspaper text-4xl mb-4 opacity-30" />
        <p>
          {dir === 'rtl'
            ? 'لا توجد مقالات حالياً'
            : 'No articles available'}
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <section className="mb-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#FCF2ED]">
          {t.articles.title}
        </h2>

        <div className="flex items-center gap-3">
          {articles.length > visible && (
            <div className="flex gap-2">
              <button onClick={prev} className="nav-btn">
                <i className="fa-solid fa-chevron-right" />
              </button>
              <button onClick={next} className="nav-btn">
                <i className="fa-solid fa-chevron-left" />
              </button>
            </div>
          )}

          <Link
            to={`/articles${category ? `?category=${category}` : ''}`}
            className="text-sm text-[#898989] hover:text-white flex items-center gap-1"
          >
            {t.articles.viewAll}
            <i className={`fa-solid fa-chevron-${dir === 'rtl' ? 'left' : 'right'}`} />
          </Link>
        </div>
      </div>

      {/* Slider */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(${dir === 'rtl' ? '' : '-'}${current * (100 / visible)}%)`,
          }}
        >
          {articles.map((card) => (
            <div
              key={card._id}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / visible}%` }}
            >
              <Link
                to={`/article/${card._id}`}
                className="block bg-[#1e1e1e] rounded-md overflow-hidden hover:-translate-y-1 transition"
              >
                {/* Image */}
                <div
                  className="h-40 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${card.thumbnail})` }}
                >
                  <div className="absolute inset-0 bg-black/40" />

                  <div className="absolute top-2 left-2 right-2 flex justify-between text-xs">
                    {/* <span className="bg-black/50 px-2 py-1 rounded flex items-center gap-1">
                      <i className={`fa-solid ${TYPE_ICONS[card.type] || 'fa-file-lines'}`} />
                      {card.type}
                    </span> */}

                    <span className={`px-2 py-1 rounded font-bold ${TAG_COLORS[card.category] || TAG_COLORS.default}`}>
                      {card.category == "documentary" ? t.categories[card.category] : t.categories[card.category]}

                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-[#FCF2ED] font-bold line-clamp-2">
                    {card.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {articles.length > visible && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition ${i === current ? 'w-6 bg-[#CCF47F]' : 'w-2 bg-white/20'
                }`}
            />
          ))}
        </div>
      )}

    </section>
  );
};

export default ArticlesSection;
