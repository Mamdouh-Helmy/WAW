import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import logo from "../../public/Logo WAW.png";

const Footer = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.getFooterSettings().then(setSettings).catch(() => {});
  }, []);

  const defaultSocials = [
    { icon: 'fa-brands fa-whatsapp',  url: '#' },
    { icon: 'fa-brands fa-x-twitter', url: '#' },
    { icon: 'fa-brands fa-instagram', url: '#' },
    { icon: 'fa-brands fa-tiktok',    url: '#' },
    { icon: 'fa-brands fa-youtube',   url: '#' },
  ];

  const socials = settings?.socialLinks?.filter(s => s.active).sort((a, b) => a.order - b.order)
    ?? defaultSocials;

  const exploreLinks   = settings?.footerLinks?.filter(l => l.section === 'explore'   && l.active).sort((a, b) => a.order - b.order) ?? [];
  const importantLinks = settings?.footerLinks?.filter(l => l.section === 'important' && l.active).sort((a, b) => a.order - b.order) ?? [];

  const description = language === 'en'
    ? (settings?.descriptionEn || settings?.description || t.footer.description)
    : (settings?.description   || t.footer.description);

  const renderLink = (item, idx) => {
    const label = language === 'en' ? (item.labelEn || item.label) : item.label;
    const cls   = "text-[#898989] text-sm hover:text-[#FCF2ED] transition-colors";
    return item.external || item.url?.startsWith('http') ? (
      <li key={idx}><a href={item.url} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a></li>
    ) : (
      <li key={idx}><Link to={item.url || '#'} className={cls}>{label}</Link></li>
    );
  };

  const staticExplore = [
    { label: t.nav.home,     url: '/' },
    { label: t.nav.tech,     url: '/tech' },
    { label: t.nav.horizons, url: '/horizons' },
    { label: t.nav.social,   url: '/social' },
  ];

  const staticImportant = [
    { label: t.footer.about,   url: '#' },
    { label: t.footer.terms,   url: '#' },
    { label: t.footer.privacy, url: '#' },
    { label: t.footer.cookies, url: '#' },
  ];

  const finalExplore   = exploreLinks.length   > 0 ? exploreLinks   : staticExplore;
  const finalImportant = importantLinks.length  > 0 ? importantLinks : staticImportant;

  return (
    <footer className="bg-[#0b0c0d] py-8 sm:py-10 md:py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5">

        {/* ── Layout: موبايل column، تابلت وأكبر grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">

          {/* ── About ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="WAW Logo" style={{ width: 90, height: 'auto' }} />
            </Link>
            <p className="text-[#898989] text-sm leading-relaxed mb-4 max-w-xs">
              {description}
            </p>
            <div className="text-[#6b7280] text-sm">
              <p>{t.footer.copyright}</p>
            </div>
          </div>

          {/* ── Links ── */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h4 className="font-bold text-base sm:text-lg text-[#FCF2ED] mb-3 sm:mb-4" style={{ fontFamily: 'Lyon, serif' }}>
                {t.footer.explore}
              </h4>
              <ul className="space-y-2">
                {finalExplore.map((item, i) => renderLink(item, i))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg text-[#FCF2ED] mb-3 sm:mb-4" style={{ fontFamily: 'Lyon, serif' }}>
                {t.footer.importantLinks}
              </h4>
              <ul className="space-y-2">
                {finalImportant.map((item, i) => renderLink(item, i))}
              </ul>
            </div>
          </div>

          {/* ── Social ── */}
          <div>
            <h4 className="font-bold text-base sm:text-lg text-[#FCF2ED] mb-3 sm:mb-4" style={{ fontFamily: 'Lyon, serif' }}>
              {t.footer.contact}
            </h4>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url || '#'}
                  target={social.url?.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  title={social.label}
                  className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center text-[#898989] hover:text-[#FCF2ED] hover:bg-[#2a2a2a] transition-all"
                >
                  <i className={`${social.icon} text-lg`} />
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;