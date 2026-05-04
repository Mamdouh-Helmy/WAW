import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';
import { getYoutubeEmbedUrl } from '../../utils/youtube';

const CATEGORIES = ['home', 'tech', 'horizons', 'social', 'podcast', 'documentary'];
const TYPES      = ['article', 'video', 'images'];

const CATEGORY_META = {
  home:         { color: '#CCF47F', label: 'الرئيسية' },
  tech:         { color: '#4469F2', label: 'تقنية' },
  horizons:     { color: '#F7E328', label: 'ثقافي' },
  social:       { color: '#E20E3C', label: 'اجتماعي' },
  podcast:      { color: '#CCF47F', label: 'بودكاست' },
  documentary:  { color: '#5EEAD4', label: 'وثائقي' },
};

/* ── Responsive hook ─────────────────────────────────────── */
const useContainerWidth = (ref) => {
  const [width, setWidth] = useState(800);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return width;
};

/* ── Tag Input ─────────────────────────────────────────────── */
const TagInput = ({ tags, onChange, placeholder, dir = 'rtl' }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef();

  const addTag = (val) => {
    const trimmed = val.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput('');
  };
  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));
  const handleKeyDown = (e) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) { e.preventDefault(); addTag(input); }
    if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1]);
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        minHeight: '46px', background: '#161616',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
        padding: '8px 12px', display: 'flex', flexWrap: 'wrap',
        gap: '6px', alignItems: 'center', cursor: 'text',
      }}
    >
      {tags.map((tag, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: 'rgba(204,244,127,0.12)', border: '1px solid rgba(204,244,127,0.3)',
          color: '#CCF47F', borderRadius: '999px', padding: '2px 10px',
          fontSize: '0.78rem', fontFamily: 'Lyon, serif', whiteSpace: 'nowrap',
        }}>
          {tag}
          <button type="button" onClick={() => removeTag(tag)}
            style={{ background: 'none', border: 'none', color: '#CCF47F', cursor: 'pointer', padding: 0, fontSize: '0.75rem', lineHeight: 1, opacity: 0.7 }}>
            ✕
          </button>
        </span>
      ))}
      <input
        ref={inputRef} value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(input)}
        placeholder={tags.length === 0 ? placeholder : ''}
        dir={dir}
        style={{
          flex: 1, minWidth: '100px', background: 'none', border: 'none',
          outline: 'none', color: '#FCF2ED', fontSize: '0.875rem', fontFamily: 'Lyon, serif',
        }}
      />
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────── */
const AdminNewArticle = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const containerRef = useRef(null);
  const containerWidth = useContainerWidth(containerRef);
  const isNarrow = containerWidth < 768;
  const isMid    = containerWidth >= 768 && containerWidth < 1024;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    titleAr: '', titleEn: '', contentAr: '', contentEn: '',
    youtubeUrl: '', type: 'article', category: 'home',
    author: '', isPublished: 'false', documentaryType: 'documentary',
  });
  const [tagsAr, setTagsAr]             = useState([]);
  const [tagsEn, setTagsEn]             = useState([]);
  const [thumbnail, setThumbnail]       = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [loading, setLoading]           = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError]               = useState('');
  const [saved, setSaved]               = useState(false);
  const [activeTab, setActiveTab]       = useState('ar');

  useEffect(() => {
    if (!isEdit) return;
    setFetchLoading(true);
    api.getAdminArticle(id)
      .then((article) => {
        setForm({
          titleAr:        article.title?.ar   || '',
          titleEn:        article.title?.en   || '',
          contentAr:      article.content?.ar || '',
          contentEn:      article.content?.en || '',
          youtubeUrl:     article.youtubeUrl  || '',
          type:           article.type        || 'article',
          category:       article.category    || 'home',
          author:         article.author      || '',
          isPublished:    article.isPublished === true ? 'true' : 'false',
          documentaryType: article.documentaryType || 'documentary',
        });
        setTagsAr(article.tags?.ar || []);
        setTagsEn(article.tags?.en || []);
        if (article.thumbnail) setThumbPreview(article.thumbnail);
      })
      .catch(err => setError(err.message))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('tagsAr', tagsAr.join(','));
    data.append('tagsEn', tagsEn.join(','));
    if (thumbnail) data.append('thumbnail', thumbnail);
    try {
      if (isEdit) await api.updateArticle(id, data);
      else        await api.createArticle(data);
      setSaved(true);
      setTimeout(() => navigate('/admin/articles'), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));
  const catColor = CATEGORY_META[form.category]?.color || '#CCF47F';
  const embedUrl = getYoutubeEmbedUrl(form.youtubeUrl);

  if (fetchLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid rgba(204,244,127,0.2)', borderTopColor: '#CCF47F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const sidebarWidth = isMid ? '260px' : '300px';

  return (
    <div ref={containerRef} dir="rtl" style={{ fontFamily: 'Lyon, serif' }}>

      {/* ── Top Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px', gap: '12px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button" onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', width: '36px', height: '36px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#898989', cursor: 'pointer', transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FCF2ED'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#898989'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.8rem' }} />
          </button>
          <div>
            <p style={{ color: '#898989', fontSize: '0.72rem', marginBottom: '2px' }}>
              {isEdit ? 'تعديل محتوى' : 'إنشاء محتوى جديد'}
            </p>
            <h1 style={{ color: '#FCF2ED', fontSize: isNarrow ? '1.15rem' : '1.4rem', fontWeight: 700, margin: 0 }}>
              {isEdit ? 'تعديل المقال' : 'مقال جديد'}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Category indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: catColor, display: 'inline-block', transition: 'background 0.3s' }} />
            <span style={{ color: '#898989', fontSize: '0.8rem' }}>{CATEGORY_META[form.category]?.label}</span>
          </div>

          {/* Settings toggle — narrow only */}
          {isNarrow && (
            <button
              type="button"
              onClick={() => setSidebarOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: sidebarOpen ? 'rgba(204,244,127,0.1)' : 'rgba(255,255,255,0.05)',
                border: sidebarOpen ? '1px solid rgba(204,244,127,0.25)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', padding: '7px 12px',
                color: sidebarOpen ? '#CCF47F' : '#898989',
                cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Lyon, serif',
                transition: 'all 0.2s',
              }}
            >
              <i className={`fa-solid fa-${sidebarOpen ? 'xmark' : 'sliders'}`} style={{ fontSize: '0.75rem' }} />
              {sidebarOpen ? 'إغلاق' : 'الإعدادات'}
            </button>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div style={{ background: 'rgba(226,14,60,0.08)', border: '1px solid rgba(226,14,60,0.25)', color: '#ff6b8a', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.875rem' }}>
          ✕ {error}
        </div>
      )}
      {saved && (
        <div style={{ background: 'rgba(204,244,127,0.08)', border: '1px solid rgba(204,244,127,0.25)', color: '#CCF47F', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.875rem' }}>
          ✓ تم الحفظ بنجاح، جاري التحويل...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isNarrow ? '1fr' : `1fr ${sidebarWidth}`,
          gap: '16px',
          alignItems: 'start',
        }}>

          {/* ── MAIN CONTENT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>

            {/* Narrow: inline sidebar panel */}
            {isNarrow && sidebarOpen && (
              <div style={{
                background: '#1a1a1a', borderRadius: '14px',
                border: '1px solid rgba(204,244,127,0.15)',
                padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px',
              }}>
                <PublishPanel
                  form={form} setForm={setForm}
                  loading={loading} isEdit={isEdit} catColor={catColor}
                />
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <CategoryPanel form={form} setForm={setForm} catColor={catColor} />
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <ThumbnailPanel
                  thumbPreview={thumbPreview} setThumbnail={setThumbnail}
                  setThumbPreview={setThumbPreview} handleThumb={handleThumb} catColor={catColor}
                />
              </div>
            )}

            {/* Language Tabs */}
            <div style={{
              display: 'flex', gap: '4px', background: '#1a1a1a',
              padding: '4px', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content',
            }}>
              {[{ key: 'ar', label: 'عربي' }, { key: 'en', label: 'English' }].map(tab => (
                <button
                  key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '6px 18px', borderRadius: '8px', border: 'none',
                    background: activeTab === tab.key ? '#CCF47F' : 'transparent',
                    color: activeTab === tab.key ? '#161616' : '#898989',
                    cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
                    fontFamily: 'Lyon, serif', transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Title */}
            <Panel label="العنوان">
              <input
                value={activeTab === 'ar' ? form.titleAr : form.titleEn}
                onChange={activeTab === 'ar' ? set('titleAr') : set('titleEn')}
                placeholder={activeTab === 'ar' ? 'عنوان المقال بالعربي...' : 'Article title in English...'}
                dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                required={activeTab === 'ar'}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = catColor}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </Panel>

            {/* Content */}
            <Panel label="المحتوى">
              {activeTab === 'ar' ? (
                <RichTextEditor
                  value={form.contentAr}
                  onChange={val => setForm(p => ({ ...p, contentAr: val }))}
                  placeholder="اكتب محتوى المقال بالعربي هنا..."
                  dir="rtl" accentColor={catColor}
                />
              ) : (
                <RichTextEditor
                  value={form.contentEn}
                  onChange={val => setForm(p => ({ ...p, contentEn: val }))}
                  placeholder="Write article content in English here..."
                  dir="ltr" accentColor={catColor}
                />
              )}
            </Panel>

            {/* Tags */}
            <Panel label="التاغات" hint="اضغط Enter أو فاصلة لإضافة تاغ">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <p style={subLabelStyle}>عربي</p>
                  <TagInput tags={tagsAr} onChange={setTagsAr} placeholder="مثال: الذكاء الاصطناعي، تقنية..." dir="rtl" />
                </div>
                <div>
                  <p style={{ ...subLabelStyle, textAlign: 'left' }}>English</p>
                  <TagInput tags={tagsEn} onChange={setTagsEn} placeholder="e.g. AI, Technology..." dir="ltr" />
                </div>
              </div>
            </Panel>

            {/* YouTube */}
            <Panel label="فيديو يوتيوب" optional>
              <input
                value={form.youtubeUrl} onChange={set('youtubeUrl')}
                placeholder="https://youtube.com/watch?v=..."
                dir="ltr" style={inputStyle}
                onFocus={e => e.target.style.borderColor = catColor}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {embedUrl && (
                <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9' }}>
                  <iframe
                    src={embedUrl} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    allowFullScreen title="YouTube preview"
                  />
                </div>
              )}
            </Panel>

            {/* Narrow: Submit button at bottom */}
            {isNarrow && (
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                  background: loading ? 'rgba(204,244,127,0.4)' : '#CCF47F',
                  color: '#161616', fontWeight: 700, fontSize: '0.9rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Lyon, serif', transition: 'background 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 20px rgba(204,244,127,0.2)',
                }}
              >
                {loading ? <><SpinIcon /> جاري الحفظ...</> : (isEdit ? '✓ حفظ التعديلات' : '+ حفظ المقال')}
              </button>
            )}
          </div>

          {/* ── SIDEBAR — desktop/tablet only ── */}
          {!isNarrow && (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '14px',
              position: 'sticky', top: '80px',
            }}>
              <SidePanel>
                <PublishPanel
                  form={form} setForm={setForm}
                  loading={loading} isEdit={isEdit} catColor={catColor}
                />
              </SidePanel>

              <SidePanel label="التصنيف">
                <CategoryPanel form={form} setForm={setForm} catColor={catColor} />
              </SidePanel>

              <SidePanel label="الصورة الرئيسية">
                <ThumbnailPanel
                  thumbPreview={thumbPreview} setThumbnail={setThumbnail}
                  setThumbPreview={setThumbPreview} handleThumb={handleThumb} catColor={catColor}
                />
              </SidePanel>
            </div>
          )}
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* ── Extracted panel contents ────── */
const PublishPanel = ({ form, setForm, loading, isEdit, catColor }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
      <span style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.875rem' }}>النشر</span>
      <StatusDot published={form.isPublished === 'true'} />
    </div>
    <div style={{
      display: 'flex', gap: '6px', background: '#161616', borderRadius: '10px',
      padding: '4px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '14px',
    }}>
      {[{ val: 'false', label: 'مسودة' }, { val: 'true', label: 'نشر' }].map(opt => (
        <button
          key={opt.val} type="button"
          onClick={() => setForm(p => ({ ...p, isPublished: opt.val }))}
          style={{
            flex: 1, padding: '7px', borderRadius: '7px',
            border: form.isPublished === opt.val && opt.val === 'true'
              ? '1px solid rgba(204,244,127,0.25)' : '1px solid transparent',
            background: form.isPublished === opt.val
              ? (opt.val === 'true' ? 'rgba(204,244,127,0.15)' : 'rgba(255,255,255,0.07)')
              : 'transparent',
            color: form.isPublished === opt.val
              ? (opt.val === 'true' ? '#CCF47F' : '#FCF2ED') : '#898989',
            cursor: 'pointer', fontSize: '0.8rem',
            fontFamily: 'Lyon, serif', fontWeight: 600, transition: 'all 0.15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
    <button
      type="submit" disabled={loading}
      style={{
        width: '100%', padding: '11px', borderRadius: '10px', border: 'none',
        background: loading ? 'rgba(204,244,127,0.4)' : '#CCF47F',
        color: '#161616', fontWeight: 700, fontSize: '0.875rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'Lyon, serif', transition: 'background 0.15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        boxShadow: '0 4px 16px rgba(204,244,127,0.2)',
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#BBE570'; }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#CCF47F'; }}
    >
      {loading ? <><SpinIcon /> جاري الحفظ...</> : (isEdit ? '✓ حفظ التعديلات' : '+ حفظ المقال')}
    </button>
  </div>
);

const CategoryPanel = ({ form, setForm, catColor }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div>
      <p style={subLabelStyle}>القسم</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
        {CATEGORIES.map(c => (
          <button
            key={c} type="button"
            onClick={() => setForm(p => ({ ...p, category: c }))}
            style={{
              padding: '7px 8px', borderRadius: '8px',
              border: form.category === c
                ? `1px solid ${CATEGORY_META[c]?.color}55`
                : '1px solid rgba(255,255,255,0.07)',
              background: form.category === c ? `${CATEGORY_META[c]?.color}18` : 'transparent',
              color: form.category === c ? CATEGORY_META[c]?.color : '#898989',
              cursor: 'pointer', fontSize: '0.75rem',
              fontFamily: 'Lyon, serif', fontWeight: form.category === c ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {CATEGORY_META[c]?.label}
          </button>
        ))}
      </div>
    </div>

    {/* Documentary Type — يظهر فقط لما القسم documentary */}
    {form.category === 'documentary' && (
      <div>
        <p style={subLabelStyle}>نوع الفيلم</p>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[
            { val: 'documentary', label: '🎬 وثائقي' },
            { val: 'feature',     label: '🎥 فيتشر'  },
          ].map(opt => (
            <button
              key={opt.val} type="button"
              onClick={() => setForm(p => ({ ...p, documentaryType: opt.val }))}
              style={{
                flex: 1, padding: '7px 4px', borderRadius: '8px',
                border: form.documentaryType === opt.val
                  ? '1px solid rgba(94,234,212,0.35)'
                  : '1px solid rgba(255,255,255,0.07)',
                background: form.documentaryType === opt.val
                  ? 'rgba(94,234,212,0.12)' : 'transparent',
                color: form.documentaryType === opt.val ? '#5EEAD4' : '#898989',
                cursor: 'pointer', fontSize: '0.75rem',
                fontFamily: 'Lyon, serif', fontWeight: form.documentaryType === opt.val ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )}

    <div>
      <p style={subLabelStyle}>النوع</p>
      <div style={{ display: 'flex', gap: '5px' }}>
        {TYPES.map(t => (
          <button
            key={t} type="button"
            onClick={() => setForm(p => ({ ...p, type: t }))}
            style={{
              flex: 1, padding: '7px 4px', borderRadius: '8px',
              border: form.type === t
                ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.07)',
              background: form.type === t ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: form.type === t ? '#FCF2ED' : '#898989',
              cursor: 'pointer', fontSize: '0.72rem',
              fontFamily: 'Lyon, serif', transition: 'all 0.15s',
            }}
          >
            {t === 'article' ? '◎ نص' : t === 'video' ? '▶ فيديو' : '◉ صور'}
          </button>
        ))}
      </div>
    </div>

    <div>
      <p style={subLabelStyle}>الكاتب</p>
      <input
        value={form.author}
        onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
        placeholder="اسم الكاتب" style={inputStyle}
        onFocus={e => e.target.style.borderColor = catColor}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  </div>
);

const ThumbnailPanel = ({ thumbPreview, setThumbnail, setThumbPreview, handleThumb, catColor }) => (
  <div>
    {thumbPreview && (
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <div style={{
          width: '100%', height: '140px', borderRadius: '10px',
          backgroundImage: `url('${thumbPreview}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        <button
          type="button"
          onClick={() => { setThumbnail(null); setThumbPreview(''); }}
          style={{
            position: 'absolute', top: '8px', left: '8px',
            background: 'rgba(22,22,22,0.85)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px', color: '#898989', width: '26px', height: '26px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '0.7rem',
          }}
        >✕</button>
      </div>
    )}
    <label
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        border: `2px dashed ${thumbPreview ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: '10px', padding: '20px', cursor: 'pointer',
        gap: '6px', transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${catColor}66`}
      onMouseLeave={e => e.currentTarget.style.borderColor = thumbPreview ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}
    >
      <span style={{ fontSize: '1.3rem', opacity: 0.5 }}>↑</span>
      <span style={{ color: '#898989', fontSize: '0.78rem', fontFamily: 'Lyon, serif' }}>
        {thumbPreview ? 'استبدال الصورة' : 'رفع صورة'}
      </span>
      <input type="file" accept="image/*" onChange={handleThumb} style={{ display: 'none' }} />
    </label>
  </div>
);

/* ── Shared sub-components ─────────────────────────────────── */
const Panel = ({ label, hint, optional, children }) => (
  <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
      <span style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Lyon, serif' }}>{label}</span>
      {optional && <span style={{ color: '#898989', fontSize: '0.72rem' }}>اختياري</span>}
      {hint    && <span style={{ color: '#898989', fontSize: '0.72rem' }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const SidePanel = ({ label, children }) => (
  <div style={{ background: '#1a1a1a', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
    {label && <p style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.875rem', marginBottom: '12px', fontFamily: 'Lyon, serif' }}>{label}</p>}
    {children}
  </div>
);

const StatusDot = ({ published }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span style={{
      width: '7px', height: '7px', borderRadius: '50%',
      background: published ? '#CCF47F' : '#898989',
      boxShadow: published ? '0 0 0 3px rgba(204,244,127,0.2)' : 'none',
      transition: 'all 0.2s',
    }} />
    <span style={{ color: published ? '#CCF47F' : '#898989', fontSize: '0.72rem', fontFamily: 'Lyon, serif' }}>
      {published ? 'منشور' : 'مسودة'}
    </span>
  </span>
);

const SpinIcon = () => (
  <span style={{ width: '14px', height: '14px', border: '2px solid rgba(22,22,22,0.3)', borderTopColor: '#161616', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
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
  marginBottom: '6px', fontFamily: 'Lyon, serif',
};

export default AdminNewArticle;