import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export const ICON_OPTIONS = [
  { label: 'واتساب',        value: 'fa-brands fa-whatsapp' },
  { label: 'تيليجرام',      value: 'fa-brands fa-telegram' },
  { label: 'إنستجرام',      value: 'fa-brands fa-instagram' },
  { label: 'تيك توك',       value: 'fa-brands fa-tiktok' },
  { label: 'يوتيوب',        value: 'fa-brands fa-youtube' },
  { label: 'تويتر / X',     value: 'fa-brands fa-x-twitter' },
  { label: 'فيسبوك',        value: 'fa-brands fa-facebook' },
  { label: 'سناب شات',      value: 'fa-brands fa-snapchat' },
  { label: 'لينكدإن',       value: 'fa-brands fa-linkedin' },
  { label: 'بينتريست',      value: 'fa-brands fa-pinterest' },
  { label: 'ريديت',         value: 'fa-brands fa-reddit' },
  { label: 'تويتش',         value: 'fa-brands fa-twitch' },
  { label: 'ديسكورد',       value: 'fa-brands fa-discord' },
  { label: 'ثريدز',         value: 'fa-brands fa-threads' },
  { label: 'بودكاست أبل',   value: 'fa-brands fa-apple' },
  { label: 'سبوتيفاي',      value: 'fa-brands fa-spotify' },
  { label: 'ساوند كلاود',   value: 'fa-brands fa-soundcloud' },
  { label: 'أنكر',          value: 'fa-brands fa-anchor' },
  { label: 'بريد إلكتروني', value: 'fa-solid fa-envelope' },
  { label: 'هاتف',          value: 'fa-solid fa-phone' },
  { label: 'موقع / كرة أرضية', value: 'fa-solid fa-globe' },
  { label: 'رابط',          value: 'fa-solid fa-link' },
  { label: 'RSS',            value: 'fa-solid fa-rss' },
];

const newSocial = () => ({ label: '', icon: 'fa-brands fa-whatsapp', url: '', order: 0, active: true });
const newLink   = (section = 'explore') => ({ label: '', labelEn: '', url: '', section, order: 0, external: false, active: true });

/* ─── Icon Picker ─────────────────────────────────────────────────────────── */
const IconPicker = ({ value, onChange }) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');

  const filtered = ICON_OPTIONS.filter(o =>
    o.label.includes(search) || o.value.toLowerCase().includes(search.toLowerCase())
  );
  const current = ICON_OPTIONS.find(o => o.value === value);

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 12px', borderRadius: '8px',
          fontSize: '12px', color: '#ccc', width: '100%',
          background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer', fontFamily: 'Lyon, serif',
          transition: 'border-color 0.15s',
        }}
      >
        <i className={`${value} text-[#CCF47F]`} style={{ color: '#CCF47F', flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current?.label || 'اختر أيقونة'}
        </span>
        <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`}
          style={{ fontSize: '9px', color: '#555', flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', zIndex: 50, left: 0, right: 0, top: 'calc(100% + 4px)',
          borderRadius: '10px', overflow: 'hidden',
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}>
          <div style={{ padding: '8px' }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث..."
              dir="rtl"
              style={{
                width: '100%', padding: '6px 12px', borderRadius: '7px',
                fontSize: '12px', color: '#ccc', outline: 'none',
                background: '#111', border: '1px solid rgba(255,255,255,0.08)',
                boxSizing: 'border-box', fontFamily: 'Lyon, serif',
              }}
            />
          </div>
          <div style={{ maxHeight: '208px', overflowY: 'auto', padding: '4px 8px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: '7px', cursor: 'pointer',
                  background: opt.value === value ? 'rgba(204,244,127,0.1)' : 'transparent',
                  border: opt.value === value ? '1px solid rgba(204,244,127,0.2)' : '1px solid transparent',
                  width: '100%', fontFamily: 'Lyon, serif',
                }}
              >
                <i className={opt.value} style={{ fontSize: '14px', width: '18px', flexShrink: 0, color: opt.value === value ? '#CCF47F' : '#888' }} />
                <span style={{ fontSize: '12px', color: '#aaa', flex: 1, textAlign: 'right' }} dir="rtl">{opt.label}</span>
                <code style={{ fontSize: '9px', color: '#555', marginRight: 'auto', flexShrink: 0 }}>{opt.value}</code>
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#555', padding: '12px 0' }}>لا نتائج</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Field ───────────────────────────────────────────────────────────────── */
const Field = ({ label, dir = 'rtl', ...props }) => (
  <div>
    <p style={{ fontSize: '10px', color: '#555', marginBottom: '4px', fontWeight: 500, margin: '0 0 4px', fontFamily: 'Lyon, serif' }} dir="rtl">
      {label}
    </p>
    <input
      {...props}
      dir={dir}
      style={{
        width: '100%', padding: '8px 12px', borderRadius: '8px',
        fontSize: '12px', color: '#ccc', outline: 'none',
        background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)',
        boxSizing: 'border-box', fontFamily: 'Lyon, serif',
        transition: 'border-color 0.15s',
        ...props.style,
      }}
      onFocus={e => (e.target.style.borderColor = 'rgba(204,244,127,0.4)')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
    />
  </div>
);

/* ─── Card ────────────────────────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{
    borderRadius: '14px', padding: 'clamp(14px, 3vw, 20px)',
    background: '#181818', border: '1px solid rgba(255,255,255,0.08)',
    ...style,
  }}>
    {children}
  </div>
);

/* ─── Toggle ──────────────────────────────────────────────────────────────── */
const Toggle = ({ value, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}>
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '36px', height: '20px', borderRadius: '999px',
        position: 'relative', transition: 'background 0.2s',
        background: value ? '#CCF47F' : '#333', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '2px', width: '16px', height: '16px',
        borderRadius: '50%', background: '#000',
        transition: 'right 0.2s',
        right: value ? '2px' : 'calc(100% - 18px)',
      }} />
    </div>
    <span style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap' }}>{label}</span>
  </label>
);

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════════ */
const AdminFooter = () => {
  const [loading, setLoading]         = useState(true);
  const [saving,  setSaving]          = useState(false);
  const [saved,   setSaved]           = useState(false);
  const [description,   setDescription]   = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [socialLinks,   setSocialLinks]   = useState([]);
  const [footerLinks,   setFooterLinks]   = useState([]);

  useEffect(() => {
    api.getFooterSettings()
      .then(data => {
        setDescription(data.description || '');
        setDescriptionEn(data.descriptionEn || '');
        setSocialLinks(data.socialLinks || []);
        setFooterLinks(data.footerLinks || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stripTempIds = (arr) =>
    arr.map(({ _id, ...rest }) =>
      typeof _id === 'number' ? rest : { _id, ...rest }
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateFooterSettings({
        description, descriptionEn,
        socialLinks: stripTempIds(socialLinks),
        footerLinks: stripTempIds(footerLinks),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSocial = (idx, key, val) => setSocialLinks(prev => prev.map((s, i) => i === idx ? { ...s, [key]: val } : s));
  const removeSocial = idx => setSocialLinks(prev => prev.filter((_, i) => i !== idx));
  const addSocial    = ()  => setSocialLinks(prev => [...prev, newSocial()]);

  const updateLink = (idx, key, val) => setFooterLinks(prev => prev.map((l, i) => i === idx ? { ...l, [key]: val } : l));
  const removeLink = idx => setFooterLinks(prev => prev.filter((_, i) => i !== idx));
  const addLink    = (section) => setFooterLinks(prev => [...prev, newLink(section)]);

  const exploreLinks   = footerLinks.filter(l => l.section === 'explore');
  const importantLinks = footerLinks.filter(l => l.section === 'important');

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%',
        border: '2px solid #CCF47F', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div dir="rtl" style={{ fontFamily: 'Lyon, serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .footer-page-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .footer-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .footer-save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #000;
          border: none;
          cursor: pointer;
          font-family: Lyon, serif;
          transition: transform 0.15s, background 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .footer-save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .footer-save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .social-row-grid {
          display: grid;
          grid-template-columns: 3fr 2fr 4fr 1fr 2fr;
          gap: 12px;
          align-items: end;
        }

        .desc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .link-row-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .link-row-bottom {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 12px;
          align-items: end;
        }

        .link-footer-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
        }

        .social-preview {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .footer-page-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .footer-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .footer-save-btn {
            width: 100%;
            justify-content: center;
          }

          .social-row-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto;
          }

          .social-icon-col   { grid-column: 1 / 2; }
          .social-label-col  { grid-column: 2 / 3; }
          .social-url-col    { grid-column: 1 / 3; }
          .social-order-col  { grid-column: 1 / 2; }
          .social-action-col { grid-column: 2 / 3; justify-content: flex-end; }

          .desc-grid {
            grid-template-columns: 1fr;
          }

          .link-row-top {
            grid-template-columns: 1fr;
          }

          .link-row-bottom {
            grid-template-columns: 1fr;
          }

          .link-footer-row {
            gap: 10px;
          }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="footer-header">
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '8px', margin: '0 0 8px' }}>
            Footer
          </p>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 34px)', fontWeight: 900, color: '#FCF2ED', lineHeight: 1, letterSpacing: '-0.02em', fontFamily: 'Georgia, serif', margin: '0 0 8px' }}>
            إعدادات الفوتر
          </h1>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            تحكم في الروابط والأيقونات والنص الظاهر في أسفل الموقع
          </p>
        </div>
        <button
          className="footer-save-btn"
          onClick={handleSave}
          disabled={saving}
          style={{ background: saved ? '#4ade80' : '#CCF47F', boxShadow: '0 4px 24px rgba(204,244,127,0.25)' }}
        >
          {saving ? (
            <>
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              جاري الحفظ
            </>
          ) : saved ? (
            <><i className="fa-solid fa-check" style={{ fontSize: '11px' }} /> تم الحفظ!</>
          ) : (
            <><i className="fa-solid fa-floppy-disk" style={{ fontSize: '11px' }} /> حفظ التغييرات</>
          )}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Description ── */}
        <Card>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#FCF2ED', marginBottom: '16px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-align-right" style={{ color: '#CCF47F', fontSize: '11px' }} />
            وصف الفوتر
          </h3>
          <div className="desc-grid">
            {[
              { label: 'عربي', value: description, onChange: e => setDescription(e.target.value), dir: 'rtl' },
              { label: 'English', value: descriptionEn, onChange: e => setDescriptionEn(e.target.value), dir: 'ltr' },
            ].map(({ label, value, onChange, dir }) => (
              <div key={label}>
                <p style={{ fontSize: '10px', color: '#555', marginBottom: '4px', margin: '0 0 4px', fontWeight: 500 }}>{label}</p>
                <textarea
                  value={value}
                  onChange={onChange}
                  rows={3}
                  dir={dir}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '8px',
                    fontSize: '12px', color: '#ccc', outline: 'none',
                    background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)',
                    resize: 'none', boxSizing: 'border-box', fontFamily: 'Lyon, serif',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(204,244,127,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* ── Social Links ── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#FCF2ED', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-share-nodes" style={{ color: '#CCF47F', fontSize: '11px' }} />
              روابط التواصل الاجتماعي
              <span style={{ fontSize: '10px', fontWeight: 400, color: '#555', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)' }}>
                {socialLinks.length}
              </span>
            </h3>
            <button
              onClick={addSocial}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                background: 'rgba(204,244,127,0.12)', color: '#CCF47F',
                border: '1px solid rgba(204,244,127,0.2)', cursor: 'pointer',
                fontFamily: 'Lyon, serif', flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-plus" style={{ fontSize: '9px' }} /> إضافة
            </button>
          </div>

          {socialLinks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: '#555', fontSize: '12px' }}>
              <i className="fa-solid fa-share-nodes" style={{ fontSize: '24px', opacity: 0.2, display: 'block', marginBottom: '8px' }} />
              <p style={{ margin: 0 }}>لا توجد روابط — اضغط "إضافة" لإنشاء أول رابط</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {socialLinks.map((social, idx) => (
              <div key={social._id || idx} style={{ borderRadius: '10px', padding: '16px', background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="social-row-grid">
                  <div className="social-icon-col">
                    <p style={{ fontSize: '10px', color: '#555', margin: '0 0 4px', fontWeight: 500 }}>الأيقونة</p>
                    <IconPicker value={social.icon} onChange={v => updateSocial(idx, 'icon', v)} />
                  </div>
                  <div className="social-label-col">
                    <Field label="الاسم" value={social.label} onChange={e => updateSocial(idx, 'label', e.target.value)} placeholder="واتساب" />
                  </div>
                  <div className="social-url-col">
                    <Field label="الرابط" value={social.url} onChange={e => updateSocial(idx, 'url', e.target.value)} placeholder="https://wa.me/..." dir="ltr" />
                  </div>
                  <div className="social-order-col">
                    <Field label="الترتيب" type="number" value={social.order} onChange={e => updateSocial(idx, 'order', +e.target.value)} />
                  </div>
                  <div className="social-action-col" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Toggle value={social.active} onChange={v => updateSocial(idx, 'active', v)} label="مفعّل" />
                    <button
                      onClick={() => removeSocial(idx)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '7px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#555', cursor: 'pointer', marginRight: 'auto', flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#E20E3C'}
                      onMouseLeave={e => e.currentTarget.style.color = '#555'}
                    >
                      <i className="fa-solid fa-trash" style={{ fontSize: '10px' }} />
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="social-preview">
                    <p style={{ fontSize: '10px', color: '#555', margin: 0 }}>معاينة:</p>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={social.icon} style={{ color: '#898989' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#666' }}>{social.label || '—'}</span>
                    {social.url && (
                      <a href={social.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '10px', color: '#4469F2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px', direction: 'ltr' }}>
                        {social.url}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Links grid ── */}
        <div className="footer-page-layout">
          <FooterLinksSection
            title="روابط الاستكشاف" color="#4469F2"
            links={exploreLinks} section="explore"
            onAdd={() => addLink('explore')}
            onUpdate={(gIdx, key, val) => updateLink(gIdx, key, val)}
            onRemove={gIdx => removeLink(gIdx)}
            footerLinks={footerLinks}
          />
          <FooterLinksSection
            title="روابط مهمة" color="#F2A544"
            links={importantLinks} section="important"
            onAdd={() => addLink('important')}
            onUpdate={(gIdx, key, val) => updateLink(gIdx, key, val)}
            onRemove={gIdx => removeLink(gIdx)}
            footerLinks={footerLinks}
          />
        </div>
      </div>
    </div>
  );
};

/* ─── Footer Links Section ─────────────────────────────────────────────────── */
const FooterLinksSection = ({ title, color, links, onAdd, onRemove, onUpdate, footerLinks }) => {
  const getGlobalIdx = (link) => footerLinks.findIndex(l => l === link || l._id === link._id);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#FCF2ED', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
          {title}
          <span style={{ fontSize: '10px', fontWeight: 400, color: '#555', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)' }}>
            {links.length}
          </span>
        </h3>
        <button
          onClick={onAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
            background: color + '1A', color, border: `1px solid ${color}30`,
            cursor: 'pointer', fontFamily: 'Lyon, serif', flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-plus" style={{ fontSize: '9px' }} /> إضافة
        </button>
      </div>

      {links.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#555', fontSize: '11px' }}>
          <i className="fa-solid fa-link" style={{ fontSize: '20px', opacity: 0.2, display: 'block', marginBottom: '8px' }} />
          <p style={{ margin: 0 }}>لا توجد روابط</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {links.map((link) => {
          const gIdx = getGlobalIdx(link);
          return (
            <div key={link._id || gIdx} style={{ borderRadius: '10px', padding: '16px', background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="link-row-top">
                <Field label="النص (عربي)"    value={link.label}   onChange={e => onUpdate(gIdx, 'label',   e.target.value)} placeholder="عن المنصة" />
                <Field label="النص (إنجليزي)" value={link.labelEn} onChange={e => onUpdate(gIdx, 'labelEn', e.target.value)} placeholder="About Us" dir="ltr" />
              </div>
              <div className="link-row-bottom">
                <Field label="الرابط"   value={link.url}   onChange={e => onUpdate(gIdx, 'url',   e.target.value)} placeholder="/about  أو  https://..." dir="ltr" />
                <Field label="الترتيب" type="number" value={link.order} onChange={e => onUpdate(gIdx, 'order', +e.target.value)} />
              </div>
              <div className="link-footer-row">
                <Toggle value={link.active}   onChange={v => onUpdate(gIdx, 'active',   v)} label="مفعّل" />
                <Toggle value={link.external} onChange={v => onUpdate(gIdx, 'external', v)} label="رابط خارجي" />
                <button
                  onClick={() => onRemove(gIdx)}
                  style={{
                    marginRight: 'auto', width: '28px', height: '28px', borderRadius: '7px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#555', cursor: 'pointer', flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#E20E3C'}
                  onMouseLeave={e => e.currentTarget.style.color = '#555'}
                >
                  <i className="fa-solid fa-trash" style={{ fontSize: '9px' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AdminFooter;