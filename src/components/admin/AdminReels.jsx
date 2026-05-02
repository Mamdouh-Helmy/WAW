import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { getYoutubeEmbedUrl } from '../../utils/youtube';

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
const getYoutubeThumbnail = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id = null;
    if (u.searchParams.get('v'))       id = u.searchParams.get('v');
    else if (u.hostname === 'youtu.be') id = u.pathname.slice(1);
    else if (u.pathname.startsWith('/shorts/')) id = u.pathname.replace('/shorts/', '');
    else if (u.pathname.startsWith('/embed/'))  id = u.pathname.replace('/embed/', '');
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch { return null; }
};

const inputStyle = {
  width: '100%', background: '#161616',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
  padding: '11px 14px', color: '#FCF2ED', fontSize: '0.875rem',
  outline: 'none', fontFamily: 'Lyon, serif',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const subLabelStyle = {
  color: '#898989', fontSize: '0.75rem',
  marginBottom: '6px', fontFamily: 'Lyon, serif',
};

const ACCENT = '#F7E328'; // yellow — distinct from articles (#CCF47F)

/* ─────────────────────────────────────────────────────────────
   Confirm Delete Modal
───────────────────────────────────────────────────────────── */
const ConfirmModal = ({ isOpen, onConfirm, onCancel, title }) => {
  if (!isOpen) return null;
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
    >
      <div
        dir="rtl"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '18px', padding: '28px 24px 22px',
          width: '100%', maxWidth: '360px',
          display: 'flex', flexDirection: 'column', gap: '16px',
          fontFamily: 'Lyon, serif',
        }}
      >
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: 'rgba(226,14,60,0.1)', border: '1px solid rgba(226,14,60,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#E20E3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>

        <p style={{ color: '#FCF2ED', fontSize: '1rem', fontWeight: 700, margin: 0 }}>حذف الريلز</p>

        <div>
          <p style={{ color: '#898989', fontSize: '0.83rem', lineHeight: 1.65, margin: 0 }}>
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الريلز نهائيًا.
          </p>
          {title && (
            <div style={{
              marginTop: '10px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', padding: '8px 12px',
              color: '#FCF2ED', fontSize: '0.82rem',
            }}>{title}</div>
          )}
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={onCancel} style={{
            flex: 1, padding: '10px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: '#898989', fontSize: '0.85rem', cursor: 'pointer',
            fontFamily: 'Lyon, serif', fontWeight: 600,
          }}>إلغاء</button>
          <button type="button" onClick={onConfirm} style={{
            flex: 1, padding: '10px', borderRadius: '10px',
            border: '1px solid rgba(226,14,60,0.3)', background: 'rgba(226,14,60,0.12)',
            color: '#E20E3C', fontSize: '0.85rem', cursor: 'pointer',
            fontFamily: 'Lyon, serif', fontWeight: 700,
          }}>تأكيد الحذف</button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Reel Form (create / edit)
───────────────────────────────────────────────────────────── */
const ReelForm = ({ initial, onSave, onCancel }) => {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState({
    titleAr:     initial?.title?.ar         || '',
    titleEn:     initial?.title?.en         || '',
    descAr:      initial?.description?.ar   || '',
    descEn:      initial?.description?.en   || '',
    youtubeUrl:  initial?.youtubeUrl        || '',
    isPublished: initial?.isPublished === true ? 'true' : 'false',
  });
  const [thumbnail, setThumbnail]       = useState(null);
  const [thumbPreview, setThumbPreview] = useState(initial?.thumbnail || '');
  const [activeTab, setActiveTab]       = useState('ar');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const autoThumb = getYoutubeThumbnail(form.youtubeUrl);
  const embedUrl  = getYoutubeEmbedUrl(form.youtubeUrl);

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (thumbnail) data.append('thumbnail', thumbnail);
    try {
      if (isEdit) await api.updateReel(initial._id, data);
      else        await api.createReel(data);
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'Lyon, serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <p style={{ color: '#898989', fontSize: '0.72rem', margin: '0 0 3px' }}>
            {isEdit ? 'تعديل ريلز' : 'ريلز جديد'}
          </p>
          <h2 style={{ color: '#FCF2ED', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            {isEdit ? 'تعديل الريلز' : 'إضافة ريلز'}
          </h2>
        </div>
        <button type="button" onClick={onCancel} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#898989', cursor: 'pointer',
        }}>
          <i className="fa-solid fa-xmark" style={{ fontSize: '0.85rem' }} />
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(226,14,60,0.08)', border: '1px solid rgba(226,14,60,0.25)',
          color: '#ff6b8a', borderRadius: '12px', padding: '12px 16px',
          marginBottom: '16px', fontSize: '0.875rem',
        }}>✕ {error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Language Tabs */}
          <div style={{
            display: 'flex', gap: '4px', background: '#1a1a1a',
            padding: '4px', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content',
          }}>
            {[{ key: 'ar', label: 'عربي' }, { key: 'en', label: 'English' }].map(tab => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} style={{
                padding: '6px 18px', borderRadius: '8px', border: 'none',
                background: activeTab === tab.key ? ACCENT : 'transparent',
                color: activeTab === tab.key ? '#161616' : '#898989',
                cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
                fontFamily: 'Lyon, serif', transition: 'all 0.15s',
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Title */}
          <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.875rem', marginBottom: '12px' }}>العنوان</p>
            <input
              value={activeTab === 'ar' ? form.titleAr : form.titleEn}
              onChange={activeTab === 'ar' ? set('titleAr') : set('titleEn')}
              placeholder={activeTab === 'ar' ? 'عنوان الريلز بالعربي...' : 'Reel title in English...'}
              dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
              required={activeTab === 'ar'}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = ACCENT}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Description */}
          <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.875rem', marginBottom: '12px' }}>الوصف</p>
            <textarea
              value={activeTab === 'ar' ? form.descAr : form.descEn}
              onChange={activeTab === 'ar' ? set('descAr') : set('descEn')}
              placeholder={activeTab === 'ar' ? 'وصف مختصر للريلز...' : 'Short description in English...'}
              dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = ACCENT}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* YouTube URL */}
          <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>رابط يوتيوب الريلز</p>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                color: '#F7E328', fontSize: '0.7rem',
                padding: '2px 8px', borderRadius: '999px',
                background: 'rgba(247,227,40,0.1)', border: '1px solid rgba(247,227,40,0.2)',
              }}>
                <i className="fa-brands fa-youtube" /> Shorts / Reels
              </span>
            </div>
            <input
              value={form.youtubeUrl}
              onChange={set('youtubeUrl')}
              placeholder="https://youtube.com/shorts/..."
              dir="ltr" required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = ACCENT}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            {/* Embed preview */}
            {embedUrl && (
              <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden', aspectRatio: '9/16', maxHeight: '320px', background: '#111' }}>
                <iframe
                  src={embedUrl}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  allowFullScreen title="YouTube preview"
                />
              </div>
            )}
          </div>

          {/* Thumbnail */}
          <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>الصورة المصغرة</p>
              {autoThumb && !thumbPreview && (
                <button type="button" onClick={() => setThumbPreview(autoThumb)} style={{
                  fontSize: '0.72rem', padding: '4px 10px', borderRadius: '8px',
                  border: '1px solid rgba(247,227,40,0.3)', background: 'rgba(247,227,40,0.08)',
                  color: ACCENT, cursor: 'pointer', fontFamily: 'Lyon, serif',
                }}>
                  <i className="fa-brands fa-youtube" style={{ marginLeft: '4px' }} />
                  استخدام صورة يوتيوب
                </button>
              )}
            </div>

            {thumbPreview && (
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <div style={{
                  width: '100%', height: '160px', borderRadius: '10px',
                  backgroundImage: `url('${thumbPreview}')`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                }} />
                <button type="button" onClick={() => { setThumbnail(null); setThumbPreview(''); }} style={{
                  position: 'absolute', top: '8px', left: '8px',
                  background: 'rgba(22,22,22,0.85)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px', color: '#898989', width: '26px', height: '26px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '0.7rem',
                }}>✕</button>
              </div>
            )}

            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center',
              border: `2px dashed ${thumbPreview ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '10px', padding: '20px', cursor: 'pointer', gap: '6px',
            }}>
              <span style={{ fontSize: '1.3rem', opacity: 0.5 }}>↑</span>
              <span style={{ color: '#898989', fontSize: '0.78rem', fontFamily: 'Lyon, serif' }}>
                {thumbPreview ? 'استبدال الصورة' : 'رفع صورة مخصصة'}
              </span>
              <input type="file" accept="image/*" onChange={handleThumb} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Publish toggle */}
          <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.875rem' }}>النشر</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: form.isPublished === 'true' ? ACCENT : '#898989',
                  boxShadow: form.isPublished === 'true' ? `0 0 0 3px rgba(247,227,40,0.2)` : 'none',
                  transition: 'all 0.2s', display: 'inline-block',
                }} />
                <span style={{ color: form.isPublished === 'true' ? ACCENT : '#898989', fontSize: '0.72rem' }}>
                  {form.isPublished === 'true' ? 'منشور' : 'مسودة'}
                </span>
              </span>
            </div>
            <div style={{
              display: 'flex', gap: '6px', background: '#161616', borderRadius: '10px',
              padding: '4px', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              {[{ val: 'false', label: 'مسودة' }, { val: 'true', label: 'نشر' }].map(opt => (
                <button key={opt.val} type="button"
                  onClick={() => setForm(p => ({ ...p, isPublished: opt.val }))}
                  style={{
                    flex: 1, padding: '7px', borderRadius: '7px',
                    border: form.isPublished === opt.val && opt.val === 'true'
                      ? `1px solid rgba(247,227,40,0.25)` : '1px solid transparent',
                    background: form.isPublished === opt.val
                      ? (opt.val === 'true' ? 'rgba(247,227,40,0.15)' : 'rgba(255,255,255,0.07)')
                      : 'transparent',
                    color: form.isPublished === opt.val
                      ? (opt.val === 'true' ? ACCENT : '#FCF2ED') : '#898989',
                    cursor: 'pointer', fontSize: '0.8rem',
                    fontFamily: 'Lyon, serif', fontWeight: 600, transition: 'all 0.15s',
                  }}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
            background: loading ? 'rgba(247,227,40,0.4)' : ACCENT,
            color: '#161616', fontWeight: 700, fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Lyon, serif', transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: `0 4px 20px rgba(247,227,40,0.2)`,
          }}>
            {loading ? (
              <>
                <span style={{ width: '14px', height: '14px', border: '2px solid rgba(22,22,22,0.3)', borderTopColor: '#161616', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                جاري الحفظ...
              </>
            ) : (isEdit ? '✓ حفظ التعديلات' : '+ إضافة الريلز')}
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main AdminReels component
───────────────────────────────────────────────────────────── */
const AdminReels = () => {
  const [reels,      setReels]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [refresh,    setRefresh]    = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [modal, setModal]           = useState({ open: false, id: null, title: '' });
  const [formMode, setFormMode]     = useState(null); // null | 'new' | reelObject

  const fetchReels = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminReels(page);
      setReels(res.reels || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReels(); }, [page, refresh]);

  const handleDelete = (reel) =>
    setModal({ open: true, id: reel._id, title: reel.title?.ar || '' });

  const confirmDelete = async () => {
    const { id } = modal;
    setModal({ open: false, id: null, title: '' });
    setDeletingId(id);
    try {
      await api.deleteReel(id);
      setRefresh(p => p + 1);
    } finally { setDeletingId(null); }
  };

  const handleToggle = async (reel) => {
    setTogglingId(reel._id);
    const data = new FormData();
    data.append('titleAr',     reel.title?.ar         || '');
    data.append('titleEn',     reel.title?.en         || '');
    data.append('descAr',      reel.description?.ar   || '');
    data.append('descEn',      reel.description?.en   || '');
    data.append('youtubeUrl',  reel.youtubeUrl        || '');
    data.append('isPublished', String(!reel.isPublished));
    try {
      await api.updateReel(reel._id, data);
      setRefresh(p => p + 1);
    } finally { setTogglingId(null); }
  };

  const handleEdit = async (reel) => {
    try {
      const full = await api.getAdminReel(reel._id);
      setFormMode(full);
    } catch (e) { console.error(e); }
  };

  if (formMode !== null) {
    return (
      <div dir="rtl" style={{ fontFamily: 'Lyon, serif' }}>
        <ReelForm
          initial={formMode === 'new' ? null : formMode}
          onSave={() => { setFormMode(null); setRefresh(p => p + 1); }}
          onCancel={() => setFormMode(null)}
        />
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ fontFamily: 'Lyon, serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .reels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .reel-card {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color 0.15s, transform 0.15s;
        }

        .reel-card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }

        .reel-thumb {
          position: relative;
          aspect-ratio: 9/16;
          max-height: 240px;
          background: #111;
          overflow: hidden;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .reels-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }

        @media (min-width: 1200px) {
          .reels-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        }
      `}</style>

      <ConfirmModal
        isOpen={modal.open} title={modal.title}
        onConfirm={confirmDelete}
        onCancel={() => setModal({ open: false, id: null, title: '' })}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ color: '#898989', fontSize: '0.75rem', margin: '0 0 3px' }}>إدارة المحتوى</p>
          <h1 style={{ color: '#FCF2ED', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 700, margin: 0 }}>
            الريلزدي
          </h1>
        </div>
        <button
          type="button" onClick={() => setFormMode('new')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: ACCENT, color: '#161616',
            padding: '9px 18px', borderRadius: '10px',
            fontWeight: 700, fontSize: '0.875rem',
            border: 'none', cursor: 'pointer',
            fontFamily: 'Lyon, serif',
            boxShadow: `0 4px 20px rgba(247,227,40,0.2)`,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '1rem' }}>+</span>
          ريلز جديد
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'إجمالي الريلزدي', value: total },
            { label: 'المنشور',          value: reels.filter(r => r.isPublished).length },
            { label: 'المسودات',         value: reels.filter(r => !r.isPublished).length },
          ].map(s => (
            <div key={s.label} style={{
              background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px', padding: '10px 16px', flex: 1, minWidth: '90px',
            }}>
              <p style={{ color: '#898989', fontSize: '0.72rem', margin: '0 0 3px' }}>{s.label}</p>
              <p style={{ color: '#FCF2ED', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '28px', height: '28px',
            border: `2px solid rgba(247,227,40,0.15)`,
            borderTopColor: ACCENT,
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {/* Grid */}
      {!loading && reels.length > 0 && (
        <div className="reels-grid">
          {reels.map(reel => {
            const thumb      = reel.thumbnail || getYoutubeThumbnail(reel.youtubeUrl);
            const isDeleting = deletingId === reel._id;
            const isToggling = togglingId === reel._id;

            return (
              <div key={reel._id} className="reel-card" style={{ opacity: isDeleting ? 0.4 : 1 }}>
                {/* Thumbnail */}
                <div className="reel-thumb">
                  {thumb ? (
                    <img src={thumb} alt={reel.title?.ar} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.1)', fontSize: '2rem',
                    }}>▶</div>
                  )}

                  {/* Published badge */}
                  <span style={{
                    position: 'absolute', top: '8px', right: '8px',
                    fontSize: '0.6rem', fontWeight: 600,
                    padding: '3px 8px', borderRadius: '999px',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                    color: reel.isPublished ? '#4ade80' : '#898989',
                    border: reel.isPublished ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {reel.isPublished ? '● منشور' : '○ مسودة'}
                  </span>

                  {/* Views */}
                  <span style={{
                    position: 'absolute', bottom: '8px', left: '8px',
                    fontSize: '0.6rem', padding: '3px 8px', borderRadius: '999px',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                    color: '#FCF2ED', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <i className="fa-regular fa-eye" style={{ fontSize: '0.55rem' }} />
                    {reel.views?.toLocaleString() || 0}
                  </span>
                </div>

                {/* Body */}
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <p style={{
                    color: '#FCF2ED', fontSize: '0.82rem', fontWeight: 600, margin: 0,
                    lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{reel.title?.ar || '—'}</p>

                  {reel.description?.ar && (
                    <p style={{
                      color: '#898989', fontSize: '0.72rem', margin: 0,
                      lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{reel.description.ar}</p>
                  )}

                  {/* Actions */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 'auto', paddingTop: '10px',
                    borderTop: '1px solid rgba(255,255,255,0.05)', gap: '6px',
                  }}>
                    {/* Toggle publish */}
                    <button onClick={() => handleToggle(reel)} disabled={isToggling} style={{
                      fontSize: '0.65rem', padding: '3px 10px', borderRadius: '999px',
                      border: reel.isPublished ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      background: reel.isPublished ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                      color: reel.isPublished ? '#4ade80' : '#898989',
                      cursor: isToggling ? 'not-allowed' : 'pointer',
                      fontFamily: 'Lyon, serif', fontWeight: 500,
                      opacity: isToggling ? 0.5 : 1,
                      display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                    }}>
                      {isToggling
                        ? <span style={{ width: '8px', height: '8px', border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                        : <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: reel.isPublished ? '#4ade80' : '#898989', display: 'inline-block' }} />
                      }
                      {reel.isPublished ? 'منشور' : 'مسودة'}
                    </button>

                    {/* Edit + Delete */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEdit(reel)} title="تعديل" style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1px solid rgba(68,105,242,0.3)', background: 'rgba(68,105,242,0.1)',
                        color: '#4469F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontSize: '0.7rem', transition: 'all 0.15s',
                      }}>
                        <i className="fa-solid fa-pen-to-square" />
                      </button>
                      <button onClick={() => handleDelete(reel)} disabled={isDeleting} title="حذف" style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
                        color: '#898989', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        fontSize: '0.7rem', transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(226,14,60,0.35)'; e.currentTarget.style.background = 'rgba(226,14,60,0.1)'; e.currentTarget.style.color = '#E20E3C'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#898989'; }}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty */}
      {!loading && reels.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#898989' }}>
          <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: '12px' }}>▶</div>
          <p style={{ fontSize: '0.875rem' }}>لا توجد ريلزدي بعد</p>
          <button type="button" onClick={() => setFormMode('new')} style={{
            color: ACCENT, fontSize: '0.8125rem', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: 'Lyon, serif',
          }}>أضف أول ريلز ←</button>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '8px 0', flexWrap: 'wrap' }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: '36px', height: '36px', borderRadius: '8px',
              border: page === p ? `1px solid rgba(247,227,40,0.4)` : '1px solid rgba(255,255,255,0.07)',
              background: page === p ? 'rgba(247,227,40,0.12)' : 'transparent',
              color: page === p ? ACCENT : '#898989',
              cursor: 'pointer', fontSize: '0.8125rem',
              fontFamily: 'Lyon, serif', fontWeight: page === p ? 700 : 400,
            }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReels;