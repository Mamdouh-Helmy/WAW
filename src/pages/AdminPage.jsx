import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AdminArticles from '../components/admin/AdminArticles';
import AdminNewArticle from '../components/admin/AdminNewArticle';
import AdminPodcasts from '../components/admin/AdminPodcasts';
import AdminUsers from '../components/admin/AdminUsers';
import AdminFooter from '../components/admin/AdminFooter';
import AdminReels from '../components/admin/AdminReels';
import logo from "../../public/Logo WAW.webp";

/* ─── Nav config ─────────────────────────────────────────────────────────── */
const NAV = [
  {
    section: 'المحتوى',
    items: [
      { path: '/admin',          label: 'الرئيسية',  icon: 'fa-house',       exact: true },
      { path: '/admin/articles', label: 'المقالات',  icon: 'fa-newspaper' },
      { path: '/admin/new',      label: 'مقال جديد', icon: 'fa-plus' },
      { path: '/admin/podcasts', label: 'البودكاست', icon: 'fa-podcast' },
      { path: '/admin/reels', label: 'الريلزدي', icon: 'fa-film' },

    ],
  },
  {
    section: 'النظام',
    items: [
      { path: '/admin/users',  label: 'المستخدمون', icon: 'fa-users' },
      { path: '/admin/footer', label: 'الفوتر',     icon: 'fa-layer-group' },
    ],
  },
];

const NAV_FLAT = NAV.flatMap(g => g.items);

const CRUMB_MAP = {
  '/admin':          'الرئيسية',
  '/admin/articles': 'المقالات',
  '/admin/new':      'مقال جديد',
  '/admin/podcasts': 'البودكاست',
  '/admin/users':    'المستخدمون',
  '/admin/footer':   'الفوتر',
  '/admin/reels': 'الريلزدي',
};

/* ─── Constants ───────────────────────────────────────────────────────────── */
const SIDEBAR_OPEN   = 256; // px — expanded
const SIDEBAR_CLOSED =  68; // px — collapsed icon rail

/* ─── Hook: screen size ───────────────────────────────────────────────────── */
const useBreakpoint = () => {
  const [bp, setBp] = useState(() => ({
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
  }));
  useEffect(() => {
    const handler = () =>
      setBp({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return bp;
};

/* ─── Mobile Overlay Backdrop ────────────────────────────────────────────── */
const Backdrop = ({ visible, onClick }) =>
  visible ? (
    <div
      onClick={onClick}
      className="fixed inset-0 z-40"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
    />
  ) : null;

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
const Sidebar = ({ open, setOpen, user, onLogout, location, isMobile, isTablet }) => {
  const isActive = (path, exact) =>
    exact
      ? location.pathname === path
      : location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin');

  const drawerOpen = isMobile && open;
  const showLabels = drawerOpen || (!isMobile && open);

  const TRANSITION = '0.3s cubic-bezier(.4,0,.2,1)';

  const sidebarStyle = isMobile
    ? {
        width: 280,
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: `transform ${TRANSITION}`,
        background: 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: drawerOpen ? '-4px 0 40px rgba(0,0,0,0.4)' : 'none',
        zIndex: 50,
        overflow: 'hidden',
      }
    : {
        width: open ? SIDEBAR_OPEN : SIDEBAR_CLOSED,
        transition: `width ${TRANSITION}`,
        background: 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-4px 0 40px rgba(0,0,0,0.3)',
        zIndex: 50,
        overflow: 'hidden',
      };

  const positionClass = 'fixed top-0 right-0 bottom-0';

  return (
    <>
      <Backdrop visible={isMobile && drawerOpen} onClick={() => setOpen(false)} />
      <aside className={`${positionClass} flex flex-col z-50`} style={sidebarStyle}>

        {/* Logo */}
        <div className={`flex items-center border-b border-white/[0.08] min-h-[64px] px-3
          ${showLabels ? 'justify-between' : 'justify-center'}
        `}>
          {showLabels && (
            <div className="flex items-center gap-2.5">
              <img
                src={logo}
                alt="WAW Logo"
                className="w-9 h-9 rounded-[10px] object-cover flex-shrink-0"
                style={{ boxShadow: '0 0 20px rgba(204,244,127,0.25)' }}
              />
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[#FCF2ED] font-black text-[17px] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>واو</span>
                  <span className="text-[9px] font-bold text-[#CCF47F] tracking-widest uppercase px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(204,244,127,0.15)', border: '1px solid rgba(204,244,127,0.3)' }}>
                    ADMIN
                  </span>
                </div>
                <div className="text-[10px] text-[#555] mt-0.5">Content Management</div>
              </div>
            </div>
          )}
          {!showLabels && (
            <img
              src={logo}
              alt="WAW Logo"
              className="w-8 h-8 rounded-[8px] object-cover"
              style={{ boxShadow: '0 0 16px rgba(204,244,127,0.2)' }}
            />
          )}
          {!isMobile && (
            <button
              onClick={() => setOpen(p => !p)}
              className={`w-7 h-7 rounded-[7px] flex items-center justify-center text-[#555] hover:text-[#FCF2ED] transition-all flex-shrink-0 ${!showLabels ? 'mt-2' : ''}`}
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <i className={`fa-solid fa-${showLabels ? 'chevron-right' : 'chevron-left'} text-[10px]`} />
            </button>
          )}
          {isMobile && (
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[#555] hover:text-[#FCF2ED] transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <i className="fa-solid fa-xmark text-[11px]" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden">
          {NAV.map(group => (
            <div key={group.section} className="mb-2">
              {showLabels && (
                <p className="text-[9px] font-bold text-[#555] uppercase tracking-[2px] px-3 py-2">
                  {group.section}
                </p>
              )}
              {group.items.map(item => {
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobile && setOpen(false)}
                    title={!showLabels ? item.label : undefined}
                    className={`
                      flex items-center gap-2.5 rounded-[10px] mb-0.5 relative overflow-hidden
                      ${showLabels ? 'px-3 py-2.5' : 'justify-center py-2.5'}
                      ${active ? 'text-[#CCF47F]' : 'text-[#666] hover:text-[#aaa]'}
                      transition-all duration-150
                    `}
                    style={{
                      background: active ? 'rgba(204,244,127,0.08)' : 'transparent',
                      border: active ? '1px solid rgba(204,244,127,0.15)' : '1px solid transparent',
                    }}
                  >
                    {active && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at 90% 50%, rgba(204,244,127,0.08) 0%, transparent 70%)' }} />
                    )}
                    <div className={`
                      w-[28px] h-[28px] rounded-[8px] flex items-center justify-center flex-shrink-0
                      ${active ? 'text-[#CCF47F]' : 'text-[#555]'}
                      transition-colors duration-150
                    `} style={{ background: active ? 'rgba(204,244,127,0.15)' : 'rgba(255,255,255,0.05)' }}>
                      <i className={`fa-solid ${item.icon} text-[12px]`} />
                    </div>
                    {showLabels && (
                      <span className="text-[13px] font-medium flex-1 whitespace-nowrap">{item.label}</span>
                    )}
                    {showLabels && active && (
                      <div className="w-[5px] h-[5px] rounded-full bg-[#CCF47F] ml-1"
                        style={{ boxShadow: '0 0 8px #CCF47F' }} />
                    )}
                  </Link>
                );
              })}
              {showLabels && (
                <div className="h-px mx-1 mt-2 mb-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/[0.08] p-2.5">
          {showLabels ? (
            <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-[#CCF47F]"
                style={{
                  background: 'linear-gradient(135deg, rgba(204,244,127,0.2) 0%, rgba(204,244,127,0.05) 100%)',
                  border: '1px solid rgba(204,244,127,0.2)',
                }}>
                {(user?.name || user?.email || 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#ccc] truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-[#555] truncate">{user?.email}</p>
              </div>
              <button onClick={onLogout}
                className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-[#555] hover:text-[#E20E3C] transition-all flex-shrink-0"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <i className="fa-solid fa-right-from-bracket text-[10px]" />
              </button>
            </div>
          ) : (
            <button onClick={onLogout}
              className="w-full h-10 rounded-[10px] flex items-center justify-center text-[#555] hover:text-[#E20E3C] transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <i className="fa-solid fa-right-from-bracket text-sm" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

/* ─── Mobile Bottom Nav ──────────────────────────────────────────────────── */
const MobileBottomNav = ({ location }) => {
  const isActive = (path, exact) =>
    exact
      ? location.pathname === path
      : location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin');

  const bottomItems = NAV_FLAT.slice(0, 5);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 pt-2 pb-safe"
      style={{
        background: 'rgba(18,18,18,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        minHeight: 60,
      }}
    >
      {bottomItems.map(item => {
        const active = isActive(item.path, item.exact);
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
            style={{ minWidth: 44 }}
          >
            <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center transition-all ${active ? 'text-[#CCF47F]' : 'text-[#555]'}`}
              style={{ background: active ? 'rgba(204,244,127,0.12)' : 'transparent' }}>
              <i className={`fa-solid ${item.icon} text-[13px]`} />
            </div>
            <span className={`text-[9px] font-medium leading-none ${active ? 'text-[#CCF47F]' : 'text-[#555]'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

/* ─── Topbar ─────────────────────────────────────────────────────────────── */
const Topbar = ({ location, user, onMenuOpen, isMobile }) => {
  const label = CRUMB_MAP[location.pathname] || '';
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-[56px] md:h-[60px]"
      style={{
        background: 'rgba(18,18,18,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2 md:gap-3">
        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            onClick={onMenuOpen}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#666] hover:text-[#aaa] transition-all ml-1"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <i className="fa-solid fa-bars text-[12px]" />
          </button>
        )}
        <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-[8px]"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={logo} alt="WAW Logo" className="w-4 h-4 md:w-5 md:h-5 rounded-[4px] object-cover" />
          <span className="text-[10px] md:text-[11px] text-[#666]">واو</span>
          <span className="text-[9px] md:text-[10px] text-[#444]">›</span>
          <span className="text-[11px] md:text-[12px] text-[#aaa] font-medium">{label}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Date — hidden on small mobile */}
        <span className="hidden sm:inline text-[11px] text-[#555]">{dateStr}</span>
        <div className="hidden sm:block w-px h-4 bg-white/[0.08]" />
        <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(204,244,127,0.1)', border: '1px solid rgba(204,244,127,0.2)' }}>
          <div className="w-[5px] h-[5px] rounded-full bg-[#CCF47F]"
            style={{ boxShadow: '0 0 6px #CCF47F' }} />
          <span className="text-[10px] md:text-[11px] font-semibold text-[#CCF47F]">
            {user?.role === 'admin' ? 'أدمن' : 'مستخدم'}
          </span>
        </div>
      </div>
    </header>
  );
};

/* ─── Layout ─────────────────────────────────────────────────────────────── */
const AdminPage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const [open, setOpen] = useState(!isTablet && !isMobile);

  /* Auto-close sidebar on mobile when navigating */
  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [location.pathname, isMobile]);

  /* On desktop resize, auto-open */
  useEffect(() => {
    if (!isMobile && !isTablet) setOpen(true);
  }, [isMobile, isTablet]);

  const sidebarOffset = isMobile ? 0 : open ? SIDEBAR_OPEN : SIDEBAR_CLOSED;

  return (
    <div className="min-h-screen flex" style={{ background: '#121212' }} dir="rtl">
      <Sidebar
        open={open}
        setOpen={setOpen}
        user={user}
        onLogout={() => { logout(); navigate('/login'); }}
        location={location}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <main
        className="flex-1 min-h-screen flex flex-col"
        style={{
          marginRight: sidebarOffset,
          transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <Topbar
          location={location}
          user={user}
          onMenuOpen={() => setOpen(true)}
          isMobile={isMobile}
        />

        <div
          className="flex-1 p-4 md:p-6 lg:p-7"
          style={{ paddingBottom: isMobile ? '80px' : undefined }}
        >
          <Routes>
            <Route index           element={<AdminDashboard />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="new"      element={<AdminNewArticle />} />
            <Route path="edit/:id" element={<AdminNewArticle />} />
            <Route path="podcasts" element={<AdminPodcasts />} />
            <Route path="users"    element={<AdminUsers />} />
            <Route path="footer"   element={<AdminFooter />} />
            <Route path="reels" element={<AdminReels />} />
          </Routes>
        </div>
      </main>

      {/* Mobile bottom nav */}
      {isMobile && <MobileBottomNav location={location} />}
    </div>
  );
};

/* ─── Dashboard ──────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [stats, setStats]     = useState({ articles: null, published: null, podcasts: null, users: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [arts, pods, usrs] = await Promise.allSettled([
          api.getAdminArticles(1),
          api.getAdminPodcasts(),
          api.getUsers({ limit: 1 }),
        ]);
        const a = arts.status === 'fulfilled' ? arts.value : null;
        const p = pods.status === 'fulfilled' ? pods.value : null;
        const u = usrs.status === 'fulfilled' ? usrs.value : null;
        setStats({
          articles:  a?.total ?? '—',
          published: a?.articles?.filter(x => x.isPublished).length ?? '—',
          podcasts:  Array.isArray(p) ? p.length : (p?.total ?? '—'),
          users:     u?.total ?? '—',
        });
      } finally { setLoading(false); }
    })();
  }, []);

  const STATS = [
    { label: 'إجمالي المقالات', key: 'articles',  color: '#4469F2', icon: 'fa-newspaper',   trend: '+12%' },
    { label: 'مقالات منشورة',   key: 'published', color: '#CCF47F', icon: 'fa-circle-check', trend: '+5%'  },
    { label: 'حلقات البودكاست', key: 'podcasts',  color: '#F7E328', icon: 'fa-podcast',      trend: '+3%'  },
    { label: 'المستخدمون',      key: 'users',     color: '#F2A544', icon: 'fa-users',        trend: '+8%'  },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <p className="text-[10px] font-bold text-[#555] uppercase tracking-[3px] mb-2">Dashboard</p>
          <h1
            className="text-[28px] sm:text-[34px] md:text-[38px] font-black text-[#FCF2ED] leading-none tracking-tight m-0"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            لوحة التحكم
          </h1>
          <p className="text-[12px] md:text-[13px] text-[#666] mt-2">مرحباً بك في واو — إدارة المحتوى الكاملة</p>
        </div>
        <Link
          to="/admin/new"
          className="self-start sm:self-auto flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-[13px] font-bold text-black no-underline transition-all hover:-translate-y-0.5 whitespace-nowrap"
          style={{ background: '#CCF47F', boxShadow: '0 4px 24px rgba(204,244,127,0.28)' }}
        >
          <i className="fa-solid fa-plus text-[11px]" />
          مقال جديد
        </Link>
      </div>

      {/* Stats Grid — 1 col mobile, 2 col sm, 4 col lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-7">
        {STATS.map(s => (
          <div
            key={s.key}
            className="rounded-2xl p-4 md:p-5 relative overflow-hidden transition-all duration-200 cursor-default group"
            style={{
              background: 'linear-gradient(145deg, #1e1e1e 0%, #181818 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            {/* Corner glow */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
              style={{ background: s.color, opacity: 0.08, filter: 'blur(20px)' }} />

            <div className="flex items-start justify-between mb-4 md:mb-5">
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                style={{ background: s.color + '1A', border: `1px solid ${s.color}30` }}>
                <i className={`fa-solid ${s.icon} text-[13px]`} style={{ color: s.color }} />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                {s.trend}
              </span>
            </div>

            {loading ? (
              <div className="h-9 w-12 rounded-md mb-1 animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
            ) : (
              <p className="text-[36px] md:text-[40px] font-black text-[#FCF2ED] leading-none mb-1.5"
                style={{ fontFamily: 'Georgia, serif' }}>
                {stats[s.key]}
              </p>
            )}
            <p className="text-[11px] text-[#666] font-medium">{s.label}</p>

            <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)` }} />
          </div>
        ))}
      </div>

      {/* System Flowchart */}
      <p className="text-[9px] font-bold text-[#555] uppercase tracking-[3px] mb-3">System Overview</p>
      <SystemFlowchart />
    </div>
  );
};

/* ─── System Flowchart ───────────────────────────────────────────────────── */
const SystemFlowchart = () => {
  const [hoveredNode, setHoveredNode] = useState(null);

  /* Use container width to decide layout — more reliable than breakpoint hook */
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const isSmall = containerWidth < 600; // card/mobile view
  const isMed   = containerWidth >= 600 && containerWidth < 900; // compact SVG

  /* ── Data ── */
  const LAYERS = [
    {
      label: 'Entry',
      items: [
        { id: 'user', label: 'زيارة الموقع', color: '#CCF47F', desc: 'المستخدم العام' },
      ],
    },
    {
      label: 'View',
      items: [
        { id: 'frontend', label: 'Frontend',    color: '#4469F2', desc: 'React + Vite' },
        { id: 'admin',    label: 'Admin Panel', color: '#E879F9', desc: 'لوحة التحكم' },
      ],
    },
    {
      label: 'API',
      items: [
        { id: 'api', label: 'REST API /api/*', color: '#F2A544', desc: 'Express.js' },
      ],
    },
    {
      label: 'Services',
      items: [
        { id: 'auth',     label: 'Auth / JWT',  color: '#E20E3C', desc: 'JWT حماية' },
        { id: 'upload',   label: 'Cloudinary',  color: '#60a5fa', desc: 'رفع الصور' },
        { id: 'mongo',    label: 'MongoDB',     color: '#4ade80', desc: 'قاعدة البيانات' },
        { id: 'footer_s', label: 'Footer API',  color: '#f59e0b', desc: 'إعدادات الفوتر' },
      ],
    },
    {
      label: 'Models',
      items: [
        { id: 'art_m',   label: 'Articles',       color: '#4469F2', desc: 'نموذج المقالات' },
        { id: 'pod_m',   label: 'Podcasts',       color: '#F7E328', desc: 'نموذج البودكاست' },
        { id: 'usr_m',   label: 'Users',          color: '#F2A544', desc: 'نموذج المستخدمين' },
        { id: 'ftset_m', label: 'FooterSettings', color: '#f59e0b', desc: 'إعدادات الفوتر' },
        { id: 'img_m',   label: 'Images',         color: '#60a5fa', desc: 'Cloudinary صور' },
      ],
    },
  ];

  const LEGEND = [
    { color: '#CCF47F', label: 'Entry' },
    { color: '#4469F2', label: 'Frontend' },
    { color: '#E879F9', label: 'Admin' },
    { color: '#F2A544', label: 'API' },
    { color: '#4ade80', label: 'Database' },
    { color: '#60a5fa', label: 'Media' },
    { color: '#f59e0b', label: 'Footer' },
  ];

  /* ── SVG node positions (full size) ── */
  const SVG_NODES = [
    { id: 'user',     x: 310, y: 16,  w: 140, h: 36 },
    { id: 'frontend', x: 140, y: 90,  w: 140, h: 36 },
    { id: 'admin',    x: 480, y: 90,  w: 140, h: 36 },
    { id: 'api',      x: 260, y: 166, w: 240, h: 36 },
    { id: 'auth',     x: 20,  y: 244, w: 120, h: 36 },
    { id: 'upload',   x: 160, y: 244, w: 120, h: 36 },
    { id: 'mongo',    x: 300, y: 244, w: 120, h: 36 },
    { id: 'footer_s', x: 440, y: 244, w: 120, h: 36 },
    { id: 'art_m',    x: 10,  y: 322, w: 100, h: 32 },
    { id: 'pod_m',    x: 120, y: 322, w: 100, h: 32 },
    { id: 'usr_m',    x: 230, y: 322, w: 100, h: 32 },
    { id: 'ftset_m',  x: 340, y: 322, w: 120, h: 32 },
    { id: 'img_m',    x: 470, y: 322, w: 100, h: 32 },
  ];

  const SVG_EDGES = [
    { from: 'user', to: 'frontend' }, { from: 'user', to: 'admin' },
    { from: 'frontend', to: 'api' }, { from: 'admin', to: 'api' },
    { from: 'api', to: 'auth' }, { from: 'api', to: 'upload' },
    { from: 'api', to: 'mongo' }, { from: 'api', to: 'footer_s' },
    { from: 'mongo', to: 'art_m' }, { from: 'mongo', to: 'pod_m' },
    { from: 'mongo', to: 'usr_m' }, { from: 'mongo', to: 'ftset_m' },
    { from: 'upload', to: 'img_m' }, { from: 'footer_s', to: 'ftset_m' },
  ];

  /* Combine SVG geometry with layer color/label data */
  const allLayerItems = LAYERS.flatMap(l => l.items);
  const nodes = SVG_NODES.map(sn => ({
    ...sn,
    ...allLayerItems.find(li => li.id === sn.id),
  }));
  const getNode = id => nodes.find(n => n.id === id);
  const cx = n => n.x + n.w / 2;
  const cy = n => n.y + n.h / 2;

  const SVG_W = 580;
  const SVG_H = 374;

  /* ── Card (small screens) ── */
  const CardView = () => (
    <div className="flex flex-col gap-2.5">
      {LAYERS.map((layer, li) => (
        <div key={layer.label}>
          {/* Layer label */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-[9px] font-bold text-[#444] uppercase tracking-[2px] px-2">
              {layer.label}
            </span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>
          {/* Nodes */}
          <div className="flex flex-wrap justify-center gap-2">
            {layer.items.map(n => (
              <div
                key={n.id}
                className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
                style={{
                  background: n.color + '10',
                  border: `1px solid ${n.color}30`,
                  minWidth: 120,
                }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color, boxShadow: `0 0 6px ${n.color}80` }} />
                <div>
                  <p className="text-[11px] font-semibold leading-none" style={{ color: n.color }}>{n.label}</p>
                  <p className="text-[9px] text-[#555] mt-0.5 leading-none">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Arrow connector */}
          {li < LAYERS.length - 1 && (
            <div className="flex flex-col items-center mt-2 gap-0.5">
              <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '5px solid rgba(255,255,255,0.15)' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  /* ── SVG flowchart (medium + large screens) ── */
  const SvgView = () => (
    <div style={{ overflowX: isMed ? 'auto' : 'visible' }}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{
          width: '100%',
          height: 'auto',
          minWidth: isMed ? 520 : 'unset',
          maxHeight: 374,
          display: 'block',
        }}
      >
        <defs>
          {nodes.map(n => (
            <linearGradient key={n.id + '_g'} id={`grad_${n.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={n.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={n.color} stopOpacity="0.06" />
            </linearGradient>
          ))}
          <marker id="arr"  markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.18)" />
          </marker>
          <marker id="arr_h" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#CCF47F" />
          </marker>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="2.5" result="cb" />
            <feMerge><feMergeNode in="cb" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {SVG_EDGES.map((e, i) => {
          const from = getNode(e.from); const to = getNode(e.to);
          if (!from || !to) return null;
          const x1 = cx(from), y1 = from.y + from.h - 2;
          const x2 = cx(to),   y2 = to.y + 2;
          const my = (y1 + y2) / 2;
          const active = hoveredNode === e.from || hoveredNode === e.to;
          return (
            <path key={i}
              d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`}
              fill="none"
              stroke={active ? '#CCF47F' : 'rgba(255,255,255,0.1)'}
              strokeWidth={active ? 1.5 : 1}
              markerEnd={active ? 'url(#arr_h)' : 'url(#arr)'}
              style={{ transition: 'stroke .2s' }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const isHov = hoveredNode === n.id;
          return (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'default' }}
            >
              {isHov && (
                <ellipse cx={n.w/2} cy={n.h/2} rx={n.w/2+8} ry={n.h/2+8}
                  fill={n.color} opacity="0.1" filter="url(#glow2)" />
              )}
              <rect width={n.w} height={n.h} rx="8"
                fill={isHov ? `url(#grad_${n.id})` : 'rgba(255,255,255,0.04)'}
                stroke={isHov ? n.color : 'rgba(255,255,255,0.09)'}
                strokeWidth={isHov ? 1.5 : 1}
                style={{ transition: 'all .2s' }}
              />
              {/* Color dot */}
              <circle cx="14" cy={n.h/2} r="3.5"
                fill={n.color} opacity={isHov ? 1 : 0.65} />
              {/* Label */}
              <text
                x={n.w/2 + 5} y={n.h/2 + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="10.5" fontWeight="600"
                fill={isHov ? n.color : '#999'}
                style={{ transition: 'fill .2s', fontFamily: 'system-ui, sans-serif' }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );

  return (
    <div ref={containerRef}
      className="rounded-[18px] p-4 md:p-5 relative overflow-hidden"
      style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <p className="text-[9px] font-bold text-[#555] uppercase tracking-[3px]">System Architecture</p>
          <h3 className="text-[14px] md:text-[15px] font-black text-[#FCF2ED] mt-0.5"
            style={{ fontFamily: 'Georgia, serif' }}>
            هيكل النظام
          </h3>
        </div>
        {hoveredNode && !isSmall && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[9px]"
            style={{
              background: getNode(hoveredNode)?.color + '15',
              border: `1px solid ${getNode(hoveredNode)?.color}30`,
            }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: getNode(hoveredNode)?.color }} />
            <span className="text-[11px] text-[#bbb]">{getNode(hoveredNode)?.desc}</span>
          </div>
        )}
      </div>

      {/* Content — card on small, SVG on medium+ */}
      {isSmall ? <CardView /> : <SvgView />}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {LEGEND.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-[9px] text-[#555]">{l.label}</span>
          </div>
        ))}
        {!isSmall && (
          <span className="mr-auto text-[9px] text-[#333] italic">مرر على أي عنصر لعرض التفاصيل</span>
        )}
      </div>
    </div>
  );
};

export default AdminPage;