import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage   from './ErrorMessage';

const routeCategoryMap = {
  '/': '', '/tech': 'tech', '/horizons': 'horizons', '/social': 'social', '/podcast': 'podcast',
};

const tagColors = {
  tech: 'bg-[#4469F2] text-white', horizons: 'bg-[#F7E328] text-black',
  social: 'bg-[#E20E3C] text-white', podcast: 'bg-[#CCF47F] text-black', home: 'bg-white/10 text-white',
};

const typeIcons = { video: 'fa-play', images: 'fa-image', article: 'fa-file-lines' };

const MediaGrid = ({ categoryColor = 'lime' }) => {
  const { t, dir, language } = useLanguage();
  const location = useLocation();
  const [page, setPage] = useState(1);

  const category = routeCategoryMap[location.pathname] ?? '';
  const { data, loading, error } = useFetch(
  () => api.getArticles(category, 1, language, 6), // ✅ limit = 6
  [category, language]
);

  const buttonColors = {
    lime: 'bg-[#CCF47F] text-[#161616]', blue: 'bg-[#4469F2] text-white',
    yellow: 'bg-[#F7E328] text-black',   red: 'bg-[#E20E3C] text-white',
    phosphor: 'bg-[#CCF47F] text-black',
  };

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage />;

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.articles?.map(card => (
          <Link to={`/article/${card._id}`} key={card._id}
            className="bg-[#1e1e1e] rounded-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-[#2a2a2a] cursor-pointer group block">
            <div className="h-48 bg-cover bg-center relative p-4 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundImage: `url('${card.thumbnail}')` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
              <div className={`relative z-10 flex items-start justify-between ${dir === 'ltr' ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                  <i className={`fa-solid ${typeIcons[card.type] || 'fa-file-lines'}`} />
                  {t.mediaCards[card.type] || card.type}
                </span> */}
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${tagColors[card.category] || tagColors.home}`}>
                  {card.category == "documentary" ? t.categories[card.category] : t.categories[card.category]}
                </span>
              </div>
            </div>
            <div className={`p-4 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>
              <h3 className="font-bold text-lg text-[#FCF2ED] leading-tight" style={{ fontFamily: 'Lyon, serif' }}>
                {card.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {data?.total > 6 && (
  <div className="flex justify-center mt-8">
    <Link
      to={`/articles${category ? `?category=${category}` : ''}`}
      className={`group px-8 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${buttonColors[categoryColor] || buttonColors.lime}`}
    >
      {dir === 'rtl' ? 'عرض كل المقالات' : 'View All Articles'}
      <i className={`fa-solid fa-arrow-${dir === 'rtl' ? 'left' : 'right'} transition-transform group-hover:translate-x-1`} />
    </Link>
  </div>
)}
    </section>
  );
};

export default MediaGrid;