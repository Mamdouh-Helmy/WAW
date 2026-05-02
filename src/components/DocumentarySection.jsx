import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { getYoutubeEmbedUrl } from '../utils/youtube';

// ── helpers ───────────────────────────────────────────────────────────────────

const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
};

const getThumb = (article) =>
  article?.thumbnail ||
  getYouTubeThumbnail(article?.youtubeUrl) ||
  '/placeholder.jpg';

// ── Badge config ──────────────────────────────────────────────────────────────

const BADGE_STYLES = {
  documentary: {
    label:  { ar: 'وثائقي', en: 'Doc' },
    bg:     '#CCF47F20',
    color:  '#CCF47F',
    border: '1px solid #CCF47F40',
  },
  feature: {
    label:  { ar: 'فيتشر', en: 'Feature' },
    bg:     '#4469F220',
    color:  '#4469F2',
    border: '1px solid #4469F240',
  },
};

// ── SectionHeader ─────────────────────────────────────────────────────────────

const SectionHeader = ({ lang, activeType }) => {
  const badge = BADGE_STYLES[activeType] || BADGE_STYLES.documentary;

  return (
    <div className="flex flex-col items-start mb-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <h2
          className="font-extrabold text-xl sm:text-2xl"
          style={{ fontFamily: 'Lyon, serif', color: '#FCF2ED' }}
        >
          {lang === 'ar' ? 'أفلام تسجيلية' : 'Documentaries'}
        </h2>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-sm transition-all duration-300"
          style={{
            background: badge.bg,
            color:      badge.color,
            border:     badge.border,
          }}
        >
          {badge.label[lang] || badge.label.ar}
        </span>
      </div>
      <div
        className="h-1 w-16 rounded mt-1 transition-all duration-300"
        style={{ background: badge.color }}
      />
    </div>
  );
};

// ── HeroPanel ─────────────────────────────────────────────────────────────────

const HeroPanel = ({ article, lang }) => {
  const [showVideo, setShowVideo] = useState(false);
  const currentIdRef = useRef(null);

  if (article?._id !== currentIdRef.current) {
    currentIdRef.current = article?._id;
    if (showVideo) setShowVideo(false);
  }

  if (!article) return null;

  const embedUrl = getYoutubeEmbedUrl(article.youtubeUrl);
  const hasVideo = !!embedUrl;
  const thumb    = getThumb(article);
  const badge    = BADGE_STYLES[article.documentaryType] || BADGE_STYLES.documentary;

  return (
    // ✅ الإصلاح: شيل flex-1 وخليه w-full h-full بس
    <div className="w-full h-full" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Inline video player */}
      {showVideo && embedUrl && (
        <div className="absolute inset-0 z-20" style={{ background: '#000' }}>
          <iframe
            src={`${embedUrl}?autoplay=1&rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <button
            onClick={() => setShowVideo(false)}
            style={{
              position: 'absolute', top: 12, right: 12, zIndex: 30,
              width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
              background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="1" y1="1" x2="11" y2="11" stroke="#FCF2ED" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="11" y1="1" x2="1"  y2="11" stroke="#FCF2ED" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Thumbnail + overlays */}
      <div className="absolute inset-0 group">
        <img
          src={thumb}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0"
          style={{
            background: lang === 'ar'
              ? 'linear-gradient(to right, rgba(18,18,18,0.88) 0%, rgba(18,18,18,0.45) 60%, transparent 100%)'
              : 'linear-gradient(to left,  rgba(18,18,18,0.88) 0%, rgba(18,18,18,0.45) 60%, transparent 100%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '55%', background: 'linear-gradient(to top, rgba(18,18,18,0.97) 0%, transparent 100%)' }}
        />

        {/* Badge */}
        <div
          className="absolute top-3 z-10"
          style={{ [lang === 'ar' ? 'right' : 'left']: 12 }}
        >
          <span
            className="text-xs font-bold px-2 py-1 rounded-sm backdrop-blur-sm"
            style={{ background: badge.bg, color: badge.color, border: badge.border }}
          >
            {badge.label[lang] || badge.label.ar}
          </span>
        </div>

        {/* Play button */}
        {hasVideo && !showVideo && (
          <button
            onClick={() => setShowVideo(true)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-300 hover:scale-110"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <div
              className="rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{
                width: 'clamp(44px, 8vw, 64px)', height: 'clamp(44px, 8vw, 64px)',
                background: 'rgba(0,0,0,0.6)',
                border: `2px solid ${badge.color}`,
                boxShadow: `0 0 24px ${badge.color}40`,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 'clamp(18px, 3.5vw, 28px)', height: 'clamp(18px, 3.5vw, 28px)' }}>
                <polygon points="8,5 19,12 8,19" fill={badge.color} />
              </svg>
            </div>
          </button>
        )}

        {/* Text info */}
        <div
          className="absolute bottom-0 flex flex-col z-10"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          style={{ left: 0, right: 0, padding: 'clamp(12px, 3vw, 20px)', gap: 'clamp(4px, 1vw, 8px)' }}
        >
          {article.showName && (
            <span style={{ color: badge.color, fontFamily: 'Ko Sans, Inter, sans-serif', fontSize: 'clamp(9px, 1.5vw, 12px)', fontWeight: 700 }}>
              {article.showName}
            </span>
          )}
          <h3
            className="font-extrabold leading-tight"
            style={{ fontFamily: 'Lyon, serif', color: '#FCF2ED', fontSize: 'clamp(14px, 2.5vw, 26px)', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
          >
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="leading-relaxed line-clamp-2" style={{ color: '#898989', fontFamily: 'Ko Sans, Inter, sans-serif', fontSize: 'clamp(10px, 1.5vw, 13px)' }}>
              {article.excerpt}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── SidebarItem ───────────────────────────────────────────────────────────────

const SidebarItem = ({ article, lang, isActive, onClick, progress }) => {
  const thumb = getThumb(article);
  const badge = BADGE_STYLES[article.documentaryType] || BADGE_STYLES.documentary;

  return (
    <button
      onClick={onClick}
      className="relative flex items-center w-full transition-colors duration-200"
      style={{
        gap:          'clamp(8px, 1.5vw, 12px)',
        padding:      'clamp(8px, 1.5vw, 12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background:   isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
        borderRight:  lang !== 'ar' ? (isActive ? `3px solid ${badge.color}` : '3px solid transparent') : 'none',
        borderLeft:   lang === 'ar' ? (isActive ? `3px solid ${badge.color}` : '3px solid transparent') : 'none',
        cursor:       'pointer',
        textAlign:    lang === 'ar' ? 'right' : 'left',
      }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Thumb */}
      <div
        className="relative flex-shrink-0"
        style={{
          width:        'clamp(52px, 8vw, 72px)',
          height:       'clamp(36px, 5.5vw, 48px)',
          borderRadius: 4,
          overflow:     'hidden',
        }}
      >
        <img src={thumb} alt={article.title} className="w-full h-full object-cover" />
      </div>

      {/* Text */}
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 'clamp(2px, 0.5vw, 4px)' }}>
        {/* Documentary type mini badge */}
        <span
          className="font-bold self-start"
          style={{
            color:      badge.color,
            fontFamily: 'Ko Sans, Inter, sans-serif',
            fontSize:   'clamp(9px, 1.2vw, 10px)',
            background: badge.bg,
            border:     badge.border,
            padding:    '1px 5px',
            borderRadius: 3,
          }}
        >
          {badge.label[lang] || badge.label.ar}
        </span>

        {article.showName && (
          <span
            className="font-bold truncate"
            style={{
              color:      badge.color,
              fontFamily: 'Ko Sans, Inter, sans-serif',
              fontSize:   'clamp(9px, 1.2vw, 11px)',
            }}
          >
            {article.showName}
          </span>
        )}
        <span
          className="font-bold leading-snug line-clamp-2"
          style={{
            color:      isActive ? '#FCF2ED' : '#898989',
            fontFamily: 'Lyon, serif',
            fontSize:   'clamp(10px, 1.4vw, 12px)',
          }}
        >
          {article.title}
        </span>
        {article.episodeCount && (
          <span
            style={{
              color:      badge.color,
              fontFamily: 'Ko Sans, Inter, sans-serif',
              fontSize:   'clamp(9px, 1.2vw, 11px)',
            }}
          >
            {article.episodeCount} {lang === 'ar' ? 'حلقة' : 'eps'}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {isActive && (
        <div
          className="absolute bottom-0 left-0 h-0.5"
          style={{
            width:      `${progress}%`,
            background: `linear-gradient(90deg, ${badge.color} 0%, #4469F2 100%)`,
            transition: 'width 0.05s linear',
          }}
        />
      )}
    </button>
  );
};

// ── MobileList ────────────────────────────────────────────────────────────────

const MobileList = ({ articles, lang, selected, onSelect, progress }) => (
  <div
    className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
    dir={lang === 'ar' ? 'rtl' : 'ltr'}
  >
    {articles.map((article, i) => {
      const thumb    = getThumb(article);
      const isActive = i === selected;
      const badge    = BADGE_STYLES[article.documentaryType] || BADGE_STYLES.documentary;

      return (
        <button
          key={article._id}
          onClick={() => onSelect(i)}
          className="relative flex-shrink-0 overflow-hidden rounded-lg"
          style={{
            width:      120,
            height:     80,
            border:     isActive ? `2px solid ${badge.color}` : '2px solid transparent',
            background: 'transparent',
            cursor:     'pointer',
            padding:    0,
          }}
        >
          <img src={thumb} alt={article.title} className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.5)' }}
          />

          {/* Mini type badge */}
          <span
            className="absolute top-1.5 font-bold"
            style={{
              [lang === 'ar' ? 'right' : 'left']: 6,
              color:        badge.color,
              background:   badge.bg,
              border:       badge.border,
              fontSize:     9,
              padding:      '1px 4px',
              borderRadius: 2,
              backdropFilter: 'blur(4px)',
            }}
          >
            {badge.label[lang] || badge.label.ar}
          </span>

          <span
            className="absolute bottom-0 left-0 right-0 font-bold line-clamp-2 leading-tight"
            style={{
              color:      '#FCF2ED',
              fontFamily: 'Lyon, serif',
              fontSize:   10,
              padding:    '4px 6px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
            }}
          >
            {article.title}
          </span>

          {isActive && (
            <div
              className="absolute bottom-0 left-0 h-0.5"
              style={{
                width:      `${progress}%`,
                background: `linear-gradient(90deg, ${badge.color} 0%, #4469F2 100%)`,
                transition: 'width 0.05s linear',
              }}
            />
          )}
        </button>
      );
    })}
  </div>
);

// ── useRotator ────────────────────────────────────────────────────────────────

const DURATION = 6000;
const TICK     = 50;

function useRotator(count) {
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef   = useRef(null);
  const startRef   = useRef(null);
  const countRef   = useRef(count);
  const sidebarRef = useRef(null);
  const itemsRef   = useRef([]);

  countRef.current = count;

  const scrollToItem = (index) => {
    const sidebar = sidebarRef.current;
    const item    = itemsRef.current[index];
    if (!sidebar || !item) return;
    const { scrollTop, clientHeight } = sidebar;
    const { offsetTop, offsetHeight }  = item;
    if (offsetTop < scrollTop) {
      sidebar.scrollTop = offsetTop;
    } else if (offsetTop + offsetHeight > scrollTop + clientHeight) {
      sidebar.scrollTop = offsetTop + offsetHeight - clientHeight;
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    startRef.current   = Date.now();
    timerRef.current   = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
      if (elapsed >= DURATION) {
        startRef.current = Date.now();
        setProgress(0);
        setSelected(prev => {
          const next = (prev + 1) % countRef.current;
          scrollToItem(next);
          return next;
        });
      }
    }, TICK);
  };

  useEffect(() => {
    if (count === 0) return;
    setSelected(0);
    setProgress(0);
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [count]);

  const select = (i) => {
    if (i === selected) return;
    setSelected(i);
    setProgress(0);
    scrollToItem(i);
    startTimer();
  };

  return { selected, progress, select, sidebarRef, itemsRef };
}

// ── useBreakpoint ─────────────────────────────────────────────────────────────

function useBreakpoint() {
  const [bp, setBp] = useState(() => window.innerWidth);
  useEffect(() => {
    const handler = () => setBp(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return { isMobile: bp < 640, isTablet: bp >= 640 && bp < 1024 };
}

// ── Main Component ────────────────────────────────────────────────────────────

const DocumentarySection = () => {
  const { lang } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const { selected, progress, select, sidebarRef, itemsRef } = useRotator(articles.length);
  const { isMobile, isTablet } = useBreakpoint();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getArticles('documentary', 1, lang, 8);
        if (!cancelled) setArticles(res.articles || []);
      } catch {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [lang]);

  const heroHeight = isMobile ? 220 : isTablet ? 300 : 360;
  const sidebarW   = isTablet ? 220 : 280;
  const activeType = articles[selected]?.documentaryType || 'documentary';

  if (loading) {
    return (
      <section className="w-full mb-10">
        <SectionHeader lang={lang} activeType="documentary" />
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ height: heroHeight, background: '#1e1e1e' }}
        >
          <div className="flex-1 animate-pulse" style={{ background: '#2a2a2a' }} />
          {!isMobile && (
            <div style={{ width: sidebarW, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
              {[0,1,2,3].map(i => (
                <div key={i} className="animate-pulse" style={{ height: 76, borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#1a1a1a' }} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (!articles.length) return null;

  return (
    <section className="w-full mb-10">
      <SectionHeader lang={lang} activeType={activeType} />

      {/* ── Mobile ── */}
      {isMobile ? (
        <div className="flex flex-col gap-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div
            style={{
              position:     'relative',
              width:        '100%',
              height:       heroHeight,
              overflow:     'hidden',
              borderRadius: 8,
              background:   '#121212',
              flexShrink:   0,
            }}
          >
            <HeroPanel article={articles[selected]} lang={lang} />
          </div>
          <MobileList
            articles={articles}
            lang={lang}
            selected={selected}
            onSelect={select}
            progress={progress}
          />
        </div>
      ) : (
        /* ── Tablet / Desktop ── */
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ height: heroHeight, background: '#121212' }}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <HeroPanel article={articles[selected]} lang={lang} />

          <div
            ref={sidebarRef}
            style={{
              width:        sidebarW,
              flexShrink:   0,
              background:   '#0e0e0e',
              borderLeft:   lang === 'ar' ? 'none' : '1px solid rgba(255,255,255,0.06)',
              borderRight:  lang === 'ar' ? '1px solid rgba(255,255,255,0.06)' : 'none',
              overflowY:    'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="no-scrollbar"
          >
            {articles.map((article, i) => (
              <div key={article._id} ref={el => { itemsRef.current[i] = el; }}>
                <SidebarItem
                  article={article}
                  lang={lang}
                  isActive={i === selected}
                  onClick={() => select(i)}
                  progress={i === selected ? progress : 0}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </section>
  );
};

export default DocumentarySection;