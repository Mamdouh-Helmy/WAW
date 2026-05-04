import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';

const CATEGORY_META = {
  tech:        { color: '#4469F2', bg: 'rgba(68,105,242,0.12)',   label: 'تقنية' },
  horizons:    { color: '#F7E328', bg: 'rgba(247,227,40,0.12)',   label: 'ثقافي' },
  social:      { color: '#E20E3C', bg: 'rgba(226,14,60,0.12)',    label: 'اجتماعي' },
  podcast:     { color: '#CCF47F', bg: 'rgba(204,244,127,0.12)',  label: 'بودكاست' },
  home:        { color: '#CCF47F', bg: 'rgba(204,244,127,0.12)',  label: 'عام' },
  documentary: { color: '#CCF47F', bg: 'rgba(204,244,127,0.12)', label: 'وثائقي' },
};

const TYPE_ICONS = { article: '◎', video: '▶', images: '◉' };

const ConfirmModal = ({ isOpen, onConfirm, onCancel, articleTitle }) => {
  if (!isOpen) return null;
  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.15s ease',
          padding: '16px',
        }}
      >
        <div
          dir="rtl"
          onClick={e => e.stopPropagation()}
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '18px',
            padding: '28px 24px 22px',
            width: '100%', maxWidth: '360px',
            display: 'flex', flexDirection: 'column', gap: '16px',
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

          <p style={{ color: '#FCF2ED', fontSize: '1rem', fontWeight: 700, margin: 0 }}>حذف المقال</p>

          <div>
            <p style={{ color: '#898989', fontSize: '0.83rem', lineHeight: 1.65, margin: 0 }}>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المقال نهائيًا من قاعدة البيانات.
            </p>
            {articleTitle && (
              <div style={{
                marginTop: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '8px 12px',
                color: '#FCF2ED', fontSize: '0.82rem',
              }}>
                {articleTitle}
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button" onClick={onCancel}
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
              type="button" onClick={onConfirm}
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

const AdminArticles = () => {
  const [page,         setPage]         = useState(1);
  const [refresh,      setRefresh]      = useState(0);
  const [deletingId,   setDeletingId]   = useState(null);
  const [togglingId,   setTogglingId]   = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null, title: '' });

  const { data, loading } = useFetch(() => api.getAdminArticles(page), [page, refresh]);

  const handleDelete = (article) => {
    setConfirmModal({ open: true, id: article._id, title: article.title?.ar || '' });
  };

  const confirmDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal({ open: false, id: null, title: '' });
    setDeletingId(id);
    try {
      await api.deleteArticle(id);
      setRefresh(p => p + 1);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (article) => {
    setTogglingId(article._id);
    const form = new FormData();
    const fields = {
      titleAr:     article.title?.ar     || '',
      titleEn:     article.title?.en     || '',
      contentAr:   article.content?.ar   || '',
      contentEn:   article.content?.en   || '',
      type:        article.type          || 'article',
      category:    article.category      || 'home',
      author:      article.author        || '',
      youtubeUrl:  article.youtubeUrl    || '',
      tagsAr:      (article.tags?.ar     || []).join(','),
      tagsEn:      (article.tags?.en     || []).join(','),
      isPublished: String(!article.isPublished),
    };
    Object.entries(fields).forEach(([k, v]) => form.append(k, v));
    try {
      await api.updateArticle(article._id, form);
      setRefresh(p => p + 1);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'Lyon, serif' }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .admin-articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .admin-stats-row {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .admin-stat-card {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 10px 16px;
          min-width: 100px;
          flex: 1;
        }

        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .article-card {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color 0.15s, transform 0.15s;
        }

        .article-card:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
        }

        .article-thumbnail {
          position: relative;
          height: 180px;
          background: #111;
          flex-shrink: 0;
        }

        .article-body {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .article-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.05);
          gap: 8px;
          flex-wrap: wrap;
        }

        .pagination-wrap {
          display: flex;
          justify-content: center;
          gap: 6px;
          padding: 8px 0;
          flex-wrap: wrap;
        }

        @media (max-width: 480px) {
          .admin-articles-grid { grid-template-columns: 1fr; }
          .admin-header { flex-direction: column; align-items: flex-start; }
          .admin-header a { width: 100%; justify-content: center; }
          .admin-stat-card { min-width: 80px; }
          .article-thumbnail { height: 160px; }
          .article-footer { flex-direction: column; align-items: flex-start; }
          .article-actions { width: 100%; display: flex; justify-content: flex-end; }
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .admin-articles-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
        }

        @media (min-width: 1200px) {
          .admin-articles-grid { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
        }
      `}</style>

      <ConfirmModal
        isOpen={confirmModal.open}
        articleTitle={confirmModal.title}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ open: false, id: null, title: '' })}
      />

      {/* ── Header ── */}
      <div className="admin-header">
        <div>
          <p style={{ color: '#898989', fontSize: '0.75rem', margin: '0 0 3px' }}>إدارة المحتوى</p>
          <h1 style={{ color: '#FCF2ED', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 700, margin: 0 }}>المقالات</h1>
        </div>
        <Link
          to="/admin/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#CCF47F', color: '#161616',
            padding: '9px 18px', borderRadius: '10px',
            fontWeight: 700, fontSize: '0.875rem',
            textDecoration: 'none', fontFamily: 'Lyon, serif',
            transition: 'background 0.15s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#BBE570'}
          onMouseLeave={e => e.currentTarget.style.background = '#CCF47F'}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
          مقال جديد
        </Link>
      </div>

      {/* ── Stats ── */}
      {!loading && data && (
        <div className="admin-stats-row">
          {[
            { label: 'إجمالي المقالات', value: data.total || 0 },
            { label: 'المنشور',         value: data.articles?.filter(a => a.isPublished).length  || 0 },
            { label: 'المسودات',        value: data.articles?.filter(a => !a.isPublished).length || 0 },
          ].map(stat => (
            <div key={stat.label} className="admin-stat-card">
              <p style={{ color: '#898989', fontSize: '0.72rem', margin: '0 0 3px' }}>{stat.label}</p>
              <p style={{ color: '#FCF2ED', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 700, margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
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
      {!loading && data?.articles?.length > 0 && (
        <div className="admin-articles-grid">
          {data.articles.map(article => {
            const cat        = CATEGORY_META[article.category] || CATEGORY_META.home;
            const isDeleting = deletingId === article._id;
            const isToggling = togglingId === article._id;
            const tags       = article.tags?.ar || [];

            return (
              <div
                key={article._id}
                className="article-card"
                style={{ opacity: isDeleting ? 0.4 : 1 }}
              >
                {/* Thumbnail */}
                <div className="article-thumbnail">
                  {article.thumbnail ? (
                    <img
                      src={article.thumbnail}
                      alt={article.title?.ar}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.1)', fontSize: '2.5rem',
                    }}>
                      {TYPE_ICONS[article.type] || '◎'}
                    </div>
                  )}

                  {/* Type badge */}
                  <span style={{
                    position: 'absolute', top: '10px', right: '10px',
                    fontSize: '0.65rem', fontWeight: 600,
                    padding: '3px 9px', borderRadius: '999px',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                    color: '#FCF2ED', border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {TYPE_ICONS[article.type]}{' '}
                    {article.type === 'video' ? 'فيديو' : article.type === 'images' ? 'صور' : 'مقال'}
                  </span>

                  {/* Category badge */}
                  <span style={{
                    position: 'absolute', top: '10px', left: '10px',
                    fontSize: '0.65rem', fontWeight: 600,
                    padding: '3px 9px', borderRadius: '999px',
                    background: cat.bg, color: cat.color,
                    border: `1px solid ${cat.color}44`,
                    backdropFilter: 'blur(6px)',
                  }}>
                    {cat.label}
                  </span>
                </div>

                {/* Body */}
                <div className="article-body">
                  <p style={{
                    color: '#FCF2ED', fontSize: '0.9rem', fontWeight: 600,
                    margin: 0, lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {article.title?.ar || '—'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ color: '#898989', fontSize: '0.75rem' }}>
                      {article.author || 'بدون كاتب'}
                    </span>
                    <span style={{ color: '#898989', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fa-regular fa-eye" style={{ fontSize: '0.7rem' }} />
                      {article.views?.toLocaleString() || 0}
                    </span>
                  </div>

                  {tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {tags.slice(0, 3).map((tag, i) => (
                        <span key={i} style={{
                          fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px',
                          border: '1px solid rgba(204,244,127,0.2)',
                          color: 'rgba(204,244,127,0.7)',
                        }}>
                          {tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span style={{ fontSize: '0.65rem', color: '#898989', padding: '2px 0' }}>
                          +{tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="article-footer">

                    {/* ── Toggle Publish ── */}
                    <button
                      onClick={() => handleTogglePublish(article)}
                      disabled={isToggling}
                      style={{
                        fontSize: '0.72rem', padding: '4px 12px', borderRadius: '999px',
                        border: article.isPublished
                          ? '1px solid rgba(204,244,127,0.3)'   // ✅ lime
                          : '1px solid rgba(255,255,255,0.1)',
                        background: article.isPublished
                          ? 'rgba(204,244,127,0.1)'              // ✅ lime
                          : 'rgba(255,255,255,0.05)',
                        color: article.isPublished ? '#CCF47F' : '#898989', // ✅ lime
                        cursor: isToggling ? 'not-allowed' : 'pointer',
                        fontFamily: 'Lyon, serif', fontWeight: 500,
                        transition: 'all 0.15s',
                        opacity: isToggling ? 0.5 : 1,
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        flexShrink: 0,
                      }}
                    >
                      {isToggling ? (
                        <span style={{
                          width: '10px', height: '10px',
                          border: '1.5px solid currentColor', borderTopColor: 'transparent',
                          borderRadius: '50%', display: 'inline-block',
                          animation: 'spin 0.7s linear infinite',
                        }} />
                      ) : (
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: article.isPublished ? '#CCF47F' : '#898989', // ✅ lime
                          display: 'inline-block',
                        }} />
                      )}
                      {article.isPublished ? 'منشور' : 'مسودة'}
                    </button>

                    {/* ── Edit + Delete ── */}
                    <div className="article-actions" style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/admin/edit/${article._id}`}
                        title="تعديل"
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid rgba(68,105,242,0.3)',
                          background: 'rgba(68,105,242,0.1)', color: '#4469F2',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          textDecoration: 'none', fontSize: '0.75rem',
                          transition: 'all 0.15s', flexShrink: 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(68,105,242,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(68,105,242,0.1)'}
                      >
                        <i className="fa-solid fa-pen-to-square" />
                      </Link>

                      <button
                        onClick={() => handleDelete(article)}
                        disabled={isDeleting}
                        title="حذف"
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: 'transparent', color: '#898989',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: isDeleting ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem', transition: 'all 0.15s', flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(226,14,60,0.35)';
                          e.currentTarget.style.background  = 'rgba(226,14,60,0.1)';
                          e.currentTarget.style.color       = '#E20E3C';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.background  = 'transparent';
                          e.currentTarget.style.color       = '#898989';
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
      {!loading && data?.articles?.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#898989' }}>
          <div style={{ fontSize: '2rem', opacity: 0.2, marginBottom: '12px' }}>◈</div>
          <p style={{ fontSize: '0.875rem' }}>لا توجد مقالات بعد</p>
          <Link to="/admin/new" style={{ color: '#CCF47F', fontSize: '0.8125rem', textDecoration: 'none' }}>
            أضف أول مقال ←
          </Link>
        </div>
      )}

      {/* ── Pagination ── */}
      {data?.pages > 1 && (
        <div className="pagination-wrap">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                border: page === p ? '1px solid rgba(204,244,127,0.4)' : '1px solid rgba(255,255,255,0.07)',
                background: page === p ? 'rgba(204,244,127,0.12)' : 'transparent',
                color: page === p ? '#CCF47F' : '#898989',
                cursor: 'pointer', fontSize: '0.8125rem',
                fontFamily: 'Lyon, serif', fontWeight: page === p ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminArticles;