import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

const SubNav = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeTag = searchParams.get('tag');

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getTags(language)
      .then(data => setTags(data || []))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, [language]);

  const handleTagClick = (tagLabel) => {
    if (activeTag === tagLabel && location.pathname === '/tag-results') {
      navigate('/');
    } else {
      navigate(`/tag-results?tag=${encodeURIComponent(tagLabel)}&lang=${language}`);
    }
  };

  if (loading) {
    return <div className="border-b border-[rgba(252,242,237,0.05)]" style={{ height: '44px' }} />;
  }

  if (tags.length === 0) return null;

  return (
    <div
      className="border-b border-[rgba(252,242,237,0.05)]"
      style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <style>{`.subnav-track::-webkit-scrollbar { display: none; }`}</style>

      <div
        style={{
          width: '700px',
          display: 'flex',
          alignItems: 'center',
          paddingInline: '16px',
          gap: '10px',
          overflow: 'hidden',
        }}
      >
        {/* ── Fixed label + arrow ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'Lyon, serif',
              fontSize: '0.72rem',
              color: 'rgba(137,137,137,0.55)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}
          >
            {language === 'ar' ? 'الأكْثَر رَوَاجاً' : 'Most Popular'}
             
          </span>

          {/* Arrow — thin SVG chevron */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0, opacity: 0.35 }}
          >
            <path
              d="M4 2.5L7.5 6L4 9.5"
              stroke="#FCF2ED"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Thin divider */}
        <span
          style={{
            width: '1px',
            height: '14px',
            background: 'rgba(137,137,137,0.2)',
            flexShrink: 0,
          }}
        />

        {/* ── Scrollable tags ── */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
          }}
        >
          <ul
            className="subnav-track"
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              margin: 0,
              padding: 0,
              listStyle: 'none',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {tags.map((item, index) => {
              const label = item.tag;
              const isActive = activeTag === label && location.pathname === '/tag-results';

              return (
                <li
                  key={`${label}-${index}`}
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <button
                    onClick={() => handleTagClick(label)}
                    style={{
                      fontFamily: 'Lyon, serif',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      padding: '4px 14px',
                      borderRadius: '999px',
                      border: isActive ? '1px solid #CCF47F' : '1px solid rgba(137,137,137,0.3)',
                      background: isActive ? '#CCF47F' : 'transparent',
                      color: isActive ? '#161616' : '#898989',
                      cursor: 'pointer',
                      letterSpacing: '0.01em',
                      transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                      whiteSpace: 'nowrap',
                      lineHeight: 1,
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(252,242,237,0.35)';
                        e.currentTarget.style.color = '#FCF2ED';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'rgba(137,137,137,0.3)';
                        e.currentTarget.style.color = '#898989';
                      }
                    }}
                  >
                    {label}
                  </button>

                  {index < tags.length - 1 && (
                    <span
                      aria-hidden
                      style={{
                        display: 'inline-block',
                        width: '3px',
                        height: '3px',
                        borderRadius: '50%',
                        background: 'rgba(137,137,137,0.25)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubNav;