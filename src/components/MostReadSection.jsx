import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { Link } from 'react-router-dom';

const categoryColors = {
  tech: 'bg-[#4469F2] text-white', horizons: 'bg-[#F7E328] text-black',
  social: 'bg-[#E20E3C] text-white', podcast: 'bg-[#CCF47F] text-black', home: 'bg-white/10 text-white',
};

const MostReadSection = () => {
  const { t, dir, language } = useLanguage();
  const { data: items } = useFetch(() => api.getMostRead(language), [language]);

  const [activeIdx, setActiveIdx] = useState(0);
  const activeItem = items?.[activeIdx];

  if (!items?.length) return null;

  return (
    <section className="mb-10 sm:mb-12 md:mb-16">
      <div className="flex justify-end mb-4 sm:mb-5">
        <h2
          className="font-black text-2xl sm:text-3xl md:text-[2.5rem]"
          style={{ fontFamily: 'Lyon, serif' }}
        >
          {t.mostRead.title}
        </h2>
      </div>

      <div className="flex rounded-2xl overflow-hidden bg-[#1e1e1e] h-[200px] sm:h-[220px] md:h-[240px]">

        {/* الصورة */}
        <div className="w-[30%] sm:w-[33%] md:w-[35%] relative flex-shrink-0">
          <div
            className="w-full h-full bg-cover bg-center transition-all duration-500"
            style={{ backgroundImage: `url('${activeItem?.thumbnail}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#161616]/40" />
        </div>

        {/* الليستة */}
        <div
          className="flex-1 flex flex-col overflow-y-auto bg-[#161616]"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
        >
          {items.map((item, index) => (
            <Link
              to={`/article/${item._id}`}
              key={item._id}
              className="relative flex-1 flex flex-col justify-center px-3 sm:px-5 md:px-8 py-3 sm:py-4 md:py-6 border-b border-white/5 cursor-pointer transition-colors duration-200 hover:bg-[#2a2a2a]"
              onMouseEnter={() => setActiveIdx(index)}
            >
              <span
                className="absolute top-1/2 -translate-y-1/2 font-black pointer-events-none select-none"
                style={{
                  fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                  color: 'rgba(255,255,255,0.04)',
                  fontFamily: 'Arial, sans-serif',
                  [dir === 'rtl' ? 'left' : 'right']: '12px',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="relative z-10">
                <span className={`inline-block text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold mb-1.5 sm:mb-2.5 ${categoryColors[item.category] || categoryColors.home}`}>
                  {item.category == "documentary" ? t.categories[item.category] : t.categories[item.category]}
                </span>
                <h3
                  className="font-extrabold text-sm sm:text-base md:text-xl leading-snug text-[#FCF2ED] line-clamp-2"
                  style={{ fontFamily: 'Lyon, serif' }}
                >
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default MostReadSection;