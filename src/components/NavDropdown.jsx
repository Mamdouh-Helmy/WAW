import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

/* ─────────────────────────────────────────────────────────────
   Config — كل dropdown بيتحكم فيه من هنا
───────────────────────────────────────────────────────────── */
const DROPDOWN_CONFIG = {
  tech: {
    reelCategory:     'technology',
    articleCategory:  'tech',
    excludeVideoType: false,   // tech يعرض كل أنواع المقالات
    accentColor:      '#4469F2',
    accentBg:         'rgba(68,105,242,0.12)',
    accentBorder:     'rgba(68,105,242,0.25)',
    labelAr:          'تكنولوجي',
  },
  cultural: {
    reelCategory:     'cultural',
    articleCategory:  'horizons',
    excludeVideoType: true,    // ثقافي يخفي مقالات نوعها video
    accentColor:      '#F7E328',
    accentBg:         'rgba(247,227,40,0.12)',
    accentBorder:     'rgba(247,227,40,0.25)',
    labelAr:          'ثقافي',
  },
  social: {
    reelCategory:     'social',
    articleCategory:  'social',
    excludeVideoType: false,
    accentColor:      '#E20E3C',
    accentBg:         'rgba(226,14,60,0.12)',
    accentBorder:     'rgba(226,14,60,0.25)',
    labelAr:          'اجتماعي',
  },
};

/* ─────────────────────────────────────────────────────────────
   YouTube thumbnail helper
───────────────────────────────────────────────────────────── */
const getYoutubeThumbnail = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id = null;
    if (u.searchParams.get('v'))               id = u.searchParams.get('v');
    else if (u.hostname === 'youtu.be')         id = u.pathname.slice(1);
    else if (u.pathname.startsWith('/shorts/')) id = u.pathname.replace('/shorts/', '');
    else if (u.pathname.startsWith('/embed/'))  id = u.pathname.replace('/embed/', '');
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch { return null; }
};

/* ─────────────────────────────────────────────────────────────
   Reel Card — بطاقة ريل صغيرة في الـ dropdown
───────────────────────────────────────────────────────────── */
const ReelCard = ({ reel, accentColor, navigate, language }) => {
  const thumb = reel.thumbnail || getYoutubeThumbnail(reel.youtubeUrl);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(`/reels/${reel._id}?lang=${language}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        borderRadius: '10px',
        overflow: 'hidden',
        border: hovered
          ? `1px solid ${accentColor}55`
          : '1px solid rgba(255,255,255,0.06)',
        transition: 'border-color 0.15s, transform 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        background: '#181818',
        flexShrink: 0,
        width: '90px',
      }}
    >
      {/* Thumbnail — 9:16 */}
      <div style={{
        width: '90px',
        height: '30px',
        position: 'relative',
        background: '#181818',
        overflow: 'hidden',
      }}>
        {thumb ? (
          <img
            src={thumb}
            alt={reel.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.08)', fontSize: '1.4rem',
          }}>▶</div>
        )}
        {/* play overlay on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: accentColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <path d="M1 1L9 6L1 11V1Z" fill="#161616" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ padding: '6px 8px' }}>
        <p style={{
          color: hovered ? '#FCF2ED' : '#898989',
          fontSize: '0.65rem',
          fontFamily: 'Lyon, serif',
          margin: 0,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          transition: 'color 0.15s',
          background: '#181818',
        }}>{reel.title || '—'}</p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Article Row — صف مقالة في الـ dropdown
───────────────────────────────────────────────────────────── */
const ArticleRow = ({ article, accentColor, navigate, language }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(`/article/${article._id}?lang=${language}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 10px', borderRadius: '10px',
        cursor: 'pointer',
        background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '48px', height: '34px',
        borderRadius: '6px', flexShrink: 0,
        background: '#111',
        backgroundImage: article.thumbnail ? `url('${article.thumbnail}')` : 'none',
        backgroundSize: 'cover', backgroundPosition: 'center',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {!article.thumbnail && (
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.75rem' }}>✦</span>
        )}
      </div>

      {/* Text */}
      <p style={{
        color: hovered ? '#FCF2ED' : '#898989',
        fontSize: '0.75rem', fontFamily: 'Lyon, serif',
        margin: 0, lineHeight: 1.4,
        flex: 1, overflow: 'hidden',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        transition: 'color 0.15s',
      }}>{article.title || '—'}</p>

      {/* Arrow */}
      <svg
        width="10" height="10" viewBox="0 0 10 10" fill="none"
        style={{ flexShrink: 0, opacity: hovered ? 0.6 : 0.2, transition: 'opacity 0.15s' }}
      >
        <path d="M7 1.5L1.5 7M7 1.5H2.5M7 1.5V6"
          stroke={accentColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   NavDropdown — المكون الرئيسي
───────────────────────────────────────────────────────────── */
const NavDropdown = ({ category, language, dir, children }) => {
  const navigate    = useNavigate();
  const config      = DROPDOWN_CONFIG[category];
  const containerRef = useRef(null);

  const [open,     setOpen]     = useState(false);
  const [reels,    setReels]    = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [fetched,  setFetched]  = useState(false);

  const hoverTimer  = useRef(null);
  const leaveTimer  = useRef(null);

  /* جلب البيانات مرة واحدة بس عند أول hover */
  const fetchData = async () => {
    if (fetched || loading) return;
    setLoading(true);
    try {
      const [reelsRes, articlesRes] = await Promise.all([
        api.getReels(language, 1, config.reelCategory),
        api.getArticles(config.articleCategory, 1, language, 6),
      ]);

      setReels((reelsRes.reels || []).slice(0, 4));

      // فلتر المقالات: لو excludeVideoType = true نشيل اللي type = 'video'
      const allArticles = articlesRes.articles || [];
      const filtered    = config.excludeVideoType
        ? allArticles.filter(a => a.type !== 'video')
        : allArticles;
      setArticles(filtered.slice(0, 4));
    } catch (e) {
      console.error('NavDropdown fetch error:', e);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    hoverTimer.current = setTimeout(() => {
      setOpen(true);
      fetchData();
    }, 80);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    leaveTimer.current = setTimeout(() => setOpen(false), 120);
  };

  /* إغلاق بالضغط بره */
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!config) return children;

  const { accentColor, accentBg, accentBorder, labelAr } = config;
  const hasReels    = reels.length > 0;
  const hasArticles = articles.length > 0;

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {/* Trigger — children = NavLink */}
      {children}

      {/* Dropdown Panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            [dir === 'rtl' ? 'right' : 'left']: '50%',
            transform: dir === 'rtl' ? 'translateX(50%)' : 'translateX(-50%)',
            width: '420px',
            background: '#181818',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            zIndex: 200,
            overflow: 'hidden',
            animation: 'dropIn 0.15s ease',
            fontFamily: 'Lyon, serif',
          }}
          dir={dir}
        >
          <style>{`
            @keyframes dropIn {
              from { opacity: 0; transform: ${dir === 'rtl' ? 'translateX(50%)' : 'translateX(-50%)'} translateY(-6px); }
              to   { opacity: 1; transform: ${dir === 'rtl' ? 'translateX(50%)' : 'translateX(-50%)'} translateY(0); }
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>

          {/* Header strip */}
          <div style={{
            padding: '12px 16px 10px',
            borderBottom: `1px solid ${accentBorder}`,
            background: accentBg,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ color: accentColor, fontSize: '0.75rem', fontWeight: 700 }}>
              {labelAr}
            </span>
            <button
              onClick={() => { navigate(`/${category}`); setOpen(false); }}
              style={{
                fontSize: '0.65rem', color: accentColor,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Lyon, serif', opacity: 0.8,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              عرض الكل
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M6 1.5L1 6.5M6 1.5H2M6 1.5V5.5"
                  stroke={accentColor} strokeWidth="1.2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: `2px solid ${accentBg}`,
                borderTopColor: accentColor,
                animation: 'spin 0.7s linear infinite',
              }} />
            </div>
          )}

          {!loading && (
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* ── Reels Section ── */}
              {hasReels && (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}>
                    <span style={{
                      fontSize: '0.65rem', color: 'rgba(137,137,137,0.6)',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      ريلزدي
                    </span>
                    <button
                      onClick={() => { navigate(`/${category}?tab=reels`); setOpen(false); }}
                      style={{
                        fontSize: '0.62rem', color: '#555',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'Lyon, serif',
                      }}
                    >
                      المزيد ←
                    </button>
                  </div>
                  <div style={{
                    display: 'flex', gap: '8px',
                    overflowX: 'auto', paddingBottom: '4px',
                    scrollbarWidth: 'none', msOverflowStyle: 'none',
                  }}>
                    {reels.map(reel => (
                      <ReelCard
                        key={reel._id}
                        reel={reel}
                        accentColor={accentColor}
                        navigate={navigate}
                        language={language}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              {hasReels && hasArticles && (
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
              )}

              {/* ── Articles Section ── */}
              {hasArticles && (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}>
                    <span style={{
                      fontSize: '0.65rem', color: 'rgba(137,137,137,0.6)',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      مقالات
                    </span>
                    <button
                      onClick={() => { navigate(`/${category}`); setOpen(false); }}
                      style={{
                        fontSize: '0.62rem', color: '#555',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontFamily: 'Lyon, serif',
                      }}
                    >
                      المزيد ←
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {articles.map(article => (
                      <ArticleRow
                        key={article._id}
                        article={article}
                        accentColor={accentColor}
                        navigate={navigate}
                        language={language}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!hasReels && !hasArticles && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#444', fontSize: '0.8rem' }}>
                  لا يوجد محتوى بعد
                </div>
              )}

            </div>
          )}

          {/* Bottom arrow pointer */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '12px', height: '12px',
            background: '#181818',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '2px 0 0 0',
            rotate: '45deg',
            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          }} />
        </div>
      )}
    </div>
  );
};

export default NavDropdown;