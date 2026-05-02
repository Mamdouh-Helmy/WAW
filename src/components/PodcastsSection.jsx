import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';

// ── helpers ───────────────────────────────────────────────────────────────────

const getThumb = (ep) => ep?.thumbnail || '/placeholder.jpg';

// ── SectionHeader ─────────────────────────────────────────────────────────────

const SectionHeader = ({ lang }) => (
  <div className="flex flex-col items-start mb-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <div className="flex items-center gap-2">
      <h2
        className="font-extrabold text-xl sm:text-2xl"
        style={{ fontFamily: 'Lyon, serif', color: '#FCF2ED' }}
      >
        <i className="fa-solid fa-headphones ml-2" style={{ color: '#CCF47F' }} />
        {lang === 'ar' ? 'بودكاست' : 'Podcast'}
      </h2>
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-sm"
        style={{ background: '#CCF47F20', color: '#CCF47F', border: '1px solid #CCF47F40' }}
      >
        {lang === 'ar' ? 'حلقات' : 'Episodes'}
      </span>
    </div>
    <div className="h-1 w-16 rounded mt-1" style={{ background: '#CCF47F' }} />
  </div>
);

// ── HeroPanel ─────────────────────────────────────────────────────────────────

const HeroPanel = ({ episode, lang }) => {
  if (!episode) return null;
  const thumb = getThumb(episode);

  return (
    <div className="w-full h-full relative" style={{ overflow: 'hidden' }}>
      <Link
        to={`/podcast/${episode._id}`}
        className="absolute inset-0 group block"
        style={{ textDecoration: 'none' }}
      >
        <img
          src={thumb}
          alt={episode.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Side gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: lang === 'ar'
              ? 'linear-gradient(to right, rgba(18,18,18,0.88) 0%, rgba(18,18,18,0.45) 60%, transparent 100%)'
              : 'linear-gradient(to left,  rgba(18,18,18,0.88) 0%, rgba(18,18,18,0.45) 60%, transparent 100%)',
          }}
        />

        {/* Bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '55%', background: 'linear-gradient(to top, rgba(18,18,18,0.97) 0%, transparent 100%)' }}
        />

        {/* Headphones icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-300 group-hover:scale-110">
          <div
            className="rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{
              width: 'clamp(44px, 8vw, 64px)',
              height: 'clamp(44px, 8vw, 64px)',
              background: 'rgba(0,0,0,0.6)',
              border: '2px solid #CCF47F',
              boxShadow: '0 0 24px rgba(204,244,127,0.3)',
            }}
          >
            <i className="fa-solid fa-headphones text-xl" style={{ color: '#CCF47F', fontSize: 'clamp(14px, 3vw, 20px)' }} />
          </div>
        </div>

        {/* Info */}
        <div
          className="absolute bottom-0 z-10"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          style={{
            left: 0,
            right: 0,
            padding: 'clamp(12px, 3vw, 20px)',
            gap: 'clamp(4px, 1vw, 8px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#CCF47F', fontFamily: 'Ko Sans, Inter, sans-serif', fontSize: 'clamp(9px, 1.5vw, 11px)' }}>
            {lang === 'ar' ? 'الحلقة' : 'Episode'} {episode.episodeNum}
          </span>
          <h3
            className="font-extrabold leading-tight"
            style={{ fontFamily: 'Lyon, serif', color: '#FCF2ED', fontSize: 'clamp(14px, 2.5vw, 26px)', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
          >
            {episode.title}
          </h3>
          <div className="flex items-center gap-3" style={{ color: '#898989', fontFamily: 'Ko Sans, Inter, sans-serif', fontSize: 'clamp(10px, 1.5vw, 12px)' }}>
            <span><i className="fa-solid fa-microphone ml-1" />{episode.host}</span>
            {episode.duration && <span>• {episode.duration}</span>}
          </div>
        </div>
      </Link>
    </div>
  );
};

// ── SidebarItem ───────────────────────────────────────────────────────────────

const SidebarItem = ({ episode, lang, isActive, onClick, progress }) => {
  const thumb = getThumb(episode);

  return (
    <button
      onClick={onClick}
      className="relative flex items-center w-full transition-colors duration-200"
      style={{
        gap: 'clamp(8px, 1.5vw, 12px)',
        padding: 'clamp(8px, 1.5vw, 12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
        borderRight: lang !== 'ar' ? (isActive ? '3px solid #CCF47F' : '3px solid transparent') : 'none',
        borderLeft: lang === 'ar' ? (isActive ? '3px solid #CCF47F' : '3px solid transparent') : 'none',
        cursor: 'pointer',
        textAlign: lang === 'ar' ? 'right' : 'left',
      }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Thumb */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: 'clamp(52px, 8vw, 72px)',
          height: 'clamp(36px, 5.5vw, 48px)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <img src={thumb} alt={episode.title} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <i className="fa-solid fa-headphones text-xs" style={{ color: '#CCF47F' }} />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: 'clamp(2px, 0.5vw, 4px)' }}>
        <span
          className="font-bold self-start"
          style={{
            color: '#CCF47F',
            fontFamily: 'Ko Sans, Inter, sans-serif',
            fontSize: 'clamp(9px, 1.2vw, 10px)',
            background: '#CCF47F20',
            border: '1px solid #CCF47F40',
            padding: '1px 5px',
            borderRadius: 3,
          }}
        >
          {lang === 'ar' ? 'الحلقة' : 'Ep.'} {episode.episodeNum}
        </span>

        <span
          className="font-bold leading-snug line-clamp-2"
          style={{
            color: isActive ? '#FCF2ED' : '#898989',
            fontFamily: 'Lyon, serif',
            fontSize: 'clamp(10px, 1.4vw, 12px)',
          }}
        >
          {episode.title}
        </span>

        {episode.duration && (
          <span
            style={{
              color: '#555',
              fontFamily: 'Ko Sans, Inter, sans-serif',
              fontSize: 'clamp(9px, 1.2vw, 11px)',
            }}
          >
            {episode.duration}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {isActive && (
        <div
          className="absolute bottom-0 left-0 h-0.5"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #CCF47F 0%, #4469F2 100%)',
            transition: 'width 0.05s linear',
          }}
        />
      )}
    </button>
  );
};

// ── MobileList ────────────────────────────────────────────────────────────────

const MobileList = ({ episodes, lang, selected, onSelect, progress }) => (
  <div
    className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
    dir={lang === 'ar' ? 'rtl' : 'ltr'}
  >
    {episodes.map((ep, i) => {
      const thumb = getThumb(ep);
      const isActive = i === selected;

      return (
        <button
          key={ep._id}
          onClick={() => onSelect(i)}
          className="relative flex-shrink-0 overflow-hidden rounded-lg"
          style={{
            width: 120,
            height: 80,
            border: isActive ? '2px solid #CCF47F' : '2px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <img src={thumb} alt={ep.title} className="w-full h-full object-cover" />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          >
            <i className="fa-solid fa-headphones text-sm" style={{ color: '#CCF47F' }} />
          </div>

          {/* Mini type badge */}
          <span
            className="absolute top-1.5 font-bold"
            style={{
              [lang === 'ar' ? 'right' : 'left']: 6,
              color: '#CCF47F',
              background: '#CCF47F20',
              border: '1px solid #CCF47F40',
              fontSize: 9,
              padding: '1px 4px',
              borderRadius: 2,
              backdropFilter: 'blur(4px)',
            }}
          >
            {lang === 'ar' ? 'حلقة' : 'Ep'} {ep.episodeNum}
          </span>

          <span
            className="absolute bottom-0 left-0 right-0 font-bold line-clamp-2 leading-tight"
            style={{
              color: '#FCF2ED',
              fontFamily: 'Lyon, serif',
              fontSize: 10,
              padding: '4px 6px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
            }}
          >
            {ep.title}
          </span>

          {isActive && (
            <div
              className="absolute bottom-0 left-0 h-0.5"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #CCF47F 0%, #4469F2 100%)',
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
const TICK = 50;

function useRotator(count) {
  const [selected, setSelected] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const countRef = useRef(count);
  const sidebarRef = useRef(null);
  const itemsRef = useRef([]);

  countRef.current = count;

  const scrollToItem = (index) => {
    const sidebar = sidebarRef.current;
    const item = itemsRef.current[index];
    if (!sidebar || !item) return;
    const { scrollTop, clientHeight } = sidebar;
    const { offsetTop, offsetHeight } = item;
    if (offsetTop < scrollTop) {
      sidebar.scrollTop = offsetTop;
    } else if (offsetTop + offsetHeight > scrollTop + clientHeight) {
      sidebar.scrollTop = offsetTop + offsetHeight - clientHeight;
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
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

const PodcastsSection = () => {
  const { lang } = useLanguage();
  const { data, loading } = useFetch(() => api.getPodcasts(lang), [lang]);
  const episodes = data || [];
  const { selected, progress, select, sidebarRef, itemsRef } = useRotator(episodes.length);
  const { isMobile, isTablet } = useBreakpoint();

  const heroHeight = isMobile ? 220 : isTablet ? 300 : 360;
  const sidebarW = isTablet ? 220 : 280;

  if (loading) {
    return (
      <section className="w-full mb-10">
        <SectionHeader lang={lang} />
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ height: heroHeight, background: '#1e1e1e' }}
        >
          <div className="flex-1 animate-pulse" style={{ background: '#2a2a2a' }} />
          {!isMobile && (
            <div style={{ width: sidebarW, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="animate-pulse" style={{ height: 76, borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#1a1a1a' }} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (!episodes.length) return null;

  return (
    <section className="w-full mb-10">
      <SectionHeader lang={lang} />

      {/* ── Mobile ── */}
      {isMobile ? (
        <div className="flex flex-col gap-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: heroHeight,
              overflow: 'hidden',
              borderRadius: 8,
              background: '#121212',
              flexShrink: 0,
            }}
          >
            <HeroPanel episode={episodes[selected]} lang={lang} />
          </div>
          <MobileList
            episodes={episodes}
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
          <HeroPanel episode={episodes[selected]} lang={lang} />

          <div
            ref={sidebarRef}
            style={{
              width: sidebarW,
              flexShrink: 0,
              background: '#0e0e0e',
              borderLeft: lang === 'ar' ? 'none' : '1px solid rgba(255,255,255,0.06)',
              borderRight: lang === 'ar' ? '1px solid rgba(255,255,255,0.06)' : 'none',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="no-scrollbar"
          >
            {episodes.map((ep, i) => (
              <div key={ep._id} ref={el => { itemsRef.current[i] = el; }}>
                <SidebarItem
                  episode={ep}
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

export default PodcastsSection;