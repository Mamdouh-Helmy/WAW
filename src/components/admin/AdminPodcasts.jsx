import { useState } from 'react';
import { api } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { getYoutubeEmbedUrl } from '../../utils/youtube';

// ── Confirm Delete Modal ──────────────────────────────────
const ConfirmModal = ({ isOpen, onConfirm, onCancel, episodeName }) => {
  if (!isOpen) return null;
  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.15s ease',
          padding: '16px',
        }}
        onClick={onCancel}
      >
        <div
          dir="rtl"
          onClick={e => e.stopPropagation()}
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '18px',
            padding: '28px 24px 22px',
            width: '100%',
            maxWidth: '360px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            fontFamily: 'Lyon, serif',
            animation: 'slideUp 0.2s ease',
          }}
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'rgba(226,14,60,0.1)',
            border: '1px solid rgba(226,14,60,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#E20E3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>

          <p style={{ color: '#FCF2ED', fontSize: '1rem', fontWeight: 700, margin: 0 }}>حذف الحلقة</p>

          <div>
            <p style={{ color: '#898989', fontSize: '0.83rem', lineHeight: 1.65, margin: 0 }}>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحلقة نهائيًا من قاعدة البيانات.
            </p>
            {episodeName && (
              <div style={{
                marginTop: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '8px 12px',
                color: '#FCF2ED', fontSize: '0.82rem',
              }}>
                {episodeName}
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#898989',
                fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: 'Lyon, serif', fontWeight: 600,
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FCF2ED'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#898989'; e.currentTarget.style.background = 'transparent'; }}
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: '1px solid rgba(226,14,60,0.3)',
                background: 'rgba(226,14,60,0.12)',
                color: '#E20E3C', fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: 'Lyon, serif', fontWeight: 700,
                transition: 'background 0.15s, border-color 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(226,14,60,0.22)'; e.currentTarget.style.borderColor = 'rgba(226,14,60,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(226,14,60,0.12)'; e.currentTarget.style.borderColor = 'rgba(226,14,60,0.3)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              تأكيد الحذف
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </>
  );
};

// ── Main Component ────────────────────────────────────────
const AdminPodcasts = () => {
  const [refresh, setRefresh]           = useState(0);
  const [showForm, setShowForm]         = useState(false);
  const [editId, setEditId]             = useState(null);
  const [deletingId, setDeletingId]     = useState(null);
  const [loading, setLoading]           = useState(false);
  const [thumbnail, setThumbnail]       = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, name: '' });

  const [form, setForm] = useState({
    titleAr: '', titleEn: '', host: '', youtubeUrl: '', duration: '', episodeNum: '',
  });

  const { data: podcasts, loading: fetchLoading } = useFetch(() => api.getAdminPodcasts(), [refresh]);

  const resetForm = () => {
    setForm({ titleAr: '', titleEn: '', host: '', youtubeUrl: '', duration: '', episodeNum: '' });
    setThumbnail(null);
    setThumbPreview('');
    setEditId(null);
    setShowForm(false);
  };

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (thumbnail) data.append('thumbnail', thumbnail);
    try {
      if (editId) await api.updatePodcast(editId, data);
      else await api.createPodcast(data);
      setRefresh(p => p + 1);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (ep) => {
    const name = ep.title?.ar || ep.title || '';
    const label = ep.episodeNum ? `الحلقة ${ep.episodeNum}${name ? ` — ${name}` : ''}` : name;
    setConfirmModal({ open: true, id: ep._id, name: label });
  };

  const confirmDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal({ open: false, id: null, name: '' });
    setDeletingId(id);
    try {
      await api.deletePodcast(id);
      setRefresh(p => p + 1);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (ep) => {
    setForm({
      titleAr:    ep.title?.ar || ep.title || '',
      titleEn:    ep.title?.en || '',
      host:       ep.host || '',
      youtubeUrl: ep.youtubeUrl || '',
      duration:   ep.duration || '',
      episodeNum: ep.episodeNum || '',
    });
    setThumbPreview(ep.thumbnail || '');
    setThumbnail(null);
    setEditId(ep._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));
  const embedUrl = getYoutubeEmbedUrl(form.youtubeUrl);

  return (
    <div dir="rtl" style={{ fontFamily: 'Lyon, serif' }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .pods-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .pods-stats {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .pods-stat-card {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 10px 16px;
          min-width: 100px;
          flex: 1;
        }

        .pods-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .pods-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 4px;
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-wrap: wrap;
        }

        .pods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .pod-card {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color 0.15s, transform 0.15s;
        }

        .pod-card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }

        .pod-thumbnail {
          position: relative;
          height: 180px;
          background: #111;
          flex-shrink: 0;
        }

        .pod-body {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .pod-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.05);
          gap: 8px;
          flex-wrap: wrap;
        }

        .thumb-upload-row {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        @media (max-width: 480px) {
          .pods-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .pods-header button {
            width: 100%;
            justify-content: center;
          }

          .pods-form-grid {
            grid-template-columns: 1fr;
          }

          .pods-form-actions {
            flex-direction: column-reverse;
          }

          .pods-form-actions button {
            width: 100%;
            justify-content: center;
          }

          .pods-grid {
            grid-template-columns: 1fr;
          }

          .pod-thumbnail {
            height: 160px;
          }

          .pod-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .pod-footer-actions {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
          }

          .thumb-upload-row {
            flex-direction: column;
          }

          .thumb-upload-row label {
            width: 100%;
          }
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .pods-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          }

          .pods-form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (min-width: 1200px) {
          .pods-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          }
        }
      `}</style>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        isOpen={confirmModal.open}
        episodeName={confirmModal.name}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ open: false, id: null, name: '' })}
      />

      {/* ── Header ── */}
      <div className="pods-header">
        <div>
          <p style={{ color: '#898989', fontSize: '0.75rem', margin: '0 0 3px' }}>إدارة المحتوى</p>
          <h1 style={{ color: '#FCF2ED', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 700, margin: 0 }}>البودكاست</h1>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm(p => !p); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: showForm ? 'rgba(255,255,255,0.06)' : '#CCF47F',
            color: showForm ? '#898989' : '#161616',
            border: showForm ? '1px solid rgba(255,255,255,0.1)' : 'none',
            padding: '9px 18px', borderRadius: '10px',
            fontWeight: 700, fontSize: '0.875rem',
            cursor: 'pointer', fontFamily: 'Lyon, serif',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!showForm) e.currentTarget.style.background = '#BBE570'; }}
          onMouseLeave={e => { if (!showForm) e.currentTarget.style.background = '#CCF47F'; }}
        >
          {showForm ? '✕ إلغاء' : '+ حلقة جديدة'}
        </button>
      </div>

      {/* ── Stats ── */}
      {!fetchLoading && podcasts && (
        <div className="pods-stats">
          {[
            { label: 'إجمالي الحلقات', value: podcasts.length },
            { label: 'آخر حلقة', value: podcasts[0]?.episodeNum ? `#${podcasts[0].episodeNum}` : '—' },
          ].map(stat => (
            <div key={stat.label} className="pods-stat-card">
              <p style={{ color: '#898989', fontSize: '0.72rem', margin: '0 0 3px' }}>{stat.label}</p>
              <p style={{ color: '#FCF2ED', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700, margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Form ── */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: 'clamp(16px, 3vw, 24px)',
          marginBottom: '24px',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.95rem' }}>
              {editId ? 'تعديل الحلقة' : 'حلقة جديدة'}
            </span>
            {editId && (
              <span style={{
                fontSize: '0.72rem', padding: '3px 10px', borderRadius: '999px',
                background: 'rgba(68,105,242,0.12)', color: '#4469F2',
                border: '1px solid rgba(68,105,242,0.25)',
              }}>
                وضع التعديل
              </span>
            )}
          </div>

          <div className="pods-form-grid">
            {[
              { key: 'titleAr', label: 'العنوان عربي *', dir: 'rtl', placeholder: 'عنوان الحلقة بالعربي...', required: true },
              { key: 'titleEn', label: 'Title English', dir: 'ltr', placeholder: 'Episode title in English...' },
              { key: 'host', label: 'المضيف *', dir: 'rtl', placeholder: 'اسم المضيف...', required: true },
              { key: 'episodeNum', label: 'رقم الحلقة', dir: 'rtl', placeholder: '١، ٢، ٣...', type: 'number' },
              { key: 'duration', label: 'المدة', dir: 'rtl', placeholder: 'مثال: ٤٥ دقيقة' },
              { key: 'youtubeUrl', label: 'رابط يوتيوب', dir: 'ltr', placeholder: 'https://youtube.com/watch?v=...' },
            ].map(({ key, label, dir, placeholder, required, type }) => (
              <div key={key}>
                <p style={{ ...subLabelStyle, textAlign: dir === 'ltr' ? 'left' : 'right' }}>{label}</p>
                <input
                  value={form[key]}
                  onChange={set(key)}
                  required={required}
                  dir={dir}
                  placeholder={placeholder}
                  type={type || 'text'}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#CCF47F'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            ))}
          </div>

          {embedUrl && (
            <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid rgba(255,255,255,0.07)' }}>
              <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} allowFullScreen title="YouTube preview" />
            </div>
          )}

          <div>
            <p style={subLabelStyle}>صورة الغلاف</p>
            <div className="thumb-upload-row">
              {thumbPreview && (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '12px',
                    backgroundImage: `url('${thumbPreview}')`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }} />
                  <button
                    type="button"
                    onClick={() => { setThumbnail(null); setThumbPreview(''); }}
                    style={{
                      position: 'absolute', top: '6px', left: '6px',
                      background: 'rgba(22,22,22,0.85)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px', color: '#898989', width: '22px', height: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: '0.65rem',
                    }}
                  >✕</button>
                </div>
              )}
              <label style={{
                flex: 1, minWidth: '160px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '6px',
                border: `2px dashed ${thumbPreview ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '12px', padding: '20px', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(204,244,127,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = thumbPreview ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}
              >
                <span style={{ fontSize: '1.2rem', opacity: 0.4 }}>↑</span>
                <span style={{ color: '#898989', fontSize: '0.78rem' }}>
                  {thumbPreview ? 'استبدال الصورة' : 'رفع صورة'}
                </span>
                <input type="file" accept="image/*" onChange={handleThumb} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="pods-form-actions">
            <button type="button" onClick={resetForm}
              style={{
                padding: '9px 20px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent', color: '#898989', cursor: 'pointer',
                fontSize: '0.875rem', fontFamily: 'Lyon, serif', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#FCF2ED'}
              onMouseLeave={e => e.currentTarget.style.color = '#898989'}
            >
              إلغاء
            </button>
            <button type="submit" disabled={loading}
              style={{
                padding: '9px 24px', borderRadius: '10px', border: 'none',
                background: loading ? 'rgba(204,244,127,0.4)' : '#CCF47F',
                color: '#161616', fontWeight: 700, fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Lyon, serif', transition: 'background 0.15s',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#BBE570'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#CCF47F'; }}
            >
              {loading ? <><SpinIcon /> جاري الحفظ...</> : (editId ? '✓ حفظ التعديلات' : '+ إضافة الحلقة')}
            </button>
          </div>
        </form>
      )}

      {/* ── Loading ── */}
      {fetchLoading && (
        <div style={{ padding: '80px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '28px', height: '28px',
            border: '2px solid rgba(204,244,127,0.15)',
            borderTopColor: '#CCF47F',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {/* ── Cards Grid ── */}
      {!fetchLoading && podcasts?.length > 0 && (
        <div className="pods-grid">
          {podcasts.map(ep => {
            const isDeleting = deletingId === ep._id;
            const title = ep.title?.ar || ep.title || '—';

            return (
              <div
                key={ep._id}
                className="pod-card"
                style={{ opacity: isDeleting ? 0.4 : 1 }}
              >
                {/* Thumbnail */}
                <div className="pod-thumbnail">
                  {ep.thumbnail ? (
                    <img src={ep.thumbnail} alt={title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(204,244,127,0.15)', fontSize: '3rem',
                    }}>
                      ▶
                    </div>
                  )}

                  {ep.episodeNum && (
                    <span style={{
                      position: 'absolute', top: '10px', right: '10px',
                      fontSize: '0.65rem', fontWeight: 700,
                      padding: '3px 9px', borderRadius: '999px',
                      background: 'rgba(204,244,127,0.15)', color: '#CCF47F',
                      border: '1px solid rgba(204,244,127,0.3)',
                      backdropFilter: 'blur(6px)',
                    }}>
                      الحلقة {ep.episodeNum}
                    </span>
                  )}

                  {ep.duration && (
                    <span style={{
                      position: 'absolute', top: '10px', left: '10px',
                      fontSize: '0.65rem', fontWeight: 600,
                      padding: '3px 9px', borderRadius: '999px',
                      background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(6px)',
                    }}>
                      {ep.duration}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="pod-body">
                  <p style={{
                    color: '#FCF2ED', fontSize: '0.9rem', fontWeight: 600,
                    margin: 0, lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {title}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-microphone" style={{ fontSize: '0.65rem', color: '#898989' }} />
                    <span style={{ color: '#898989', fontSize: '0.75rem' }}>{ep.host || 'بدون مضيف'}</span>
                  </div>

                  {/* Footer */}
                  <div className="pod-footer">
                    {/* Toggle publish */}
                    <button
                      type="button"
                      onClick={async () => {
                        const fd = new FormData();
                        fd.append('titleAr', ep.title?.ar || '');
                        fd.append('titleEn', ep.title?.en || '');
                        fd.append('host', ep.host || '');
                        fd.append('youtubeUrl', ep.youtubeUrl || '');
                        fd.append('duration', ep.duration || '');
                        fd.append('episodeNum', ep.episodeNum || '');
                        fd.append('isPublished', String(!ep.isPublished));
                        await api.updatePodcast(ep._id, fd);
                        setRefresh(p => p + 1);
                      }}
                      style={{
                        fontSize: '0.72rem', padding: '4px 12px', borderRadius: '999px',
                        border: ep.isPublished
                          ? '1px solid rgba(74,222,128,0.3)'
                          : '1px solid rgba(255,255,255,0.1)',
                        background: ep.isPublished
                          ? 'rgba(74,222,128,0.1)'
                          : 'rgba(255,255,255,0.05)',
                        color: ep.isPublished ? '#4ade80' : '#898989',
                        cursor: 'pointer', fontFamily: 'Lyon, serif',
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        marginRight: 'auto',
                      }}
                    >
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: ep.isPublished ? '#4ade80' : '#898989',
                        display: 'inline-block',
                        flexShrink: 0,
                      }} />
                      {ep.isPublished ? 'منشور' : 'مسودة'}
                    </button>

                    <div className="pod-footer-actions" style={{ display: 'flex', gap: '8px' }}>
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => handleEdit(ep)}
                        title="تعديل"
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid rgba(68,105,242,0.3)',
                          background: 'rgba(68,105,242,0.1)', color: '#4469F2',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.15s',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(68,105,242,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(68,105,242,0.1)'}
                      >
                        <i className="fa-solid fa-pen-to-square" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(ep)}
                        disabled={isDeleting}
                        title="حذف"
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: 'transparent', color: '#898989',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: isDeleting ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem', transition: 'all 0.15s',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(226,14,60,0.35)';
                          e.currentTarget.style.background = 'rgba(226,14,60,0.1)';
                          e.currentTarget.style.color = '#E20E3C';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#898989';
                        }}
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

      {/* ── Empty ── */}
      {!fetchLoading && (!podcasts || podcasts.length === 0) && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#898989' }}>
          <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: '12px' }}>▶</div>
          <p style={{ fontSize: '0.875rem' }}>لا توجد حلقات بعد</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            style={{ color: '#CCF47F', fontSize: '0.8125rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Lyon, serif' }}
          >
            أضف أول حلقة ←
          </button>
        </div>
      )}
    </div>
  );
};

// ── Shared ────────────────────────────────────────────────
const SpinIcon = () => (
  <span style={{
    width: '14px', height: '14px',
    border: '2px solid rgba(22,22,22,0.3)', borderTopColor: '#161616',
    borderRadius: '50%', display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  }} />
);

const inputStyle = {
  width: '100%', background: '#161616',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
  padding: '11px 14px', color: '#FCF2ED', fontSize: '0.875rem',
  outline: 'none', fontFamily: 'Lyon, serif',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const subLabelStyle = {
  color: '#898989', fontSize: '0.75rem',
  marginBottom: '6px', margin: '0 0 6px',
  fontFamily: 'Lyon, serif',
};

export default AdminPodcasts;