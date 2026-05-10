import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import NavDropdown from './NavDropdown';
import logo from "../../public/Logo WAW.webp";

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const avatarSrc = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE}${path}`;
};

// ── Search Component ──────────────────────────────────────────────────────────
const SearchBar = ({ onClose, language, dir }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.searchArticles(query, language);
        setResults(data);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, language]);

  const handleSelect = (id) => { navigate(`/article/${id}`); onClose(); };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', paddingTop: '15vh',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <div style={{ width: '100%', maxWidth: 580, padding: '0 16px', animation: 'slideDown 0.2s ease' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#1e1e1e',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16, padding: '12px 16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {loading
            ? <i className="fa-solid fa-spinner fa-spin" style={{ color: '#CCF47F', fontSize: 16 }} />
            : <i className="fa-solid fa-search" style={{ color: '#555', fontSize: 16 }} />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث عن مقال...' : 'Search articles...'}
            onKeyDown={e => e.key === 'Escape' && onClose()}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#FCF2ED', fontSize: 16, fontFamily: 'Lyon, serif', direction: dir,
            }}
          />
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.07)', border: 'none',
            borderRadius: 8, padding: '4px 9px', color: '#666',
            cursor: 'pointer', fontSize: 12, fontFamily: 'monospace',
          }}>ESC</button>
        </div>

        {results.length > 0 && (
          <div style={{
            marginTop: 10, background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            {results.map((item, i) => (
              <div
                key={item._id}
                onClick={() => handleSelect(item._id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', cursor: 'pointer',
                  borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition: 'background 0.15s', direction: dir,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                  backgroundImage: item.thumbnail ? `url('${item.thumbnail}')` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!item.thumbnail && <i className="fa-solid fa-image" style={{ color: '#444', fontSize: 14 }} />}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{
                    color: '#FCF2ED', fontSize: 14, fontFamily: 'Lyon, serif',
                    fontWeight: 600, margin: 0,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{item.title}</p>
                </div>
                <i className={`fa-solid fa-chevron-${dir === 'rtl' ? 'left' : 'right'}`} style={{ color: '#444', fontSize: 11 }} />
              </div>
            ))}
          </div>
        )}

        {query.trim() && !loading && results.length === 0 && (
          <div style={{
            marginTop: 10, padding: '20px', textAlign: 'center',
            color: '#555', fontSize: 14, background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
          }}>
            <i className="fa-solid fa-face-meh" style={{ fontSize: 24, marginBottom: 8, display: 'block' }} />
            {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
          </div>
        )}

        {!query && (
          <p style={{ textAlign: 'center', color: '#333', fontSize: 13, marginTop: 16 }}>
            {language === 'ar' ? 'ابدأ الكتابة للبحث...' : 'Start typing to search...'}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Header ────────────────────────────────────────────────────────────────────
const Header = () => {
  const { language, toggleLanguage, t, dir } = useLanguage();
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [lastScroll,   setLastScroll]   = useState(0);
  const [navHidden,    setNavHidden]    = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const userMenuRef = useRef(null);

  // إغلاق المنيو لما الشاشة تكبر
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const cur = window.pageYOffset;
      if (cur <= 0) { setNavHidden(false); return; }
      if (cur > lastScroll && cur > 80) setNavHidden(true);
      else if (cur < lastScroll)        setNavHidden(false);
      setLastScroll(cur <= 0 ? 0 : cur);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // منع الـ scroll لما المنيو مفتوح على موبايل
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navItems = [
    { path: '/',         label: t.nav.home,     color: 'lime',     dropdown: null },
    { path: '/tech',     label: t.nav.tech,     color: 'blue',     dropdown: 'tech' },
    { path: '/cultural', label: t.nav.horizons, color: 'yellow',   dropdown: 'cultural' },
    { path: '/social',   label: t.nav.social,   color: 'red',      dropdown: 'social' },
    { path: '/podcast',  label: t.nav.podcast,  color: 'phosphor', dropdown: null },
  ];

  const isActive = (path) => location.pathname === path;

  const getColorClasses = (color, active) => {
    const colors = {
      lime:     active ? 'bg-[#CCF47F] text-[#161616]' : 'border border-[#CCF47F] hover:bg-[#CCF47F] hover:text-[#161616]',
      blue:     active ? 'bg-[#4469F2] text-white'     : 'border border-[#4469F2] hover:bg-[#4469F2] hover:text-white',
      yellow:   active ? 'bg-[#F7E328] text-black'     : 'border border-[#F7E328] hover:bg-[#F7E328] hover:text-black',
      red:      active ? 'bg-[#E20E3C] text-white'     : 'border border-[#E20E3C] hover:bg-[#E20E3C] hover:text-white',
      phosphor: active ? 'bg-[#CCF47F] text-black'     : 'border border-[#CCF47F] hover:bg-[#CCF47F] hover:text-black',
    };
    return colors[color] || '';
  };

  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate('/'); };

  const PALETTE     = ['#CCF47F','#4469F2','#F7E328','#F2A544','#E20E3C','#0ea5e9','#a855f7'];
  const avatarColor = (str = '') => PALETTE[str.charCodeAt(0) % PALETTE.length];
  const userColor   = avatarColor(user?.name || user?.email || '');
  const userInitial = (user?.name || user?.email || '?')[0].toUpperCase();
  const userAvatar  = avatarSrc(user?.avatar);

  const AvatarCircle = ({ size = 28 }) =>
    userAvatar ? (
      <img src={userAvatar} alt={user?.name || 'avatar'} style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', border: `1.5px solid ${userColor}60`, flexShrink: 0,
      }} />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: userColor + '20', border: `1.5px solid ${userColor}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4, fontWeight: 700, color: userColor,
      }}>{userInitial}</div>
    );

  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 ${
        isActive(item.path)
          ? getColorClasses(item.color, true)
          : `text-[#FCF2ED] ${getColorClasses(item.color, false)}`
      }`}
      style={{ fontFamily: 'Lyon, serif', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}
    >
      {item.label}
      {item.dropdown && (
        <i className="fa-solid fa-chevron-down" style={{ fontSize: 8, opacity: 0.6 }} />
      )}
    </Link>
  );

  return (
    <>
      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} language={language} dir={dir} />}

      <header className={`bg-[#161616] sticky top-0 z-50 border-b border-[rgba(252,242,237,0.05)] transition-transform duration-300 ${navHidden ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="w-full px-4 sm:px-5" style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* ── الشريط الرئيسي ── */}
          <div className="flex items-center justify-between" style={{ height: '64px' }}>

            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src={logo} alt="WAW Logo" style={{ width: 80, height: 'auto' }} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <ul className="flex gap-2 lg:gap-4 items-center" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {navItems.map((item) => (
                  <li key={item.path} style={{ position: 'relative' }}>
                    {item.dropdown ? (
                      <NavDropdown category={item.dropdown} language={language} dir={dir}>
                        <NavLink item={item} />
                      </NavDropdown>
                    ) : (
                      <NavLink item={item} />
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <div
                className="cursor-pointer text-[#898989] font-bold transition-colors hover:text-[#FCF2ED]"
                onClick={toggleLanguage}
                style={{ fontFamily: "'Ko Sans', sans-serif", fontSize: '1rem' }}
              >
                {language === 'ar' ? 'EN' : 'AR'}
              </div>

              <button
                onClick={() => setSearchOpen(true)}
                className="text-[#898989] text-lg hover:text-[#FCF2ED] transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <i className="fa-solid fa-search" />
              </button>

              {user ? (
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserMenuOpen(prev => !prev)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 40, padding: '5px 12px 5px 6px',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(204,244,127,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <AvatarCircle size={28} />
                    <span style={{
                      fontSize: 12, color: '#ddd', fontFamily: "'Ko Sans', sans-serif",
                      maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{user.name || user.email}</span>
                    <i className="fa-solid fa-chevron-down" style={{
                      fontSize: 9, color: '#666', transition: 'transform 0.2s',
                      transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }} />
                  </button>

                  {userMenuOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 10px)',
                      [language === 'ar' ? 'left' : 'right']: 0,
                      width: 210, background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 14, boxShadow: '0 16px 50px rgba(0,0,0,0.5)',
                      overflow: 'hidden', zIndex: 100,
                      animation: 'fadeSlideDown 0.15s ease',
                    }}>
                      <style>{`@keyframes fadeSlideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>

                      <div style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <AvatarCircle size={36} />
                        <div style={{ overflow: 'hidden' }}>
                          <p style={{ fontSize: 13, color: '#ddd', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.name || '—'}
                          </p>
                          <p style={{ fontSize: 11, color: '#555', marginTop: 2, direction: 'ltr', textAlign: language === 'ar' ? 'right' : 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '11px 16px', fontSize: 13, color: '#CCF47F',
                          textDecoration: 'none', transition: 'background 0.15s',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(204,244,127,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <i className="fa-solid fa-shield-halved" style={{ fontSize: 11, width: 14, textAlign: 'center' }} />
                          {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                        </Link>
                      )}

                      <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '11px 16px', fontSize: 13, color: '#E20E3C',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        transition: 'background 0.15s',
                        textAlign: language === 'ar' ? 'right' : 'left',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,14,60,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 11, width: 14, textAlign: 'center' }} />
                        {t.auth?.logout || (language === 'ar' ? 'تسجيل الخروج' : 'Logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link to="/login-usears" style={{
                    padding: '7px 14px', borderRadius: 40, fontSize: 12, fontWeight: 600,
                    color: '#FCF2ED', border: '1px solid rgba(255,255,255,0.15)',
                    textDecoration: 'none', transition: 'all 0.2s',
                    fontFamily: "'Ko Sans', sans-serif",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#FCF2ED'; }}
                  >
                    {t.auth?.login || (language === 'ar' ? 'تسجيل الدخول' : 'Login')}
                  </Link>
                  <Link to="/register" style={{
                    padding: '7px 14px', borderRadius: 40, fontSize: 12, fontWeight: 700,
                    color: '#000', background: '#CCF47F', border: 'none',
                    textDecoration: 'none', transition: 'all 0.2s',
                    fontFamily: "'Ko Sans', sans-serif",
                    boxShadow: '0 3px 14px rgba(204,244,127,0.25)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#d8f98a'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(204,244,127,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#CCF47F'; e.currentTarget.style.boxShadow = '0 3px 14px rgba(204,244,127,0.25)'; }}
                  >
                    {t.auth?.register || (language === 'ar' ? 'حساب جديد' : 'Sign Up')}
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile: Search + Burger ── */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="text-[#898989] text-lg hover:text-[#FCF2ED] transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <i className="fa-solid fa-search" />
              </button>
              <button
                className="text-[#FCF2ED] text-xl"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <i className={`fa-solid ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
              </button>
            </div>

          </div>

          {/* ── Mobile Menu ── */}
          {menuOpen && (
            <div
              className="md:hidden pb-5 border-t border-[rgba(252,242,237,0.05)]"
              style={{ maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}
            >
              {/* Nav links */}
              <ul className="flex flex-col gap-2 mt-4" style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}>
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-2.5 rounded-full font-medium text-sm transition-all ${
                        isActive(item.path)
                          ? getColorClasses(item.color, true)
                          : `text-[#FCF2ED] ${getColorClasses(item.color, false)}`
                      }`}
                      style={{ fontFamily: 'Lyon, serif' }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* User / Auth section */}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {user ? (
                  <>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <AvatarCircle size={36} />
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: 13, color: '#ddd', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.name || '—'}
                        </p>
                        <p style={{ fontSize: 11, color: '#555', direction: 'ltr', textAlign: language === 'ar' ? 'right' : 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} style={{
                        display: 'block', textAlign: 'center', padding: '10px',
                        borderRadius: 12, border: '1px solid rgba(204,244,127,0.3)',
                        color: '#CCF47F', fontSize: 13, textDecoration: 'none',
                      }}>
                        <i className="fa-solid fa-shield-halved" style={{ marginInlineEnd: 8 }} />
                        {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                      </Link>
                    )}
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{
                      width: '100%', padding: '10px', borderRadius: 12,
                      border: '1px solid rgba(226,14,60,0.3)',
                      background: 'transparent', color: '#E20E3C', fontSize: 13, cursor: 'pointer',
                    }}>
                      <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginInlineEnd: 8 }} />
                      {t.auth?.logout || (language === 'ar' ? 'تسجيل الخروج' : 'Logout')}
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to="/login-usears" onClick={() => setMenuOpen(false)} style={{
                      flex: 1, textAlign: 'center', padding: '10px', borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.15)', color: '#FCF2ED',
                      fontSize: 13, textDecoration: 'none',
                    }}>
                      {t.auth?.login || (language === 'ar' ? 'تسجيل الدخول' : 'Login')}
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} style={{
                      flex: 1, textAlign: 'center', padding: '10px', borderRadius: 12,
                      background: '#CCF47F', color: '#000',
                      fontSize: 13, fontWeight: 700, textDecoration: 'none',
                    }}>
                      {t.auth?.register || (language === 'ar' ? 'حساب جديد' : 'Sign Up')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Language toggle */}
              <div className="flex items-center gap-5 mt-4">
                <div
                  className="cursor-pointer text-[#898989] text-lg font-bold"
                  onClick={toggleLanguage}
                  style={{ fontFamily: "'Ko Sans', sans-serif" }}
                >
                  {language === 'ar' ? 'EN' : 'AR'}
                </div>
              </div>
            </div>
          )}

        </div>
      </header>
    </>
  );
};

export default Header;