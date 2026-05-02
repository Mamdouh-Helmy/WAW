import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// ── Config per category ────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  tech: {
    reelLabel:    { ar: 'واو 404',    en: 'WAW 404'   },
    sectionColor: '#4469F2',
    sectionBg:    'rgba(68,105,242,0.10)',
  },
  horizons: {
    reelLabel:    { ar: 'محسوبة',     en: 'Mahsouba'  },
    sectionColor: '#F7E328',
    sectionBg:    'rgba(247,227,40,0.10)',
  },
  social: {
    reelLabel:    { ar: 'من واو لزد', en: 'From WAW to Zed' },
    sectionColor: '#E20E3C',
    sectionBg:    'rgba(226,14,60,0.10)',
  },
};

// ── Mini Reel Card ─────────────────────────────────────────────────────────────
const ReelCard = ({ reel, color, language, navigate, onClose }) => {
  const [hovered, setHovered] = useState(false);

  const getYtThumb = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v=|shorts\/)([A-Za-z0-9_-]{11})/);
    return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
  };

  const thumb = reel.thumbnail || getYtThumb(reel.youtubeUrl);

  return (
    <div
      onClick={() => { navigate(`/reel/${reel._id}`); onClose(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '16/9',
        background: '#111',
        flexShrink: 0,
        border: hovered ? `1.5px solid ${color}` : '1.5px solid transparent',
        transition: 'border 0.18s, transform 0.18s',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      {thumb ? (
        <img src={thumb} alt={reel.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
          <i className="fa-solid fa-play-circle" style={{ fontSize: 28, color: '#333' }} />
        </div>
      )}

      {/* Play overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.18s',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: hovered ? color : 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.18s',
        }}>
          <i className="fa-solid fa-play" style={{ fontSize: 11, color: hovered ? '#000' : '#fff', marginLeft: 2 }} />
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        padding: '20px 8px 6px',
      }}>
        <p style={{
          color: '#fff', fontSize: 11, fontFamily: 'Lyon, serif',
          margin: 0, lineHeight: 1.3, direction: language === 'ar' ? 'rtl' : 'ltr',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>{reel.title}</p>
      </div>
    </div>
  );
};

// ── Mini Article Row ───────────────────────────────────────────────────────────
const ArticleRow = ({ article, color, language, navigate, onClose, isLast }) => {
  const [hovered, setHovered] = useState(false);
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      onClick={() => { navigate(`/article/${article._id}`); onClose(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', cursor: 'pointer', direction: dir,
        borderRadius: 8,
        borderBottom: !isLast ? '1px solid rgba(255,255,255,0.05)' : 'none',
        background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      {article.thumbnail && (
        <img src={article.thumbnail} alt="" style={{
          width: 44, height: 44, borderRadius: 6, objectFit: 'cover',
          flexShrink: 0, border: '1px solid rgba(255,255,255,0.06)',
        }} />
      )}
      <p style={{
        flex: 1, color: hovered ? '#FCF2ED' : '#bbb',
        fontSize: 12.5, fontFamily: 'Lyon, serif',
        margin: 0, lineHeight: 1.4,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        transition: 'color 0.15s',
      }}>{article.title}</p>
      <i
        className={`fa-solid fa-chevron-${dir === 'rtl' ? 'left' : 'right'}`}
        style={{ fontSize: 9, color: hovered ? color : '#444', flexShrink: 0, transition: 'color 0.15s' }}
      />
    </div>
  );
};

// ── Main Dropdown ──────────────────────────────────────────────────────────────
const NavDropdown = ({ category, language, dir, children }) => {
  const [open, setOpen]         = useState(false);
  const [reels, setReels]       = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fetched, setFetched]   = useState(false);
  const containerRef = useRef(null);
  const closeTimer   = useRef(null);
  const navigate     = useNavigate();

  const cfg   = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.tech;
  const color = cfg.sectionColor;

  const fetchData = async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const [reelRes, artRes] = await Promise.all([
        api.getReels(language, 1),
        api.getArticles(category, 1, language, 3),
      ]);
      setReels((reelRes?.reels || []).slice(0, 4));
      setArticles(artRes?.articles || []);
      setFetched(true);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
    fetchData();
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const goToReels = () => { navigate(`/${category}#reels`); setOpen(false); };
  const goToAll   = () => { navigate(`/${category}`);       setOpen(false); };

  const reelLabel   = cfg.reelLabel[language] || cfg.reelLabel.ar;
  const isRtl       = language === 'ar';

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      {children}

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            [isRtl ? 'right' : 'left']: '50%',
            transform: `translateX(${isRtl ? '50%' : '-50%'})`,
            width: 480,
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 16,
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            zIndex: 300,
            animation: 'ddFadeIn 0.18s ease',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <style>{`
            @keyframes ddFadeIn {
              from { opacity:0; transform:translateX(${isRtl ? '50%' : '-50%'}) translateY(-8px); }
              to   { opacity:1; transform:translateX(${isRtl ? '50%' : '-50%'}) translateY(0); }
            }
          `}</style>

          {/* ── Reels Section ── */}
          <div style={{ padding: '14px 14px 10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10, direction: isRtl ? 'rtl' : 'ltr',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: color }} />
                <span style={{
                  fontSize: 12, fontWeight: 700, color: color,
                  fontFamily: "'Ko Sans', sans-serif", letterSpacing: 0.3,
                }}>{reelLabel}</span>
                <span style={{
                  fontSize: 10, color: '#555',
                  fontFamily: "'Ko Sans', sans-serif",
                }}>{isRtl ? 'ريلز' : 'Reels'}</span>
              </div>
              {/* <button
                onClick={goToReels}
                style={{
                  fontSize: 11, color: color, background: 'transparent',
                  border: 'none', cursor: 'pointer', fontFamily: "'Ko Sans', sans-serif",
                  opacity: 0.8, padding: '2px 6px',
                }}
              >
                {isRtl ? 'عرض الكل ←' : 'View all →'}
              </button> */}
            </div>

            {loading ? (
              <div style={{ display: 'flex', gap: 8, height: 90 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                    animation: 'pulse 1.4s ease infinite',
                  }} />
                ))}
                <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }`}</style>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {reels.length > 0
                  ? reels.map(r => (
                      <ReelCard
                        key={r._id} reel={r} color={color}
                        language={language} navigate={navigate} onClose={() => setOpen(false)}
                      />
                    ))
                  : [1,2,3,4].map(i => (
                      <div key={i} style={{
                        aspectRatio: '16/9', borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className="fa-solid fa-film" style={{ color: '#333', fontSize: 16 }} />
                      </div>
                    ))
                }
              </div>
            )}
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 14px' }} />

          {/* ── Articles Section ── */}
          <div style={{ padding: '10px 4px 6px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              margin: '0 12px 6px', direction: isRtl ? 'rtl' : 'ltr',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
                <span style={{
                  fontSize: 12, fontWeight: 600, color: '#bbb',
                  fontFamily: "'Ko Sans', sans-serif",
                }}>{isRtl ? 'أحدث المقالات' : 'Latest Articles'}</span>
              </div>
              <button
                onClick={goToAll}
                style={{
                  fontSize: 11, color: '#666', background: 'transparent',
                  border: 'none', cursor: 'pointer', fontFamily: "'Ko Sans', sans-serif",
                  padding: '2px 6px',
                }}
              >
                {isRtl ? 'عرض الكل ←' : 'View all →'}
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.04)',
                    animation: 'pulse 1.4s ease infinite',
                  }} />
                ))}
              </div>
            ) : articles.length > 0 ? (
              articles.map((a, i) => (
                <ArticleRow
                  key={a._id} article={a} color={color}
                  language={language} navigate={navigate}
                  onClose={() => setOpen(false)}
                  isLast={i === articles.length - 1}
                />
              ))
            ) : (
              <p style={{
                textAlign: 'center', color: '#444', fontSize: 12,
                padding: '12px 0', fontFamily: "'Ko Sans', sans-serif",
              }}>
                {isRtl ? 'لا توجد مقالات' : 'No articles yet'}
              </p>
            )}
          </div>

          {/* ── Bottom strip ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '8px 14px 12px',
          }}>
            <button
              onClick={goToAll}
              style={{
                width: '100%', padding: '8px', borderRadius: 8,
                background: cfg.sectionBg,
                border: `1px solid ${color}30`,
                color: color, fontSize: 12, cursor: 'pointer',
                fontFamily: "'Ko Sans', sans-serif", fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${color}18`}
              onMouseLeave={e => e.currentTarget.style.background = cfg.sectionBg}
            >
              {isRtl
                ? `استعرض كل محتوى ${category === 'tech' ? 'تكنولوجيا' : category === 'horizons' ? 'آفاق' : 'اجتماعي'} →`
                : `Browse all ${category} content →`
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavDropdown;