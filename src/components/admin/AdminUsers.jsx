import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const ROLE_CFG = {
  admin: { label: 'أدمن',   color: '#CCF47F', bg: 'rgba(204,244,127,0.08)', border: 'rgba(204,244,127,0.2)',  icon: 'fa-shield-halved' },
  user:  { label: 'مستخدم', color: '#4469F2', bg: 'rgba(68,105,242,0.08)',  border: 'rgba(68,105,242,0.2)',   icon: 'fa-user' },
};
const PALETTE = ['#CCF47F','#4469F2','#F7E328','#F2A544','#E20E3C','#0ea5e9','#a855f7'];
const avatarColor = (str = '') => PALETTE[str.charCodeAt(0) % PALETTE.length];

/* ─── Container width hook ────────────────────────────────────────────────── */
const useContainerWidth = (ref) => {
  const [width, setWidth] = useState(900);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(e => setWidth(e[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return width;
};

/* ─── Avatar ──────────────────────────────────────────────────────────────── */
const Avatar = ({ user, size = 40, editable = false, onUpload }) => {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const color   = avatarColor(user?.name || user?.email || '');
  const initial = (user?.name || user?.email || '?')[0].toUpperCase();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const token = localStorage.getItem('waw_token');
      const res = await fetch(`${BASE_URL}/users/${user._id}/avatar`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      if (!res.ok) throw new Error('فشل الرفع');
      const data = await res.json();
      onUpload?.(data.avatar);
    } catch (err) { console.error(err); }
    finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {user?.avatar ? (
        <img src={user.avatar} alt={user.name}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}40` }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: color + '15', border: `2px solid ${color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.38, fontWeight: 700, color,
        }}>{initial}</div>
      )}
      {editable && (
        <>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <button onClick={() => inputRef.current?.click()} disabled={uploading} style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 20, height: 20, borderRadius: '50%',
            background: '#CCF47F', border: '2px solid #121212',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 9,
          }}>
            {uploading
              ? <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 8 }} />
              : <i className="fa-solid fa-camera" style={{ color: '#000' }} />}
          </button>
        </>
      )}
    </div>
  );
};

/* ─── Role Badge ──────────────────────────────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const cfg = ROLE_CFG[role] || ROLE_CFG.user;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <i className={`fa-solid ${cfg.icon}`} style={{ fontSize: 9 }} />
      {cfg.label}
    </span>
  );
};

/* ─── Field wrapper ───────────────────────────────────────────────────────── */
const Field = ({ label, icon, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 600, color: '#666', marginBottom: 7,
      textTransform: 'uppercase', letterSpacing: 1,
    }}>
      <i className={`fa-solid ${icon}`} style={{ fontSize: 9 }} />
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '10px 14px',
  color: '#FCF2ED', fontSize: 13,
  outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit',
};

/* ─── User Modal ──────────────────────────────────────────────────────────── */
const UserModal = ({ user: editUser, onClose, onSave }) => {
  const isEdit = !!editUser;
  const [form,    setForm]    = useState({ name: editUser?.name || '', email: editUser?.email || '', password: '', role: editUser?.role || 'user' });
  const [avatar,  setAvatar]  = useState(editUser?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) return setError('الاسم والإيميل مطلوبان');
    if (!isEdit && !form.password) return setError('كلمة المرور مطلوبة للمستخدم الجديد');
    setLoading(true); setError('');
    try { await onSave(form); onClose(); }
    catch (e) { setError(e.message || 'حدث خطأ'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }} dir="rtl">
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: 460, margin: '0 16px',
        background: '#1a1a1a', borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)', overflow: 'hidden',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg, #CCF47F, #4469F2, #F7E328)' }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 18, color: '#FCF2ED', margin: 0 }}>
              {isEdit ? 'تعديل المستخدم' : 'مستخدم جديد'}
            </h2>
            <p style={{ fontSize: 11, color: '#555', margin: '4px 0 0' }}>
              {isEdit ? `تعديل بيانات ${editUser.name || editUser.email}` : 'إضافة حساب جديد للنظام'}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#666', cursor: 'pointer', fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Avatar — edit only */}
        {isEdit && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px',
            background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Avatar user={{ ...editUser, avatar }} size={56} editable onUpload={setAvatar} />
            <div>
              <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500 }}>{editUser.name || 'بدون اسم'}</p>
              <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>اضغط على الصورة لتغييرها</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div style={{ padding: '20px 24px' }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(226,14,60,0.1)', border: '1px solid rgba(226,14,60,0.25)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: '#E20E3C',
            }}>
              <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 12 }} />
              {error}
            </div>
          )}
          <Field label="الاسم" icon="fa-user">
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="اسم المستخدم" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(204,244,127,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </Field>
          <Field label="البريد الإلكتروني" icon="fa-envelope">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="example@email.com" style={{ ...inputStyle, direction: 'ltr' }}
              onFocus={e => e.target.style.borderColor = 'rgba(204,244,127,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </Field>
          <Field label={isEdit ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'} icon="fa-lock">
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="••••••••" style={{ ...inputStyle, direction: 'ltr' }}
              onFocus={e => e.target.style.borderColor = 'rgba(204,244,127,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
          </Field>
          <Field label="الصلاحية" icon="fa-shield-halved">
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(ROLE_CFG).map(([key, cfg]) => (
                <button key={key} onClick={() => set('role', key)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: form.role === key ? cfg.bg : 'rgba(255,255,255,0.03)',
                  color: form.role === key ? cfg.color : '#555',
                  border: form.role === key ? `1px solid ${cfg.border}` : '1px solid rgba(255,255,255,0.08)',
                }}>
                  <i className={`fa-solid ${cfg.icon}`} style={{ fontSize: 11 }} />
                  {cfg.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1, padding: '11px 0', borderRadius: 11, border: 'none',
            background: '#CCF47F', color: '#000', fontSize: 13, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            boxShadow: '0 4px 16px rgba(204,244,127,0.2)', transition: 'all 0.2s',
          }}>
            {loading ? <i className="fa-solid fa-spinner fa-spin" /> : isEdit ? 'حفظ التغييرات' : 'إنشاء الحساب'}
          </button>
          <button onClick={onClose} style={{
            padding: '11px 20px', borderRadius: 11,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#777', fontSize: 13, cursor: 'pointer',
          }}>إلغاء</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Confirm Delete ──────────────────────────────────────────────────────── */
const ConfirmModal = ({ user, onClose, onConfirm, loading }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }} dir="rtl">
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }} onClick={onClose} />
    <div style={{
      position: 'relative', background: '#1a1a1a', borderRadius: 20, padding: 28,
      border: '1px solid rgba(226,14,60,0.25)', width: '100%', maxWidth: 360, margin: '0 16px',
      boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
        background: 'rgba(226,14,60,0.12)', border: '1px solid rgba(226,14,60,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ color: '#E20E3C', fontSize: 20 }} />
      </div>
      <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 900, textAlign: 'center', color: '#FCF2ED', fontSize: 18, marginBottom: 8 }}>
        حذف المستخدم
      </h3>
      <p style={{ color: '#666', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
        هل أنت متأكد من حذف{' '}
        <span style={{ color: '#aaa', fontWeight: 600 }}>{user?.name || user?.email}</span>؟{' '}
        لا يمكن التراجع عن هذا الإجراء.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onConfirm} disabled={loading} style={{
          flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(226,14,60,0.35)',
          background: 'rgba(226,14,60,0.15)', color: '#E20E3C', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>
          {loading ? <i className="fa-solid fa-spinner fa-spin" /> : 'حذف نهائياً'}
        </button>
        <button onClick={onClose} style={{
          flex: 1, padding: '11px 0', borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent', color: '#777', fontSize: 13, cursor: 'pointer',
        }}>إلغاء</button>
      </div>
    </div>
  </div>
);

/* ─── User Row (table — medium/large) ────────────────────────────────────── */
const UserRow = ({ u, i, total, onEdit, onDelete, onRoleToggle, onAvatarUpdate }) => (
  <div
    style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr auto auto',
      alignItems: 'center', padding: '13px 20px',
      borderBottom: i < total - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    {/* User info */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <Avatar user={u} size={38} editable onUpload={(av) => onAvatarUpdate(u._id, av)} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {u.name || '—'}
        </p>
        <p style={{ fontSize: 10, color: '#555', marginTop: 2 }}>
          انضم{' '}
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' }) : '—'}
        </p>
      </div>
    </div>

    {/* Email */}
    <div style={{ paddingLeft: 8, minWidth: 0 }}>
      <p style={{ fontSize: 12, color: '#888', direction: 'ltr', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {u.email}
      </p>
    </div>

    {/* Role */}
    <div style={{ display: 'flex', justifyContent: 'center', paddingLeft: 40 }}>
      <RoleBadge role={u.role} />
    </div>

    {/* Actions */}
    <div style={{ display: 'flex', gap: 4, paddingLeft: 16 }}>
      {[
        { icon: u.role === 'admin' ? 'fa-user-minus' : 'fa-user-shield', title: u.role === 'admin' ? 'تحويل لمستخدم' : 'ترقية لأدمن', hoverColor: '#CCF47F', onClick: () => onRoleToggle(u) },
        { icon: 'fa-pen',   title: 'تعديل', hoverColor: '#4469F2', onClick: () => onEdit(u) },
        { icon: 'fa-trash', title: 'حذف',   hoverColor: '#E20E3C', onClick: () => onDelete(u) },
      ].map(btn => (
        <button key={btn.icon} onClick={btn.onClick} title={btn.title} style={{
          width: 30, height: 30, borderRadius: 8, border: 'none',
          background: 'transparent', color: '#555', cursor: 'pointer', fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = btn.hoverColor; e.currentTarget.style.background = btn.hoverColor + '12'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'transparent'; }}
        >
          <i className={`fa-solid ${btn.icon}`} />
        </button>
      ))}
    </div>
  </div>
);

/* ─── User Card (mobile) ──────────────────────────────────────────────────── */
const UserCard = ({ u, onEdit, onDelete, onRoleToggle, onAvatarUpdate }) => (
  <div style={{
    background: 'rgba(255,255,255,0.02)', borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px',
  }}>
    {/* Top row */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <Avatar user={u} size={42} editable onUpload={(av) => onAvatarUpdate(u._id, av)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {u.name || '—'}
        </p>
        <p style={{ fontSize: 11, color: '#888', direction: 'ltr', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
          {u.email}
        </p>
      </div>
      <RoleBadge role={u.role} />
    </div>

    {/* Bottom row */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 10, color: '#555' }}>
        انضم {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' }) : '—'}
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          { icon: u.role === 'admin' ? 'fa-user-minus' : 'fa-user-shield', title: u.role === 'admin' ? 'تحويل لمستخدم' : 'ترقية لأدمن', hoverColor: '#CCF47F', onClick: () => onRoleToggle(u) },
          { icon: 'fa-pen',   title: 'تعديل', hoverColor: '#4469F2', onClick: () => onEdit(u) },
          { icon: 'fa-trash', title: 'حذف',   hoverColor: '#E20E3C', onClick: () => onDelete(u) },
        ].map(btn => (
          <button key={btn.icon} onClick={btn.onClick} title={btn.title} style={{
            width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent', color: '#555', cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = btn.hoverColor; e.currentTarget.style.background = btn.hoverColor + '12'; e.currentTarget.style.borderColor = btn.hoverColor + '40'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <i className={`fa-solid ${btn.icon}`} />
          </button>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Main ────────────────────────────────────────────────────────────────── */
const AdminUsers = () => {
  const containerRef = useRef(null);
  const cw = useContainerWidth(containerRef);
  const isNarrow = cw < 640;

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [modal,      setModal]      = useState(null);
  const [actionLoad, setActionLoad] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (!q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
      && (filterRole === 'all' || u.role === filterRole);
  });

  const stats = {
    total:   users.length,
    admins:  users.filter(u => u.role === 'admin').length,
    regular: users.filter(u => u.role === 'user').length,
  };

  const handleSave = async (form) => {
    if (modal.user) await api.updateUser(modal.user._id, form);
    else             await api.register(form);
    await fetchUsers();
  };

  const handleDelete = async () => {
    setActionLoad(true);
    try { await api.deleteUser(modal.user._id); await fetchUsers(); setModal(null); }
    finally { setActionLoad(false); }
  };

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      await api.updateUser(u._id, { role: newRole });
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, role: newRole } : x));
    } catch (e) { console.error(e); }
  };

  const handleAvatarUpdate = (userId, newAvatar) =>
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, avatar: newAvatar } : u));

  const STATS_CFG = [
    { label: 'إجمالي الحسابات', value: stats.total,   color: '#FCF2ED', icon: 'fa-users' },
    { label: 'مسؤولون',          value: stats.admins,  color: '#CCF47F', icon: 'fa-shield-halved' },
    { label: 'مستخدمون عاديون', value: stats.regular,  color: '#4469F2', icon: 'fa-user' },
  ];

  return (
    <div ref={containerRef} dir="rtl">

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: isNarrow ? 'flex-start' : 'flex-end',
        flexDirection: isNarrow ? 'column' : 'row',
        justifyContent: 'space-between', gap: 16, marginBottom: 24,
      }}>
        <div>
          <p style={{ fontSize: 10, color: '#555', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>Users</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: isNarrow ? 26 : 32, color: '#FCF2ED', margin: 0, letterSpacing: '-0.5px' }}>
            المستخدمون
          </h1>
          <p style={{ fontSize: 12, color: '#555', marginTop: 6 }}>إدارة الحسابات والصلاحيات</p>
        </div>
        <button onClick={() => setModal({ type: 'add' })} style={{
          display: 'flex', alignItems: 'center', gap: 8, alignSelf: isNarrow ? 'flex-start' : 'auto',
          padding: '10px 20px', borderRadius: 12, border: 'none',
          background: '#CCF47F', color: '#000', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 4px 20px rgba(204,244,127,0.2)', whiteSpace: 'nowrap',
        }}>
          <i className="fa-solid fa-plus" style={{ fontSize: 11 }} />
          مستخدم جديد
        </button>
      </div>

      {/* ── Stats — 1 col on narrow, 3 col otherwise ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isNarrow ? '1fr' : 'repeat(3, 1fr)',
        gap: 12, marginBottom: 20,
      }}>
        {STATS_CFG.map(s => (
          <div key={s.label} style={{
            background: 'linear-gradient(145deg, #1e1e1e 0%, #181818 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: isNarrow ? '12px 16px' : '16px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: s.color + '12', border: `1px solid ${s.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, fontSize: 14,
            }}>
              <i className={`fa-solid ${s.icon}`} />
            </div>
            <div>
              <div style={{ fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: isNarrow ? 24 : 28, color: '#FCF2ED', lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center',
        flexWrap: isNarrow ? 'wrap' : 'nowrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: isNarrow ? '100%' : 200 }}>
          <i className="fa-solid fa-magnifying-glass" style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            right: 14, color: '#555', fontSize: 12, pointerEvents: 'none',
          }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو البريد..."
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 11, padding: '10px 40px 10px 14px',
              color: '#FCF2ED', fontSize: 13, outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Role filter */}
        <div style={{
          display: 'flex', background: '#1e1e1e',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, padding: 4, gap: 3,
          flexShrink: 0,
        }}>
          {[['all', 'الكل'], ['admin', 'أدمن'], ['user', 'مستخدم']].map(([key, lbl]) => (
            <button key={key} onClick={() => setFilterRole(key)} style={{
              padding: isNarrow ? '6px 10px' : '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: isNarrow ? 11 : 12, fontWeight: 500, transition: 'all 0.15s',
              background: filterRole === key ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: filterRole === key ? '#FCF2ED' : '#666',
              whiteSpace: 'nowrap',
            }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 0' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ color: '#555', fontSize: 22 }} />
          <p style={{ color: '#555', fontSize: 13 }}>جارٍ التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '60px 0',
          background: 'linear-gradient(145deg, #1e1e1e 0%, #181818 100%)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-users-slash" style={{ color: '#555', fontSize: 18 }} />
          </div>
          <p style={{ color: '#555', fontSize: 13 }}>لا يوجد مستخدمون</p>
        </div>
      ) : isNarrow ? (
        /* ── Mobile: Cards ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(u => (
            <UserCard
              key={u._id} u={u}
              onEdit={u => setModal({ type: 'edit', user: u })}
              onDelete={u => setModal({ type: 'delete', user: u })}
              onRoleToggle={handleRoleToggle}
              onAvatarUpdate={handleAvatarUpdate}
            />
          ))}
        </div>
      ) : (
        /* ── Desktop/Tablet: Table ── */
        <div style={{
          background: 'linear-gradient(145deg, #1e1e1e 0%, #181818 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, overflow: 'hidden',
        }}>
          {/* Table head */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr auto auto',
            padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: 10, fontWeight: 700, color: '#555',
            textTransform: 'uppercase', letterSpacing: 2,
          }}>
            <span>المستخدم</span>
            <span>البريد الإلكتروني</span>
            <span style={{ textAlign: 'center', paddingLeft: 40 }}>الصلاحية</span>
            <span style={{ textAlign: 'center', paddingLeft: 16 }}>إجراءات</span>
          </div>

          {filtered.map((u, i) => (
            <UserRow
              key={u._id} u={u} i={i} total={filtered.length}
              onEdit={u => setModal({ type: 'edit', user: u })}
              onDelete={u => setModal({ type: 'delete', user: u })}
              onRoleToggle={handleRoleToggle}
              onAvatarUpdate={handleAvatarUpdate}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p style={{ color: '#555', fontSize: 11, marginTop: 10, textAlign: 'left' }}>
          {filtered.length} من {users.length} مستخدم
        </p>
      )}

      {/* Modals */}
      {modal?.type === 'add'    && <UserModal onClose={() => setModal(null)} onSave={handleSave} />}
      {modal?.type === 'edit'   && <UserModal user={modal.user} onClose={() => setModal(null)} onSave={handleSave} />}
      {modal?.type === 'delete' && <ConfirmModal user={modal.user} onClose={() => setModal(null)} onConfirm={handleDelete} loading={actionLoad} />}
    </div>
  );
};

export default AdminUsers;