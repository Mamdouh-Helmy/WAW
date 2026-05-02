import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

const TagResultsSection = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tag = searchParams.get('tag');

  const [articles, setArticles] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => { setPage(1); }, [tag, language]);

  useEffect(() => {
    if (!tag) return;
    setLoading(true);
    api.getArticlesByTag(tag, page, language)
      .then(d => {
        setArticles(d.articles || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [tag, page, language]);

  const isRtl = language === 'ar';

  if (!tag) {
    navigate('/');
    return null;
  }

  return (
    <main
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ minHeight: '80vh', fontFamily: 'Lyon, serif' }}
    >
      {/* ── Hero strip ── */}
      <div
        style={{
          borderBottom: '1px solid rgba(252,242,237,0.06)',
          padding: '40px 0 32px',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5">
          {/* breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#898989', fontSize: '0.78rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#898989', fontFamily: 'Lyon, serif', fontSize: '0.78rem', padding: 0, display: 'flex', alignItems: 'center', gap: '5px' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FCF2ED'}
              onMouseLeave={e => e.currentTarget.style.color = '#898989'}
            >
              {isRtl ? '→' : '←'} {isRtl ? 'رجوع' : 'Back'}
            </button>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>{isRtl ? 'نتائج التاغ' : 'Tag results'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              {/* Tag pill */}
              <span
                style={{
                  background: '#CCF47F',
                  color: '#161616',
                  padding: '7px 22px',
                  borderRadius: '999px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                {tag}
              </span>
              {!loading && (
                <span style={{ color: '#898989', fontSize: '0.875rem' }}>
                  {total.toLocaleString()} {isRtl ? 'مقال' : 'articles'}
                </span>
              )}
            </div>

            {/* Clear */}
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: '1px solid rgba(137,137,137,0.3)',
                borderRadius: '999px',
                color: '#898989',
                fontSize: '0.78rem',
                padding: '5px 16px',
                cursor: 'pointer',
                fontFamily: 'Lyon, serif',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(252,242,237,0.35)'; e.currentTarget.style.color = '#FCF2ED'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(137,137,137,0.3)'; e.currentTarget.style.color = '#898989'; }}
            >
              {isRtl ? '✕  إلغاء الفلتر' : '✕  Clear filter'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Grid area ── */}
      <div className="max-w-[1200px] mx-auto px-5 py-10">
        {loading ? (
          <SkeletonGrid />
        ) : articles.length === 0 ? (
          <EmptyState isRtl={isRtl} tag={tag} />
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '22px',
              }}
            >
              {articles.map(article => (
                <ArticleCard key={article._id} article={article} language={language} activeTag={tag} />
              ))}
            </div>

            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
                {/* Prev */}
                <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  {isRtl ? '→' : '←'}
                </PagBtn>

                {Array.from({ length: pages }).map((_, i) => (
                  <PagBtn key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </PagBtn>
                ))}

                {/* Next */}
                <PagBtn onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                  {isRtl ? '←' : '→'}
                </PagBtn>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes trs-pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </main>
  );
};

/* ── Article Card ────────────────────────────────────────── */
const ArticleCard = ({ article, language, activeTag }) => {
  const isRtl = language === 'ar';

  return (
    <Link to={`/article/${article._id}`} style={{ textDecoration: 'none' }}>
      <article
        style={{
          borderRadius: '14px',
          overflow: 'hidden',
          background: 'rgba(252,242,237,0.03)',
          border: '1px solid rgba(252,242,237,0.07)',
          transition: 'border-color 0.2s, transform 0.22s',
          cursor: 'pointer',
          direction: isRtl ? 'rtl' : 'ltr',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(204,244,127,0.28)';
          e.currentTarget.style.transform = 'translateY(-3px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(252,242,237,0.07)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Thumbnail */}
        <div style={{ height: '200px', overflow: 'hidden', background: '#1c1c1c', position: 'relative', flexShrink: 0 }}>
          {article.thumbnail ? (
            <img
              src={article.thumbnail}
              alt={article.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(252,242,237,0.1)', fontSize: '2.5rem' }}>◈</div>
          )}
          {article.type !== 'article' && (
            <span style={{
              position: 'absolute', top: '12px',
              [isRtl ? 'right' : 'left']: '12px',
              background: 'rgba(22,22,22,0.85)',
              color: '#CCF47F', padding: '4px 11px',
              borderRadius: '999px', fontSize: '0.7rem',
              fontFamily: 'Lyon, serif',
              border: '1px solid rgba(204,244,127,0.25)',
            }}>
              {article.type === 'video' ? '▶ فيديو' : '◉ صور'}
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            color: '#FCF2ED', fontSize: '0.9375rem', fontWeight: 500,
            lineHeight: 1.55, marginBottom: '10px', fontFamily: 'Lyon, serif',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            flex: 1,
          }}>
            {article.title}
          </h3>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
              {article.tags.map((t, i) => (
                <span key={i} style={{
                  fontSize: '0.7rem', padding: '2px 10px', borderRadius: '999px',
                  border: t === activeTag ? '1px solid rgba(204,244,127,0.45)' : '1px solid rgba(137,137,137,0.22)',
                  color: t === activeTag ? '#CCF47F' : '#898989',
                  fontFamily: 'Lyon, serif',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#898989', fontSize: '0.73rem', marginTop: 'auto' }}>
            <span>{article.author || ''}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>◎ {article.views?.toLocaleString()}</span>
              {article.publishedAt && (
                <span>
                  {new Date(article.publishedAt).toLocaleDateString(
                    isRtl ? 'ar-EG' : 'en-US',
                    { month: 'short', day: 'numeric' }
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

/* ── Pagination Button ───────────────────────────────────── */
const PagBtn = ({ children, onClick, active, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      minWidth: '34px', height: '34px',
      borderRadius: '8px', padding: '0 8px',
      border: active ? '1px solid #CCF47F' : '1px solid rgba(252,242,237,0.1)',
      background: active ? '#CCF47F' : 'transparent',
      color: active ? '#161616' : disabled ? 'rgba(137,137,137,0.3)' : '#898989',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '0.8125rem', fontFamily: 'Lyon, serif',
      fontWeight: active ? 700 : 400,
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.borderColor = 'rgba(252,242,237,0.25)'; }}
    onMouseLeave={e => { if (!active && !disabled) e.currentTarget.style.borderColor = 'rgba(252,242,237,0.1)'; }}
  >
    {children}
  </button>
);

/* ── Skeleton ────────────────────────────────────────────── */
const SkeletonGrid = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '22px' }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={{
        borderRadius: '14px', overflow: 'hidden',
        background: 'rgba(252,242,237,0.03)', border: '1px solid rgba(252,242,237,0.06)',
        animation: 'trs-pulse 1.5s ease-in-out infinite',
        animationDelay: `${i * 0.07}s`,
      }}>
        <div style={{ height: '200px', background: 'rgba(252,242,237,0.05)' }} />
        <div style={{ padding: '16px 18px' }}>
          <div style={{ height: '14px', background: 'rgba(252,242,237,0.06)', borderRadius: '4px', marginBottom: '8px', width: '85%' }} />
          <div style={{ height: '14px', background: 'rgba(252,242,237,0.06)', borderRadius: '4px', width: '60%' }} />
        </div>
      </div>
    ))}
  </div>
);

/* ── Empty State ─────────────────────────────────────────── */
const EmptyState = ({ isRtl, tag }) => (
  <div style={{ textAlign: 'center', padding: '80px 0', color: '#898989' }}>
    <div style={{ fontSize: '3rem', opacity: 0.15, marginBottom: '16px' }}>◈</div>
    <p style={{ fontFamily: 'Lyon, serif', fontSize: '0.9375rem', marginBottom: '20px' }}>
      {isRtl ? `لا توجد مقالات بالتاغ "${tag}"` : `No articles found for "${tag}"`}
    </p>
    <Link to="/" style={{ color: '#CCF47F', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'Lyon, serif' }}>
      {isRtl ? '← الرجوع للرئيسية' : 'Back to Home →'}
    </Link>
  </div>
);

export default TagResultsSection;