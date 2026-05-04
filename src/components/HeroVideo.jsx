import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const FIXED_VIDEO = {
  youtubeId: '0R68QOE2KIc',
  title: {
    ar: 'مرحبا بك في واو',
    en: 'Welcome to WAW',
  },
};

const HeroVideo = () => {
  const { language } = useLanguage();
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered]   = useState(false);
  const animRef                  = useRef(null);
  const startRef                 = useRef(null);
  const DURATION                 = 8000;

  useEffect(() => {
    if (playing || hovered) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ((ts - startRef.current) % DURATION);
      const pct = (elapsed / DURATION) * 100;
      setProgress(pct);
      animRef.current = requestAnimationFrame(animate);
    };

    startRef.current = null;
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, hovered]);

  const title = FIXED_VIDEO.title[language] || FIXED_VIDEO.title.ar;
  const PERIMETER = 395;
  const dashOffset = PERIMETER - (PERIMETER * progress) / 100;

  return (
    <section
      className="relative rounded-md md:rounded-2xl overflow-hidden mt-4 sm:mt-6 md:mt-8 mb-6 sm:mb-8 md:mb-10 h-[260px] sm:h-[340px] md:h-[400px] lg:h-[480px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Progress Border ── */}
      {!playing && (
        <div className="absolute inset-0 rounded-2xl z-30 pointer-events-none">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#CCF47F" />
                <stop offset="33%"  stopColor="#4469F2" />
                <stop offset="66%"  stopColor="#F7E328" />
                <stop offset="100%" stopColor="#CCF47F" />
              </linearGradient>
            </defs>
            <rect
              x="0.5" y="0.5" width="99" height="99"
              rx="1.5" ry="1.5"
              fill="none"
              stroke="url(#pgGrad)"
              strokeWidth="0.8"
              strokeDasharray={PERIMETER}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{
                transformOrigin: '50% 50%',
                transform: 'rotate(-90deg)',
              }}
            />
          </svg>
        </div>
      )}

      {playing ? (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${FIXED_VIDEO.youtubeId}?autoplay=1`}
          title={title}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        <div className="relative w-full h-full bg-black">

          {/* Thumbnail */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ${hovered ? 'scale-105' : 'scale-100'}`}
            style={{ backgroundImage: `url('https://img.youtube.com/vi/${FIXED_VIDEO.youtubeId}/maxresdefault.jpg')` }}
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

          {/* Corner accents */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#CCF47F]/60 rounded-tl-sm" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#4469F2]/60 rounded-tr-sm" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#F7E328]/60 rounded-bl-sm" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#CCF47F]/60 rounded-br-sm" />

          {/* المحتوى المركزي */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4 sm:gap-6">

            {/* Badge */}
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-4 py-1.5 md:mb-10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCF47F] animate-pulse" />
              <span className="text-white/70 text-[10px] sm:text-xs tracking-[0.2em] uppercase font-medium">
                {language === 'ar' ? 'شاهد الآن' : 'Watch Now'}
              </span>
            </div>

            {/* حلقات + زر */}
            <div className="relative flex items-center justify-center">
              <div
                className="absolute w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full animate-spin"
                style={{
                  background: 'conic-gradient(from 0deg, #CCF47F22, #4469F244, #F7E32822, #E20E3C22, #CCF47F22)',
                  animationDuration: '4s',
                }}
              />
              <div className="absolute w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border border-[#CCF47F]/20 animate-pulse" />
              <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2s' }} />

              <button
                onClick={() => setPlaying(true)}
                className="
                  relative z-10
                  w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                  rounded-full flex items-center justify-center
                  transition-all duration-300 hover:scale-110
                "
                style={{
                  background: 'linear-gradient(135deg, #CCF47F, #4469F2)',
                  boxShadow: '0 0 40px rgba(204,244,127,0.35), 0 0 80px rgba(68,105,242,0.2)',
                }}
              >
                <i className="fa-solid fa-play text-xl sm:text-2xl md:text-3xl text-white ml-1 drop-shadow" />
              </button>
            </div>

            {/* العنوان */}
            <div className="text-center px-6 sm:px-10 max-w-lg md:mt-10">
              <h2
                className="font-extrabold text-white text-xl sm:text-3xl md:text-4xl leading-tight"
                style={{ fontFamily: 'Lyon, serif', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
              >
                {title}
              </h2>
            </div>

          </div>

          {/* شريط سفلي */}
          <div
            className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #CCF47F, #4469F2)' }}
              >
                <i className="fa-brands fa-youtube text-white text-xs" />
              </div>
              <span className="text-white/50 text-xs">YouTube</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[0, 25, 50, 75].map((threshold, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full transition-all duration-300"
                  style={{
                    background: progress >= threshold ? '#CCF47F' : 'rgba(255,255,255,0.2)',
                    transform: progress >= threshold ? 'scale(1.4)' : 'scale(1)',
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-fire text-[#CCF47F] text-xs" />
              <span className="text-white/50 text-xs">
                {language === 'ar' ? 'الأكثر مشاهدة' : 'Most Watched'}
              </span>
            </div>
          </div>

        </div>
      )}
    </section>
  );
};

export default HeroVideo;