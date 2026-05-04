import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const tagColors = {
  tech: 'bg-[#4469F2] text-white', horizons: 'bg-[#F7E328] text-black',
  social: 'bg-[#E20E3C] text-white', podcast: 'bg-[#CCF47F] text-black',
  home: 'bg-[#CCF47F] text-black',
};

const typeIcons = { video: 'fa-play', images: 'fa-image', article: 'fa-file-lines' };

const AllArticlesPage = () => {
  const { t, dir, language } = useLanguage();
  const location = useLocation();
  const category = new URLSearchParams(location.search).get('category') || '';
  const [page, setPage] = useState(1);

  const { data, loading, error } = useFetch(
    () => api.getArticles(category, page, language),
    [category, page, language]
  );

  const articles = data?.articles || [];
  const totalPages = data?.pages || 1;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-10" dir={dir}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-[#898989] hover:text-[#FCF2ED] transition-colors text-sm"
          style={{ flexDirection: dir === 'rtl' ? 'row-reverse' : 'row' }}
        >
          <i className={`fa-solid fa-chevron-${dir === 'rtl' ? 'right' : 'left'} text-xs`} />
          {dir === 'rtl' ? 'رجوع' : 'Back'}
        </Link>
        <h1 className="font-black text-3xl text-[#FCF2ED]" style={{ fontFamily: 'Lyon, serif' }}>
          {dir === 'rtl' ? 'كل المقالات' : 'All Articles'}
        </h1>
      </div>

      {/* Grid */}
      {!articles.length ? (
        <div className="text-center py-20 text-[#898989]">
          <i className="fa-solid fa-newspaper text-4xl mb-4 block opacity-30" />
          <p>{dir === 'rtl' ? 'لا توجد مقالات' : 'No articles found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(card => (
            <Link
              to={`/article/${card._id}`}
              key={card._id}
              className="bg-[#1e1e1e] rounded-xl overflow-hidden hover:-translate-y-1 hover:bg-[#2a2a2a] transition-all duration-300 group block"
            >
              <div
                className="h-48 bg-cover bg-center relative p-4 transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url('${card.thumbnail}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                <div className={`relative z-10 flex items-start justify-between ${dir === 'ltr' ? 'flex-row' : 'flex-row-reverse'}`}>
                  
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${tagColors[card.category] || tagColors.home}`}>
                    {t.categories[card.category]}
                  </span> 
                </div>
              </div>
              <div className={`p-4 ${dir === 'ltr' ? 'text-left' : 'text-right'}`}>
                <h3 className="font-bold text-lg text-[#FCF2ED] leading-tight" style={{ fontFamily: 'Lyon, serif' }}>
                  {card.title}
                </h3>
                {card.publishedAt && (
                  <p className="text-[#898989] text-xs mt-2">
                    <i className="fa-solid fa-clock mr-1" />
                    {new Date(card.publishedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors text-[#FCF2ED] text-sm"
          >
            <i className={`fa-solid fa-chevron-${dir === 'rtl' ? 'left' : 'right'}`} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-full text-sm transition-colors ${page === i + 1 ? 'bg-[#CCF47F] text-[#161616] font-bold' : 'bg-white/10 hover:bg-white/20 text-[#FCF2ED]'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors text-[#FCF2ED] text-sm"
          >
            <i className={`fa-solid fa-chevron-${dir === 'rtl' ? 'right' : 'left'}`} />
          </button>
        </div>
      )}
    </main>
  );
};

export default AllArticlesPage;