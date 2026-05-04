import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getYoutubeEmbedUrl } from '../utils/youtube';
import { getContentStyles } from '../utils/contentStyles';

const CATEGORY_META = {
  tech:     { color: '#4469F2', bg: 'rgba(68,105,242,0.12)',  label: 'تقنية',    labelEn: 'Tech' },
  horizons: { color: '#F7E328', bg: 'rgba(247,227,40,0.12)',  label: 'ثقافي',     labelEn: 'Cultural' },
  social:   { color: '#E20E3C', bg: 'rgba(226,14,60,0.12)',   label: 'اجتماعي',  labelEn: 'Social' },
  podcast:  { color: '#CCF47F', bg: 'rgba(204,244,127,0.12)', label: 'بودكاست',  labelEn: 'Podcast' },
  home:     { color: '#FCF2ED', bg: 'rgba(252,242,237,0.07)', label: 'الرئيسية', labelEn: 'Home' },
};


const ArticlePage = () => {
  const { id } = useParams();
  const { dir, language } = useLanguage();

  const { data: article, loading, error } = useFetch(
    () => api.getArticle(id, language),
    [id, language]
  );

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage />;
  if (!article) return <ErrorMessage message={dir === 'rtl' ? 'المقال غير موجود' : 'Article not found'} />;
  if (article.category === 'documentary') return <ErrorMessage message={dir === 'rtl' ? 'المقال غير موجود' : 'Article not found'} />;
  if (article.category === 'horizons' && article.type === "video") return <ErrorMessage message={dir === 'rtl' ? 'المقال غير موجود' : 'Article not found'} />;

  const cat      = CATEGORY_META[article.category] || CATEGORY_META.home;
  const catLabel = dir === 'rtl' ? cat.label : cat.labelEn;
  const embedUrl = getYoutubeEmbedUrl(article.youtubeUrl);

  const tags = Array.isArray(article.tags)
    ? article.tags
    : (article.tags?.[language] || article.tags?.ar || []);

  const content = typeof article.content === 'string'
    ? article.content
    : (article.content?.[language] || article.content?.ar || '');

  return (
    <main dir={dir} style={{ fontFamily: 'Lyon, serif', minHeight: '100vh' }}>

      <style>{getContentStyles(dir)}</style>

      {/* ── Hero Section ────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '0' }}>

        {article.thumbnail ? (
          <div style={{ position: 'relative', width: '100%', height: 'clamp(320px, 50vw, 560px)' }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url('${article.thumbnail}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.55)',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 30%, #0f0f0f 100%)',
            }} />

            <div style={{
              position: 'absolute', bottom: 0, right: 0, left: 0,
              padding: 'clamp(20px, 4vw, 48px)',
              maxWidth: '1200px', margin: '0 auto',
            }}>
              <Link
                to="/"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem',
                  textDecoration: 'none', marginBottom: '20px',
                  transition: 'color 0.2s',
                  flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                <i className={`fa-solid fa-chevron-${dir === 'rtl' ? 'right' : 'left'}`} style={{ fontSize: '0.7rem' }} />
                {dir === 'rtl' ? 'رجوع' : 'Back'}
              </Link>

              

              <h1 style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
                fontWeight: 800, lineHeight: 1.22,
                color: '#FCF2ED',
                margin: '0 0 18px',
                maxWidth: '820px',
                textShadow: '0 2px 20px rgba(0,0,0,0.4)',
                textAlign: dir === 'rtl' ? 'right' : 'left',
              }}>
                {article.title}
              </h1>

              {/* <MetaRow article={article} dir={dir} /> */}
            </div>
          </div>
        ) : (
          <div style={{
            maxWidth: '1200px', margin: '0 auto',
            padding: 'clamp(32px, 5vw, 64px) clamp(20px, 4vw, 48px) 0',
          }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                color: '#898989', fontSize: '0.82rem', textDecoration: 'none',
                marginBottom: '28px', transition: 'color 0.2s',
                flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#FCF2ED'}
              onMouseLeave={e => e.currentTarget.style.color = '#898989'}
            >
              <i className={`fa-solid fa-chevron-${dir === 'rtl' ? 'right' : 'left'}`} style={{ fontSize: '0.7rem' }} />
              {dir === 'rtl' ? 'رجوع' : 'Back'}
            </Link>

            {article.category && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700,
                  padding: '4px 14px', borderRadius: '999px',
                  background: cat.bg, color: cat.color,
                  border: `1px solid ${cat.color}44`,
                  letterSpacing: '0.05em',
                }}>
                  {catLabel}
                </span>
              </div>
            )}

            <h1 style={{
              fontSize: 'clamp(1.7rem, 3.5vw, 2.8rem)',
              fontWeight: 800, lineHeight: 1.22,
              color: '#FCF2ED',
              margin: '0 0 20px',
              maxWidth: '820px',
              textAlign: dir === 'rtl' ? 'right' : 'left',
            }}>
              {article.title}
            </h1>

            <MetaRow article={article} dir={dir} />

            <div style={{
              width: '60px', height: '3px',
              background: cat.color,
              borderRadius: '2px',
              marginTop: '28px',
              marginRight: dir === 'rtl' ? 0 : 'auto',
              marginLeft: dir === 'rtl' ? 'auto' : 0,
            }} />
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 clamp(20px, 4vw, 48px)',
      }}>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: tags.length > 0 ? '0 0 36px' : '32px 0 36px' }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 260px',
          gap: '48px',
          alignItems: 'start',
        }}
          className="article-grid"
        >

          {/* ── Main Content ── */}
          <div>

            {embedUrl && (
              <div style={{
                width: '100%', aspectRatio: '16/9',
                marginBottom: '36px', borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.07)',
                background: '#000',
              }}>
                <iframe
                  src={embedUrl}
                  title={article.title}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {content && (
              <div
                className="article-body"
                dir={dir}
                style={{
                  textAlign: dir === 'rtl' ? 'right' : 'left',
                }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}

            {article.images?.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '12px',
                }}>
                  {article.images.map((img, i) => (
                    <div key={i} style={{
                      aspectRatio: '4/3',
                      backgroundImage: `url('${img}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, border-color 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside style={{ position: 'sticky', top: '88px' }}>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <p style={{ color: '#898989', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                {dir === 'rtl' ? 'معلومات' : 'Info'}
              </p>

              {article.author && (
                <InfoRow icon="fa-user" label={dir === 'rtl' ? 'الكاتب' : 'Author'} value={article.author} />
              )}
              {article.publishedAt && (
                <InfoRow
                  icon="fa-calendar"
                  label={dir === 'rtl' ? 'التاريخ' : 'Date'}
                  value={new Date(article.publishedAt).toLocaleDateString(
                    dir === 'rtl' ? 'ar-EG' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                />
              )}
              {article.views !== undefined && (
                <InfoRow icon="fa-eye" label={dir === 'rtl' ? 'المشاهدات' : 'Views'} value={article.views?.toLocaleString()} />
              )}
              {article.category && (
                <InfoRow icon="fa-folder" label={dir === 'rtl' ? 'القسم' : 'Category'} value={catLabel} valueColor={cat.color} />
              )}
            </div>
          </aside>
        </div>

        <div style={{ height: '80px' }} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .article-grid {
            grid-template-columns: 1fr !important;
          }
          .article-grid aside {
            position: static !important;
            order: -1;
          }
        }
      `}</style>
    </main>
  );
};

// ── Helpers ───────────────────────────────────────────────

const MetaRow = ({ article, dir }) => (
  <div style={{
    display: 'flex', alignItems: 'center',
    gap: '18px', flexWrap: 'wrap',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.82rem',
    flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
    justifyContent: dir === 'rtl' ? 'flex-end' : 'flex-start',
  }}>
    {article.author && (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="fa-solid fa-user" style={{ fontSize: '0.7rem' }} />
        {article.author}
      </span>
    )}
    {article.publishedAt && (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="fa-solid fa-clock" style={{ fontSize: '0.7rem' }} />
        {new Date(article.publishedAt).toLocaleDateString(
          dir === 'rtl' ? 'ar-EG' : 'en-US',
          { year: 'numeric', month: 'long', day: 'numeric' }
        )}
      </span>
    )}
    {article.views !== undefined && (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="fa-regular fa-eye" style={{ fontSize: '0.7rem' }} />
        {article.views?.toLocaleString()}
      </span>
    )}
  </div>
);

const InfoRow = ({ icon, label, value, valueColor }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <span style={{ color: '#555', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <i className={`fa-solid ${icon}`} style={{ fontSize: '0.65rem' }} />
      {label}
    </span>
    <span style={{ color: valueColor || 'rgba(252,242,237,0.7)', fontSize: '0.78rem', fontWeight: 500 }}>
      {value}
    </span>
  </div>
);

export default ArticlePage;