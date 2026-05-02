import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

// ── helpers ──────────────────────────────────────────────────────────────────

const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
};

const getThumb = (a) => a.thumbnail || getYouTubeThumbnail(a.youtubeUrl) || '/placeholder.jpg';

// ── Badge ─────────────────────────────────────────────────────────────────────

const Badge = ({ type, lang }) => {
  const label =
    type === 'feature'
      ? lang === 'ar' ? 'فيتشر' : 'Feature'
      : lang === 'ar' ? 'وثائقي' : 'Documentary';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-bold text-[#161616]"
      style={{ background: '#CCF47F' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#161616] inline-block" />
      {label}
    </span>
  );
};

// ── Hero Panel ────────────────────────────────────────────────────────────────

const HeroPanel = ({ article, lang }) => {
  if (!article) return null;
  const thumb = getThumb(article);
  const hasVideo = !!(article.youtubeUrl || article.type === 'video');

  return (
    <Link
      to={`/article/${article._id}`}
      className="relative flex-1 overflow-hidden group cursor-pointer"
      style={{ minHeight: 380, borderRadius: 8 }}
    >
      <img
        src={thumb}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            lang === 'ar'
              ? 'linear-gradient(to right, rgba(18,18,18,0.9) 0%, rgba(18,18,18,0.5) 60%, rgba(18,18,18,0.1) 100%)'
              : 'linear-gradient(to left, rgba(18,18,18,0.9) 0%, rgba(18,18,18,0.5) 60%, rgba(18,18,18,0.1) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '60%',
          background: 'linear-gradient(to top, rgba(18,18,18,0.98) 0%, transparent 100%)',
        }}
      />

      {hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ background: 'rgba(22,22,22,0.7)', border: '2px solid rgba(255,255,255,0.25)' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <polygon points="6,2 19,11 6,20" fill="#FCF2ED" />
            </svg>
          </div>
        </div>
      )}

      <div
        className="absolute bottom-0 p-6 flex flex-col gap-2"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        style={{ left: 0, right: 0 }}
      >
        {article.showName && (
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: '#F7E328', fontFamily: 'Ko Sans, Inter, sans-serif' }}
          >
            {article.showName}
          </span>
        )}
        <h2
          className="font-extrabold leading-tight"
          style={{
            fontFamily: 'Lyon, serif',
            color: '#F7E328',
            fontSize: 'clamp(20px, 3vw, 32px)',
            textShadow: '0 2px 12px rgba(0,0,0,0.8)',
          }}
        >
          {article.title}
        </h2>
        {article.excerpt && (
          <p
            className="text-xs leading-relaxed line-clamp-2 max-w-xl"
            style={{ color: '#898989', fontFamily: 'Ko Sans, Inter, sans-serif' }}
          >
            {article.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
};

// ── Sidebar Item ──────────────────────────────────────────────────────────────

const SidebarItem = ({ article, lang, isActive, onClick }) => {
  const thumb = getThumb(article);
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full transition-colors duration-200"
      style={{
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
        borderRight: isActive ? '3px solid #E20E3C' : '3px solid transparent',
        cursor: 'pointer',
        textAlign: lang === 'ar' ? 'right' : 'left',
      }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex-shrink-0 relative overflow-hidden" style={{ width: 72, height: 48, borderRadius: 4 }}>
        <img src={thumb} alt={article.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {article.showName && (
          <span className="text-xs font-bold" style={{ color: '#F7E328', fontFamily: 'Ko Sans, Inter, sans-serif' }}>
            {article.showName}
          </span>
        )}
        <span
          className="text-xs font-bold leading-snug line-clamp-2"
          style={{ color: isActive ? '#FCF2ED' : '#898989', fontFamily: 'Lyon, serif' }}
        >
          {article.title}
        </span>
        {article.episodeCount && (
          <span className="text-xs" style={{ color: '#5EEAD4', fontFamily: 'Ko Sans, Inter, sans-serif' }}>
            {article.episodeCount} {lang === 'ar' ? 'حلقة' : 'eps'}
          </span>
        )}
      </div>
    </button>
  );
};

// ── Grid Card ─────────────────────────────────────────────────────────────────

const Card = ({ article, lang }) => {
  const thumb = getThumb(article);
  const hasVideo = !!(article.youtubeUrl || article.type === 'video');

  return (
    <Link
      to={`/article/${article._id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg transition-transform duration-300 hover:-translate-y-1"
      style={{ background: '#1e1e1e' }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={thumb}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-300"
          style={{ background: '#CCF47F' }}
        />
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(22,22,22,0.65)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <polygon points="4,2 14,8 4,14" fill="#FCF2ED" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#1e1e1e] to-transparent" />
      </div>

      <div className="flex flex-col gap-2 p-3">
        <Badge type={article.documentaryType || 'documentary'} lang={lang} />
        <h3
          className="text-[#FCF2ED] text-sm font-bold leading-snug line-clamp-2 group-hover:text-[#CCF47F] transition-colors duration-200"
          style={{ fontFamily: 'Lyon, serif' }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {article.title}
        </h3>
        {article.author && (
          <p className="text-xs" style={{ color: '#CCF47F99' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {article.author}
          </p>
        )}
      </div>

      <div
        className="h-0.5 w-0 group-hover:w-full transition-all duration-500 mt-auto"
        style={{ background: '#CCF47F' }}
      />
    </Link>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const DocumentaryPage = () => {
  const { lang } = useLanguage();

  // hero section state (top 8 articles)
  const [heroArticles, setHeroArticles] = useState([]);
  const [selected, setSelected] = useState(0);
  const [heroLoading, setHeroLoading] = useState(true);
  const intervalRef = useRef(null);

  // grid state
  const [articles, setArticles] = useState([]);
  const [gridLoading, setGridLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // load hero articles (first 8, no pagination)
  useEffect(() => {
    const load = async () => {
      try {
        setHeroLoading(true);
        const res = await api.getArticles('documentary', 1, lang, 8);
        setHeroArticles(res.articles || []);
        setSelected(0);
      } catch {
        setHeroArticles([]);
      } finally {
        setHeroLoading(false);
      }
    };
    load();
  }, [lang]);

  // load grid articles (paginated)
  useEffect(() => {
    const load = async () => {
      try {
        setGridLoading(true);
        const res = await api.getArticles('documentary', page, lang, 12);
        setArticles(res.articles || []);
        setPages(res.pages || 1);
      } catch {
        setArticles([]);
      } finally {
        setGridLoading(false);
      }
    };
    load();
  }, [lang, page]);

  // auto-rotate hero selection
  useEffect(() => {
    if (heroArticles.length < 2) return;
    intervalRef.current = setInterval(() => {
      setSelected((prev) => (prev + 1) % heroArticles.length);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [heroArticles]);

  const handleSelect = (i) => {
    setSelected(i);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSelected((prev) => (prev + 1) % heroArticles.length);
    }, 6000);
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Page header ── */}
      <div className="flex flex-col items-start mb-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2">
          <h1
            className="font-extrabold text-2xl sm:text-3xl text-[#FCF2ED]"
            style={{ fontFamily: 'Lyon, serif' }}
          >
            {lang === 'ar' ? 'أفلام تسجيلية' : 'Documentaries'}
          </h1>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-sm"
            style={{ background: '#CCF47F20', color: '#CCF47F', border: '1px solid #CCF47F40' }}
          >
            {lang === 'ar' ? 'وثائقي' : 'Docs'}
          </span>
        </div>
        <div className="h-1 w-16 rounded mt-1" style={{ background: '#CCF47F' }} />
      </div>

      {/* ── Hero + Sidebar ── */}
      {heroLoading ? (
        <div
          className="flex rounded-lg overflow-hidden mb-10"
          style={{ height: 380, background: '#1e1e1e' }}
        >
          <div className="flex-1 animate-pulse" style={{ background: '#2a2a2a' }} />
          <div className="w-56 flex-shrink-0">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 border-b border-white/5 animate-pulse" style={{ background: '#1a1a1a' }} />
            ))}
          </div>
        </div>
      ) : heroArticles.length > 0 ? (
        <div
          className="flex rounded-lg overflow-hidden mb-10"
          style={{ height: 380, background: '#121212' }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Hero */}
          <HeroPanel article={heroArticles[selected]} lang={lang} />

          {/* Sidebar */}
          <div
            className="flex-shrink-0 flex flex-col overflow-y-auto"
            style={{
              width: 230,
              background: '#0e0e0e',
              borderLeft: lang === 'ar' ? 'none' : '1px solid rgba(255,255,255,0.06)',
              borderRight: lang === 'ar' ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            {heroArticles.map((article, i) => (
              <SidebarItem
                key={article._id}
                article={article}
                lang={lang}
                isActive={i === selected}
                onClick={() => handleSelect(i)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* ── All Articles Grid ── */}
      <div className="flex flex-col items-start mb-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <h2
          className="font-extrabold text-lg sm:text-xl text-[#FCF2ED]"
          style={{ fontFamily: 'Lyon, serif' }}
        >
          {lang === 'ar' ? 'جميع الأفلام' : 'All Documentaries'}
        </h2>
        <div className="h-0.5 w-12 rounded mt-1" style={{ background: '#CCF47F' }} />
      </div>

      {gridLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg animate-pulse" style={{ background: '#1e1e1e', aspectRatio: '16/9' }} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p
          className="text-center py-16"
          style={{ color: 'rgba(252,242,237,0.4)' }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {lang === 'ar' ? 'لا يوجد محتوى بعد' : 'No content yet'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <Card key={a._id} article={a} lang={lang} />
            ))}
          </div>

          {/* pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className="w-8 h-8 rounded-sm text-sm font-bold transition-colors"
                  style={{
                    background: page === i + 1 ? '#CCF47F' : '#1e1e1e',
                    color: page === i + 1 ? '#161616' : '#CCF47F',
                    border: '1px solid rgba(204,244,127,0.3)',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default DocumentaryPage;