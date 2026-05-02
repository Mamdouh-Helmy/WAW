import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';

const getBadgeColor = (category) => {
  const colors = {
    tech:     'bg-[#4469F2] text-white',
    horizons: 'bg-[#F7E328] text-black',
    social:   'bg-[#E20E3C] text-white',
    podcast:  'bg-[#CCF47F] text-black',
    home:     'bg-white/10 text-white',
  };
  return colors[category] || 'bg-[#4469F2] text-white';
};

const DEFAULT_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&q=80&w=1200&h=600',
    category: 'tech', title: 'مرحباً بك في واو', type: 'article', _id: null,
  },
  {
    image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=1200&h=600',
    category: 'horizons', title: 'اكتشف أحدث المقالات', type: 'article', _id: null,
  },
  {
    image: 'https://images.unsplash.com/photo-1628126235206-5260b9ea6441?auto=format&fit=crop&q=80&w=1200&h=600',
    category: 'social', title: 'تابع كل جديد', type: 'video', _id: null,
  },
  {
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200&h=600',
    category: 'tech', title: 'أحدث التقارير', type: 'article', _id: null,
  },
  {
    image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1200&h=600',
    category: 'social', title: 'قصص ملهمة', type: 'article', _id: null,
  },
];

// ─── VideoSlide ───────────────────────────────────────────────────────────────
const VideoSlide = ({ slide, onNavigate, onPlayingChange }) => {
  const [playing, setPlaying] = useState(false);

  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const youtubeId = getYoutubeId(slide.youtubeUrl);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (youtubeId) {
      setPlaying(true);
      onPlayingChange?.(true);
    } else if (slide._id) {
      onNavigate(slide);
    }
  };

  const handleNavigate = () => {
    onPlayingChange?.(false);
    onNavigate(slide);
  };

  useEffect(() => {
    return () => {
      onPlayingChange?.(false);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      {playing && youtubeId ? (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={slide.title}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      ) : (
        <>
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${slide.thumbnail || slide.image}')` }}
          />
          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4">
            <button
              onClick={handlePlay}
              className="
                w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                rounded-full bg-white flex items-center justify-center
                shadow-2xl transition-all duration-300
                hover:scale-110 hover:bg-[#CCF47F]
                group
              "
            >
              <i className="fa-solid fa-play text-xl sm:text-2xl md:text-3xl text-[#161616] ml-1 group-hover:text-[#161616]" />
            </button>

            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
              <i className="fa-solid fa-fire text-[#F7E328] text-xs" />
              <span className="text-white text-xs sm:text-sm font-bold">الأكثر مشاهدة</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h2
              className="font-extrabold text-white text-base sm:text-xl md:text-2xl text-center cursor-pointer hover:text-[#CCF47F] transition-colors"
              style={{ fontFamily: 'Lyon, serif' }}
              onClick={handleNavigate}
            >
              {slide.title}
            </h2>
            {slide.views && (
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <i className="fa-solid fa-eye text-white/60 text-xs" />
                <span className="text-white/60 text-xs">{slide.views.toLocaleString('ar-EG')} مشاهدة</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ─── HeroSlider ───────────────────────────────────────────────────────────────
const HeroSlider = () => {
  const { t, dir, language }  = useLanguage();
  const navigate              = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const { data: slidesData }   = useFetch(() => api.getArticles('', 1, language, 5), [language]);
  const { data: mostReadData } = useFetch(() => api.getMostRead(language), [language]);

  const buildSlides = () => {
    const articles = slidesData?.articles || [];
    const mostRead = mostReadData?.[0] || null;

    if (!articles.length) return DEFAULT_SLIDES;

    const result = articles.slice(0, 5).map(a => ({ ...a }));

    if (mostRead) {
      const mostReadIndex = result.findIndex(a => a._id === mostRead._id);
      if (mostReadIndex !== -1 && mostReadIndex !== 2) {
        result[mostReadIndex] = { ...result[2] };
      }
      result[2] = {
        ...mostRead,
        type: mostRead.youtubeUrl ? 'video' : (mostRead.type || 'article'),
        _isVideoSlide: true,
      };
    } else if (result[2]) {
      result[2] = { ...result[2], _isVideoSlide: true };
    }

    return result;
  };

  const slides = buildSlides();

  useEffect(() => {
    setCurrentSlide(0);
  }, [slides.length]);

  useEffect(() => {
    if (videoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, videoPlaying]);

  useEffect(() => {
    if (currentSlide !== 2) setVideoPlaying(false);
  }, [currentSlide]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  const handleClick = (slide) => {
    if (slide._id) navigate(`/article/${slide._id}`);
  };

  return (
    <section className="
      relative mt-4 mb-6 rounded-lg overflow-hidden
      h-[260px]
      sm:h-[340px]
      md:h-[400px]
      lg:h-[450px]
      mt-4 sm:mt-6 md:mt-8
      mb-6 sm:mb-8 md:mb-10
    ">
      {slides.map((slide, index) => (
        <div
          key={`slide-${index}`}
          className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {index === 2 ? (
            <VideoSlide
              slide={slide}
              onNavigate={handleClick}
              onPlayingChange={setVideoPlaying}
            />
          ) : (
            <>
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-[6000ms] hover:scale-110 cursor-pointer"
                style={{ backgroundImage: `url('${slide.thumbnail || slide.image}')` }}
                onClick={() => handleClick(slide)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(22,22,22,0.95)] via-[rgba(22,22,22,0.4)] to-transparent" />

              <div
                className="
                  absolute bottom-0 z-10
                  p-4 sm:p-6 md:p-8 lg:p-10
                  max-w-[90%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%]
                "
                style={{
                  [dir === 'rtl' ? 'right' : 'left']: 0,
                  textAlign: dir === 'rtl' ? 'right' : 'left',
                }}
              >
                <h1
                  className="
                    font-extrabold leading-tight text-white cursor-pointer
                    hover:text-[#CCF47F] transition-colors mt-2 sm:mt-3 md:mt-4
                    text-lg sm:text-2xl md:text-3xl
                  "
                  style={{ fontFamily: 'Lyon, serif' }}
                  onClick={() => handleClick(slide)}
                >
                  {slide.title}
                </h1>
                {slide.publishedAt && (
                  <div className="text-white/80 text-xs sm:text-sm mt-1 sm:mt-2">
                    <i className="fa-solid fa-clock mr-2" />
                    {new Date(slide.publishedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </div>
                )}
              </div>

              {slide.type === 'video' && (
                <div
                  className="
                    absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10
                    left-4 sm:left-6 md:left-8 lg:left-10
                    w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
                    rounded-full border-2 border-white/30 flex items-center justify-center
                    bg-black/30 backdrop-blur-sm transition-all
                    hover:bg-[#CCF47F] hover:text-[#161616] hover:border-transparent
                    cursor-pointer z-10 text-white
                  "
                  onClick={() => handleClick(slide)}
                >
                  <i className="fa-solid fa-play text-base sm:text-lg md:text-xl" />
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* أزرار التنقل */}
      <button
        onClick={prevSlide}
        className="
          absolute top-1/2 -translate-y-1/2 z-20
          w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11
          rounded-full bg-black/50 text-white flex items-center justify-center
          transition-colors hover:bg-black/80 border border-white/10
          text-xs sm:text-sm
        "
        style={{ [dir === 'rtl' ? 'right' : 'left']: '10px' }}
      >
        <i className={`fa-solid fa-chevron-${dir === 'rtl' ? 'right' : 'left'}`} />
      </button>
      <button
        onClick={nextSlide}
        className="
          absolute top-1/2 -translate-y-1/2 z-20
          w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11
          rounded-full bg-black/50 text-white flex items-center justify-center
          transition-colors hover:bg-black/80 border border-white/10
          text-xs sm:text-sm
        "
        style={{ [dir === 'rtl' ? 'left' : 'right']: '10px' }}
      >
        <i className={`fa-solid fa-chevron-${dir === 'rtl' ? 'left' : 'right'}`} />
      </button>

      {/* Pagination */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20 w-[75%] sm:w-[65%] md:w-[60%] justify-center">
        {slides.map((_, index) => (
          <div
            key={`dot-${index}`}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 flex-grow max-w-20 rounded cursor-pointer overflow-hidden relative ${
              index === 2 ? 'bg-[#F7E328]/30' : 'bg-white/30'
            }`}
          >
            {index === currentSlide && (
              <div
                className={`absolute top-0 left-0 bottom-0 animate-[fillProgress_5s_linear_forwards] ${
                  index === 2 ? 'bg-[#F7E328]' : 'bg-white'
                }`}
                style={{ width: '100%' }}
              />
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fillProgress {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </section>
  );
};

export default HeroSlider;