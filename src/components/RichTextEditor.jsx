import { useState, useRef } from 'react';
import { getContentStyles } from '../utils/contentStyles';

const TOOLBAR_GROUPS = [
  {
    name: 'history',
    buttons: [
      { action: 'undo', icon: '↺', title: 'تراجع' },
      { action: 'redo', icon: '↻', title: 'إعادة' },
    ],
  },
  {
    name: 'format',
    buttons: [
      { action: 'bold',          icon: 'B',  title: 'عريض',      style: { fontWeight: 700 } },
      { action: 'italic',        icon: 'I',  title: 'مائل',      style: { fontStyle: 'italic' } },
      { action: 'underline',     icon: 'U',  title: 'تحته خط',   style: { textDecoration: 'underline' } },
      { action: 'strikethrough', icon: 'S',  title: 'يتوسطه خط', style: { textDecoration: 'line-through' } },
    ],
  },
  {
    name: 'headings',
    buttons: [
      { action: 'heading1', icon: 'H1', title: 'عنوان 1' },
      { action: 'heading2', icon: 'H2', title: 'عنوان 2' },
      { action: 'heading3', icon: 'H3', title: 'عنوان 3' },
      { action: 'heading4', icon: 'H4', title: 'عنوان 4' },
      { action: 'heading5', icon: 'H5', title: 'عنوان 5' },
      { action: 'heading6', icon: 'H6', title: 'عنوان 6' },
      { action: 'heading7', icon: 'H7', title: 'عنوان 7 (div)' },
    ],
  },
  {
    name: 'paragraph',
    label: 'فقرة',
    buttons: [
      { action: 'paragraph',        icon: '¶',   title: 'فقرة <p>' },
      { action: 'lineHeightTight',  icon: '↕1',  title: 'تباعد مضغوط' },
      { action: 'lineHeightNormal', icon: '↕2',  title: 'تباعد عادي' },
      { action: 'lineHeightLoose',  icon: '↕3',  title: 'تباعد واسع' },
      { action: 'indentMore',       icon: '⇥',   title: 'مسافة بادئة أكثر' },
      { action: 'indentLess',       icon: '⇤',   title: 'مسافة بادئة أقل' },
      { action: 'dropcap',          icon: '❡',   title: 'حرف أولي كبير' },
      { action: 'highlight',        icon: '▌',   title: 'تمييز نص' },
      { action: 'lead',             icon: 'Lead', title: 'فقرة مميزة' },
    ],
  },
  {
    name: 'lists',
    buttons: [
      { action: 'bulletList',   icon: '≡', title: 'قائمة نقطية' },
      { action: 'numberedList', icon: '№', title: 'قائمة رقمية' },
    ],
  },
  {
    name: 'insert',
    buttons: [
      { action: 'link',           icon: '🔗', title: 'رابط' },
      { action: 'image',          icon: '🖼',  title: 'صورة' },
      { action: 'blockquote',     icon: '❝',  title: 'اقتباس' },
      { action: 'horizontalLine', icon: '—',  title: 'فاصل' },
      { action: 'code',           icon: '<>', title: 'كود' },
    ],
  },
  {
    name: 'align',
    buttons: [
      { action: 'alignRight',  icon: '▤', title: 'يمين' },
      { action: 'alignCenter', icon: '▣', title: 'وسط' },
      { action: 'alignLeft',   icon: '▥', title: 'يسار' },
    ],
  },
];

// Paragraph snippets
const SNIPPETS = [
  {
    key: 'intro',
    label: 'مقدمة',
    dot: '#CCF47F',
    html: `<p style="font-size:1.05em;line-height:2;color:rgba(252,242,237,0.92)">هذه فقرة مقدمة للمقال أو الصفحة. يمكنك كتابة ملخص موجز يشرح للقارئ ما سيجده في هذا المحتوى.</p>`,
  },
  {
    key: 'fancy-quote',
    label: 'اقتباس مميز',
    dot: '#C084FC',
    html: `<blockquote style="border-right:3px solid #C084FC;margin:1.2em 0;padding:14px 18px;background:rgba(192,132,252,0.06);border-radius:0 10px 10px 0;font-size:1.05em;font-style:italic;color:rgba(252,242,237,0.8)">"ضع هنا الاقتباس المميز."<br/><small style="opacity:0.6;font-style:normal;font-size:0.8em">— اسم المصدر</small></blockquote>`,
  },
  {
    key: 'callout-info',
    label: 'تنبيه',
    dot: '#60A5FA',
    html: `<div style="background:rgba(96,165,250,0.08);border:1px solid rgba(96,165,250,0.25);border-radius:10px;padding:14px 16px;margin:1em 0;display:flex;gap:10px;align-items:flex-start"><span>ℹ️</span><div><strong style="color:#60A5FA;font-size:0.85em">ملاحظة</strong><p style="margin:4px 0 0;font-size:0.88em;color:rgba(252,242,237,0.78)">أضف هنا معلومة مهمة للقارئ.</p></div></div>`,
  },
  {
    key: 'callout-warn',
    label: 'تحذير',
    dot: '#FBBF24',
    html: `<div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.25);border-radius:10px;padding:14px 16px;margin:1em 0;display:flex;gap:10px;align-items:flex-start"><span>⚠️</span><div><strong style="color:#FBBF24;font-size:0.85em">تحذير</strong><p style="margin:4px 0 0;font-size:0.88em;color:rgba(252,242,237,0.78)">أضف هنا تحذيراً يستدعي الانتباه.</p></div></div>`,
  },
  {
    key: 'callout-tip',
    label: 'نصيحة',
    dot: '#34D399',
    html: `<div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.25);border-radius:10px;padding:14px 16px;margin:1em 0;display:flex;gap:10px;align-items:flex-start"><span>💡</span><div><strong style="color:#34D399;font-size:0.85em">نصيحة</strong><p style="margin:4px 0 0;font-size:0.88em;color:rgba(252,242,237,0.78)">أضف هنا نصيحة أو اختصار مفيد.</p></div></div>`,
  },
  {
    key: 'divider-title',
    label: 'عنوان مزخرف',
    dot: '#F87171',
    html: `\n<div style="display:flex;align-items:center;gap:12px;margin:1.5em 0"><div style="flex:1;height:1px;background:rgba(255,255,255,0.08)"></div><span style="color:#CCF47F;font-size:0.8em;font-weight:600;letter-spacing:0.1em">● العنوان هنا ●</span><div style="flex:1;height:1px;background:rgba(255,255,255,0.08)"></div></div>\n`,
  },
  {
    key: 'two-col',
    label: 'عمودان',
    dot: '#FB923C',
    html: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:1em 0"><div><p style="color:rgba(252,242,237,0.88)">محتوى العمود الأول.</p></div><div><p style="color:rgba(252,242,237,0.88)">محتوى العمود الثاني.</p></div></div>`,
  },
];

const FONT_SIZES = [10, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 42];

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'اكتب المحتوى هنا...',
  dir = 'rtl',
  accentColor = '#CCF47F',
}) => {
  const textareaRef = useRef(null);
  const [selection, setSelection]           = useState({ start: 0, end: 0 });
  const [history, setHistory]               = useState([value]);
  const [historyIdx, setHistoryIdx]         = useState(0);
  const [showPreview, setShowPreview]       = useState(false);
  const [showLinkModal, setShowLinkModal]   = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkData, setLinkData]             = useState({ url: '', text: '' });
  const [imageData, setImageData]           = useState({ url: '', alt: '' });
  const [fontSizeIdx, setFontSizeIdx]       = useState(3); // default 14px
  const [currentIndent, setCurrentIndent]   = useState(0);

  // ── History ───────────────────────────────────────────────
  const pushHistory = (val) => {
    const next = history.slice(0, historyIdx + 1);
    next.push(val);
    setHistory(next);
    setHistoryIdx(next.length - 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const idx = historyIdx - 1;
      setHistoryIdx(idx);
      onChange(history[idx]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const idx = historyIdx + 1;
      setHistoryIdx(idx);
      onChange(history[idx]);
    }
  };

  // ── Selection ─────────────────────────────────────────────
  const handleSelect = () => {
    const el = textareaRef.current;
    if (el) setSelection({ start: el.selectionStart, end: el.selectionEnd });
  };

  // ── Wrap / Insert ─────────────────────────────────────────
  const wrap = (before, after = '', newLine = false) => {
    const pre  = value.substring(0, selection.start);
    const sel  = value.substring(selection.start, selection.end);
    const post = value.substring(selection.end);
    const nl   = newLine ? '\n' : '';
    const next = pre + nl + before + sel + after + nl + post;
    onChange(next);
    pushHistory(next);
    setTimeout(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(
          selection.start + nl.length + before.length,
          selection.start + nl.length + before.length + sel.length
        );
      }
    }, 0);
  };

  const insert = (text) => {
    const el = textareaRef.current;
    if (!el) return;
    const s    = el.selectionStart;
    const next = value.substring(0, s) + text + value.substring(el.selectionEnd);
    onChange(next);
    pushHistory(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(s + text.length, s + text.length);
    }, 0);
  };

  // ── Format actions ────────────────────────────────────────
  const formatAction = (action) => {
    switch (action) {
      // History
      case 'undo': return handleUndo();
      case 'redo': return handleRedo();

      // Inline format
      case 'bold':          return wrap('<strong>', '</strong>');
      case 'italic':        return wrap('<em>', '</em>');
      case 'underline':     return wrap('<u>', '</u>');
      case 'strikethrough': return wrap('<del>', '</del>');

      // Headings H1–H3
      case 'heading1': return wrap('<h1>', '</h1>', true);
      case 'heading2': return wrap('<h2>', '</h2>', true);
      case 'heading3': return wrap('<h3>', '</h3>', true);

      // Headings H4–H6 (native HTML)
      case 'heading4': return wrap('<h4>', '</h4>', true);
      case 'heading5': return wrap('<h5>', '</h5>', true);
      case 'heading6': return wrap('<h6>', '</h6>', true);

      // H7 — not in HTML spec, emulated via styled div
      case 'heading7': {
        const sel = value.substring(selection.start, selection.end);
        const html = `<div role="heading" aria-level="7" style="font-size:0.75em;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:rgba(252,242,237,0.55);margin:1em 0 0.4em">${sel || 'عنوان 7'}</div>`;
        const next = value.substring(0, selection.start) + '\n' + html + '\n' + value.substring(selection.end);
        onChange(next);
        pushHistory(next);
        return;
      }

      // ── Paragraph actions ──────────────────────────────────

      // Wrap selected text (or placeholder) in <p>
      case 'paragraph': {
        const sel = value.substring(selection.start, selection.end);
        wrap('<p>', '</p>', true);
        return;
      }

      // Line height variants
      case 'lineHeightTight': {
        const sel = value.substring(selection.start, selection.end);
        const html = `<p style="line-height:1.4">${sel || 'نص الفقرة هنا'}</p>`;
        const next = value.substring(0, selection.start) + '\n' + html + '\n' + value.substring(selection.end);
        onChange(next); pushHistory(next);
        return;
      }
      case 'lineHeightNormal': {
        const sel = value.substring(selection.start, selection.end);
        const html = `<p style="line-height:1.7">${sel || 'نص الفقرة هنا'}</p>`;
        const next = value.substring(0, selection.start) + '\n' + html + '\n' + value.substring(selection.end);
        onChange(next); pushHistory(next);
        return;
      }
      case 'lineHeightLoose': {
        const sel = value.substring(selection.start, selection.end);
        const html = `<p style="line-height:2.2">${sel || 'نص الفقرة هنا'}</p>`;
        const next = value.substring(0, selection.start) + '\n' + html + '\n' + value.substring(selection.end);
        onChange(next); pushHistory(next);
        return;
      }

      // Indent more / less
      case 'indentMore': {
        const newIndent = currentIndent + 40;
        setCurrentIndent(newIndent);
        const sel = value.substring(selection.start, selection.end);
        const html = `<div style="padding-right:${newIndent}px">${sel || 'نص هنا'}</div>`;
        const next = value.substring(0, selection.start) + '\n' + html + '\n' + value.substring(selection.end);
        onChange(next); pushHistory(next);
        return;
      }
      case 'indentLess': {
        const newIndent = Math.max(0, currentIndent - 40);
        setCurrentIndent(newIndent);
        const sel = value.substring(selection.start, selection.end);
        const html = `<div style="padding-right:${newIndent}px">${sel || 'نص هنا'}</div>`;
        const next = value.substring(0, selection.start) + '\n' + html + '\n' + value.substring(selection.end);
        onChange(next); pushHistory(next);
        return;
      }

      // Drop cap — decorative large first letter
      case 'dropcap': {
        const dropcap = `<p><span style="float:right;font-size:3.5em;line-height:0.8;margin-left:8px;color:${accentColor};font-weight:700">ب</span>قية نص الفقرة تأتي هنا بعد الحرف الأولي الكبير.</p>`;
        insert('\n' + dropcap + '\n');
        return;
      }

      // Highlight
      case 'highlight':
        return wrap(
          `<mark style="background:${accentColor}22;color:${accentColor};padding:1px 4px;border-radius:3px">`,
          '</mark>'
        );

      // Lead paragraph
      case 'lead': {
        const sel = value.substring(selection.start, selection.end);
        const html = `<p style="font-size:1.1em;line-height:1.9;color:rgba(252,242,237,0.95);font-weight:400;border-right:3px solid ${accentColor};padding-right:14px">${sel || 'فقرة مقدمة مميزة — هذا النص يظهر بتنسيق مختلف عن باقي المحتوى.'}</p>`;
        const next = value.substring(0, selection.start) + '\n' + html + '\n' + value.substring(selection.end);
        onChange(next); pushHistory(next);
        return;
      }

      // Lists
      case 'bulletList': {
        const sel = value.substring(selection.start, selection.end);
        if (sel) {
          const items = sel.split('\n').filter(l => l.trim()).map(l => `  <li>${l.trim()}</li>`).join('\n');
          const html  = `<ul>\n${items}\n</ul>`;
          const next  = value.substring(0, selection.start) + html + value.substring(selection.end);
          onChange(next); pushHistory(next);
        } else {
          insert('<ul>\n  <li>عنصر 1</li>\n  <li>عنصر 2</li>\n</ul>\n');
        }
        break;
      }
      case 'numberedList': {
        const sel = value.substring(selection.start, selection.end);
        if (sel) {
          const items = sel.split('\n').filter(l => l.trim()).map(l => `  <li>${l.trim()}</li>`).join('\n');
          const html  = `<ol>\n${items}\n</ol>`;
          const next  = value.substring(0, selection.start) + html + value.substring(selection.end);
          onChange(next); pushHistory(next);
        } else {
          insert('<ol>\n  <li>أولاً</li>\n  <li>ثانياً</li>\n</ol>\n');
        }
        break;
      }

      // Insert
      case 'blockquote':     return wrap('<blockquote>', '</blockquote>', true);
      case 'code':           return wrap('<code>', '</code>');
      case 'horizontalLine': return insert('\n<hr />\n');

      // Align
      case 'alignLeft':   return wrap('<div style="text-align:left">',   '</div>', true);
      case 'alignCenter': return wrap('<div style="text-align:center">', '</div>', true);
      case 'alignRight':  return wrap('<div style="text-align:right">',  '</div>', true);

      // Modals
      case 'link':  return setShowLinkModal(true);
      case 'image': return setShowImageModal(true);

      default: break;
    }
  };

  // ── Font size (toolbar controls) ─────────────────────────
  const applyFontSize = (dir) => {
    const newIdx = Math.max(0, Math.min(FONT_SIZES.length - 1, fontSizeIdx + dir));
    setFontSizeIdx(newIdx);
    const sz = FONT_SIZES[newIdx] + 'px';
    const sel = value.substring(selection.start, selection.end);
    const before = `<span style="font-size:${sz}">`;
    const after  = '</span>';
    const pre    = value.substring(0, selection.start);
    const post   = value.substring(selection.end);
    const next   = pre + before + sel + after + post;
    onChange(next);
    pushHistory(next);
  };

  const applyFontSizeVal = (sz) => {
    if (!sz) return;
    const sel    = value.substring(selection.start, selection.end);
    const before = `<span style="font-size:${sz}">`;
    const after  = '</span>';
    const pre    = value.substring(0, selection.start);
    const post   = value.substring(selection.end);
    const next   = pre + before + sel + after + post;
    onChange(next);
    pushHistory(next);
  };

  // ── Snippet insert ────────────────────────────────────────
  const insertSnippet = (html) => {
    insert('\n' + html + '\n');
  };

  // ── Link / Image insert ───────────────────────────────────
  const handleInsertLink = () => {
    if (!linkData.url) return;
    insert(`<a href="${linkData.url}" target="_blank" rel="noopener noreferrer">${linkData.text || linkData.url}</a>`);
    setShowLinkModal(false);
    setLinkData({ url: '', text: '' });
  };

  const handleInsertImage = () => {
    if (!imageData.url) return;
    insert(`<img src="${imageData.url}" alt="${imageData.alt}" style="max-width:100%;height:auto;" />`);
    setShowImageModal(false);
    setImageData({ url: '', alt: '' });
  };

  // ── Preview ───────────────────────────────────────────────
const previewHtml = () => ({
  __html: `
    <style>
      * { box-sizing: border-box; }
      ${getContentStyles(dir, 'preview-body')}
    </style>
    <div class="preview-body" style="text-align: ${dir === 'rtl' ? 'right' : 'left'}">
      ${value}
    </div>
  `,
});

  // ── Styles ────────────────────────────────────────────────
  const btnBase = {
    height: '28px',
    minWidth: '28px',
    padding: '0 7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: '1px solid transparent',
    background: 'transparent',
    color: '#898989',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: 'Lyon, serif',
    transition: 'all 0.12s',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    gap: '4px',
  };

  const modalOverlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  };

  const modalBox = {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '440px',
    fontFamily: 'Lyon, serif',
  };

  const modalInput = {
    width: '100%',
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#FCF2ED',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'Lyon, serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const hoverBtn = (e, on) => {
    e.currentTarget.style.background    = on ? 'rgba(255,255,255,0.06)' : 'transparent';
    e.currentTarget.style.color         = on ? '#FCF2ED' : '#898989';
    e.currentTarget.style.borderColor   = on ? 'rgba(255,255,255,0.1)' : 'transparent';
  };

  return (
    <>
      <div style={{
        background: '#161616',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>

        {/* ── Toolbar ── */}
        <div style={{
          background: '#1a1a1a',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '8px 12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2px',
          alignItems: 'center',
        }}>
          {TOOLBAR_GROUPS.map((group, gi) => (
            <div key={group.name} style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>

              {/* Font size controls — injected inside the paragraph group */}
              {group.name === 'paragraph' && (
                <>
                  <button
                    type="button" title="تصغير الخط"
                    onClick={() => applyFontSize(-1)}
                    style={{ ...btnBase }}
                    onMouseEnter={e => hoverBtn(e, true)}
                    onMouseLeave={e => hoverBtn(e, false)}
                  >A↓</button>

                  <select
                    title="حجم الخط"
                    onChange={e => { applyFontSizeVal(e.target.value); e.target.value = ''; }}
                    defaultValue=""
                    style={{
                      background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#898989',
                      fontSize: '0.72rem',
                      padding: '2px 4px',
                      height: '26px',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="">حجم</option>
                    {[12,14,16,18,20,24,28,32].map(s => (
                      <option key={s} value={s + 'px'}>{s}</option>
                    ))}
                  </select>

                  <button
                    type="button" title="تكبير الخط"
                    onClick={() => applyFontSize(1)}
                    style={{ ...btnBase }}
                    onMouseEnter={e => hoverBtn(e, true)}
                    onMouseLeave={e => hoverBtn(e, false)}
                  >A↑</button>

                  <span style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                </>
              )}

              {group.buttons.map(btn => (
                <button
                  key={btn.action}
                  type="button"
                  title={btn.title}
                  onClick={() => formatAction(btn.action)}
                  disabled={
                    btn.action === 'undo' ? historyIdx === 0
                    : btn.action === 'redo' ? historyIdx === history.length - 1
                    : false
                  }
                  style={{
                    ...btnBase,
                    ...(btn.style || {}),
                    opacity:
                      (btn.action === 'undo' && historyIdx === 0) ||
                      (btn.action === 'redo' && historyIdx === history.length - 1)
                        ? 0.3 : 1,
                  }}
                  onMouseEnter={e => hoverBtn(e, true)}
                  onMouseLeave={e => hoverBtn(e, false)}
                >
                  {btn.icon}
                </button>
              ))}

              {gi < TOOLBAR_GROUPS.length - 1 && (
                <span style={{
                  width: '1px', height: '18px',
                  background: 'rgba(255,255,255,0.08)',
                  margin: '0 5px', flexShrink: 0,
                }} />
              )}
            </div>
          ))}

          {/* Preview toggle */}
          <span style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
          <button
            type="button"
            onClick={() => setShowPreview(p => !p)}
            style={{
              ...btnBase,
              width: 'auto',
              padding: '0 10px',
              fontSize: '0.72rem',
              background: showPreview ? `${accentColor}18` : 'transparent',
              color:      showPreview ? accentColor : '#898989',
              border:     showPreview ? `1px solid ${accentColor}44` : '1px solid transparent',
            }}
            onMouseEnter={e => { if (!showPreview) hoverBtn(e, true); }}
            onMouseLeave={e => { if (!showPreview) hoverBtn(e, false); }}
          >
            {showPreview ? '✎ تعديل' : '👁 معاينة'}
          </button>
        </div>

        {/* ── Snippets Bar ── */}
        {!showPreview && (
          <div style={{
            background: '#141414',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '6px 12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            alignItems: 'center',
          }}>
            <span style={{
              color: '#444', fontSize: '0.65rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginLeft: '4px',
            }}>فقرات:</span>

            {SNIPPETS.map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => insertSnippet(s.html)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '3px 9px', borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#898989', cursor: 'pointer',
                  fontSize: '0.72rem', transition: 'all 0.15s',
                  whiteSpace: 'nowrap', fontFamily: 'Lyon, serif',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background    = `rgba(204,244,127,0.1)`;
                  e.currentTarget.style.color         = accentColor;
                  e.currentTarget.style.borderColor   = `rgba(204,244,127,0.3)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background    = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color         = '#898989';
                  e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.1)';
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Editor / Preview ── */}
        {showPreview ? (
          <div
            dir={dir}
            style={{
              minHeight: '280px', padding: '20px',
              color: 'rgba(252,242,237,0.88)', fontSize: '0.9rem',
              lineHeight: 1.8, fontFamily: "'Ko Sans', sans-serif",
            }}
            dangerouslySetInnerHTML={previewHtml()}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => { onChange(e.target.value); pushHistory(e.target.value); }}
            onSelect={handleSelect}
            onKeyUp={handleSelect}
            placeholder={placeholder}
            dir={dir}
            rows={14}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              outline: 'none', padding: '16px', color: '#FCF2ED',
              fontSize: '0.85rem', lineHeight: 1.8, resize: 'vertical',
              fontFamily: 'monospace', boxSizing: 'border-box',
              minHeight: '280px',
            }}
          />
        )}

        {/* ── Footer ── */}
        <div style={{
          background: '#1a1a1a',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '6px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: '#898989', fontSize: '0.7rem' }}>يدعم HTML</span>
          <span style={{ color: '#898989', fontSize: '0.7rem' }}>
            {value.length} حرف · {value.split(/\s+/).filter(Boolean).length} كلمة
          </span>
        </div>
      </div>

      {/* ── Link Modal ── */}
      {showLinkModal && (
        <div style={modalOverlay} onClick={() => setShowLinkModal(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.95rem' }}>إدراج رابط</span>
              <button type="button" onClick={() => setShowLinkModal(false)} style={{ ...btnBase, color: '#898989' }}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <p style={{ color: '#898989', fontSize: '0.75rem', marginBottom: '6px' }}>نص الرابط</p>
                <input
                  value={linkData.text}
                  onChange={e => setLinkData(p => ({ ...p, text: e.target.value }))}
                  placeholder="نص يظهر للقارئ"
                  dir="rtl"
                  style={modalInput}
                  onFocus={e  => e.target.style.borderColor = accentColor}
                  onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <p style={{ color: '#898989', fontSize: '0.75rem', marginBottom: '6px' }}>الرابط URL *</p>
                <input
                  value={linkData.url}
                  onChange={e => setLinkData(p => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                  dir="ltr"
                  style={modalInput}
                  onFocus={e  => e.target.style.borderColor = accentColor}
                  onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>
            <div style={{
              padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', justifyContent: 'flex-end', gap: '8px',
            }}>
              <button type="button" onClick={() => setShowLinkModal(false)}
                style={{ ...btnBase, width: 'auto', padding: '0 16px', color: '#898989', fontSize: '0.8rem' }}>
                إلغاء
              </button>
              <button type="button" onClick={handleInsertLink}
                style={{ ...btnBase, width: 'auto', padding: '0 16px', background: accentColor, color: '#161616', fontWeight: 700, fontSize: '0.8rem', border: 'none' }}>
                إدراج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Modal ── */}
      {showImageModal && (
        <div style={modalOverlay} onClick={() => setShowImageModal(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ color: '#FCF2ED', fontWeight: 700, fontSize: '0.95rem' }}>إدراج صورة</span>
              <button type="button" onClick={() => setShowImageModal(false)} style={{ ...btnBase, color: '#898989' }}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <p style={{ color: '#898989', fontSize: '0.75rem', marginBottom: '6px' }}>رابط الصورة *</p>
                <input
                  value={imageData.url}
                  onChange={e => setImageData(p => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                  dir="ltr"
                  style={modalInput}
                  onFocus={e  => e.target.style.borderColor = accentColor}
                  onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <p style={{ color: '#898989', fontSize: '0.75rem', marginBottom: '6px' }}>النص البديل</p>
                <input
                  value={imageData.alt}
                  onChange={e => setImageData(p => ({ ...p, alt: e.target.value }))}
                  placeholder="وصف الصورة"
                  dir="rtl"
                  style={modalInput}
                  onFocus={e  => e.target.style.borderColor = accentColor}
                  onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
              {imageData.url && (
                <img
                  src={imageData.url}
                  alt="preview"
                  style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
            </div>
            <div style={{
              padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', justifyContent: 'flex-end', gap: '8px',
            }}>
              <button type="button" onClick={() => setShowImageModal(false)}
                style={{ ...btnBase, width: 'auto', padding: '0 16px', color: '#898989', fontSize: '0.8rem' }}>
                إلغاء
              </button>
              <button type="button" onClick={handleInsertImage}
                style={{ ...btnBase, width: 'auto', padding: '0 16px', background: accentColor, color: '#161616', fontWeight: 700, fontSize: '0.8rem', border: 'none' }}>
                إدراج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RichTextEditor;