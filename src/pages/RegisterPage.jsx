import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import logo from "../../public/Logo WAW.png";

// ── Validation ───────────────────────────────────────────────────────────────
const emailRx    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRx     = /^[\p{L}\s'-]{2,50}$/u;   // letters, spaces, hyphens, apostrophes
const BANNED_EXT = ['.exe','.js','.php','.sh','.bat','.cmd','.py','.rb'];

const validateRegister = (form, avatarFile, isAr) => {
  const t = (ar, en) => isAr ? ar : en;

  if (!form.name.trim())
    return t('الاسم مطلوب', 'Name is required');
  if (!nameRx.test(form.name.trim()))
    return t('الاسم يجب أن يحتوي على أحرف فقط (2-50 حرف)', 'Name must contain only letters (2-50 chars)');

  if (!form.email.trim())
    return t('البريد الإلكتروني مطلوب', 'Email is required');
  if (!emailRx.test(form.email.trim()))
    return t('صيغة البريد الإلكتروني غير صحيحة', 'Invalid email format');
  if (form.email.length > 255)
    return t('البريد الإلكتروني طويل جداً', 'Email is too long');

  if (!form.password)
    return t('كلمة المرور مطلوبة', 'Password is required');
  if (form.password.length < 6)
    return t('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'Password must be at least 6 characters');
  if (form.password.length > 72)
    return t('كلمة المرور طويلة جداً', 'Password is too long');
  if (!/[A-Za-z]/.test(form.password) && !/\d/.test(form.password))
    return t('كلمة المرور ضعيفة جداً', 'Password is too weak');

  if (!form.confirm)
    return t('يرجى تأكيد كلمة المرور', 'Please confirm your password');
  if (form.password !== form.confirm)
    return t('كلمتا المرور غير متطابقتين', 'Passwords do not match');

  if (avatarFile) {
    const ext = '.' + avatarFile.name.split('.').pop().toLowerCase();
    if (BANNED_EXT.includes(ext))
      return t('نوع الملف غير مسموح به', 'File type not allowed');
    if (!avatarFile.type.startsWith('image/'))
      return t('يجب أن تكون الصورة ملف صورة', 'File must be an image');
    if (avatarFile.size > 3 * 1024 * 1024)
      return t('حجم الصورة يجب أن يكون أقل من 3MB', 'Image size must be less than 3MB');
  }

  return null; // ✅ all good
};

const RegisterPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [avatar, setAvatar]           = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setFieldErrors(p => ({ ...p, [k]: '' }));
    setError('');
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate immediately
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (BANNED_EXT.includes(ext) || !file.type.startsWith('image/'))
      return setError(isAr ? 'نوع الملف غير مسموح به' : 'File type not allowed');
    if (file.size > 3 * 1024 * 1024)
      return setError(isAr ? 'حجم الصورة يجب أن يكون أقل من 3MB' : 'Image size must be less than 3MB');

    setAvatar(file);
    setError('');
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeAvatar = (e) => {
    e.stopPropagation();
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFieldErrors({});

    // ── Client-side validation ──────────────────────────────────────────────
    const validationErr = validateRegister(form, avatar, isAr);
    if (validationErr) return setError(validationErr);

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name',     form.name.trim());
      fd.append('email',    form.email.trim().toLowerCase());
      fd.append('password', form.password);
      if (avatar) fd.append('avatar', avatar);

      await api.register(fd);
      navigate('/login-usears', { state: { registered: true } });
    } catch (err) {
      // Map known server errors to friendly messages
      const msg = err.message || '';
      if (msg.includes('11000') || msg.toLowerCase().includes('duplicate'))
        setError(isAr ? 'هذا البريد الإلكتروني مستخدم بالفعل' : 'This email is already registered');
      else
        setError(msg || (isAr ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again'));
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getStrength = (pw) => {
    if (!pw) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { level: 1, label: isAr ? 'ضعيفة جداً' : 'Very weak',  color: '#E20E3C' },
      { level: 2, label: isAr ? 'ضعيفة'      : 'Weak',       color: '#F2A544' },
      { level: 3, label: isAr ? 'جيدة'        : 'Good',       color: '#F7E328' },
      { level: 4, label: isAr ? 'قوية'        : 'Strong',     color: '#CCF47F' },
    ];
    return map[score - 1] || map[0];
  };

  const strength = getStrength(form.password);

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh', background: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 16px',
        backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(68,105,242,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(204,244,127,0.05) 0%, transparent 50%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/">
            <img src={logo} alt="WAW" style={{ height: 44, margin: '0 auto' }} />
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 22, overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #4469F2, #CCF47F, #F7E328)' }} />

          <div style={{ padding: '32px 28px' }}>
            <h1 style={{
              fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 24,
              color: '#FCF2ED', marginBottom: 6,
            }}>
              {isAr ? 'إنشاء حساب جديد' : 'Create an Account'}
            </h1>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 28 }}>
              {isAr ? 'انضم إلى واو وكن جزءاً من المجتمع' : 'Join WAW and be part of the community'}
            </p>

            {/* Error banner */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                background: 'rgba(226,14,60,0.1)', border: '1px solid rgba(226,14,60,0.25)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                fontSize: 13, color: '#E20E3C',
              }}>
                <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0, marginTop: 2 }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* ── Avatar Picker ── */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => fileInputRef.current.click()}
                    style={{
                      width: 88, height: 88, borderRadius: '50%', cursor: 'pointer',
                      border: avatarPreview ? '2px solid rgba(204,244,127,0.6)' : '2px dashed rgba(204,244,127,0.35)',
                      background: avatarPreview ? 'transparent' : '#1e1e1e',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(204,244,127,0.8)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = avatarPreview ? 'rgba(204,244,127,0.6)' : 'rgba(204,244,127,0.35)'}
                  >
                    {avatarPreview ? (
                      <>
                        <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(0,0,0,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: 0, transition: 'opacity 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                          <i className="fa-solid fa-pen" style={{ color: '#CCF47F', fontSize: 16 }} />
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <i className="fa-solid fa-camera" style={{ fontSize: 22, color: '#444', display: 'block', marginBottom: 4 }} />
                        <span style={{ fontSize: 9, color: '#444', letterSpacing: 0.5 }}>
                          {isAr ? 'رفع صورة' : 'UPLOAD'}
                        </span>
                      </div>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      style={{
                        position: 'absolute', top: -2, insetInlineEnd: -2,
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#E20E3C', border: '2px solid #1a1a1a',
                        color: '#fff', fontSize: 9, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                      }}
                    >
                      <i className="fa-solid fa-times" />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#555' }}>
                  {isAr ? 'صورة الملف الشخصي (اختياري، بحد أقصى 3MB)' : 'Profile photo (optional, max 3MB)'}
                </p>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatar} style={{ display: 'none' }} />
              </div>

              {/* ── Name ── */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
                  <i className="fa-solid fa-user" style={{ fontSize: 9 }} />
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder={isAr ? 'أدخل اسمك' : 'Enter your name'}
                  maxLength={50}
                  autoComplete="name"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#1e1e1e', border: `1px solid ${fieldErrors.name ? 'rgba(226,14,60,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 11, padding: '11px 14px',
                    color: '#FCF2ED', fontSize: 13, outline: 'none',
                    fontFamily: 'inherit', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(204,244,127,0.45)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* ── Email ── */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
                  <i className="fa-solid fa-envelope" style={{ fontSize: 9 }} />
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="example@email.com"
                  maxLength={255}
                  autoComplete="email"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 11, padding: '11px 14px',
                    color: '#FCF2ED', fontSize: 13, outline: 'none',
                    fontFamily: 'inherit', direction: 'ltr',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(68,105,242,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* ── Password ── */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
                  <i className="fa-solid fa-lock" style={{ fontSize: 9 }} />
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={'text'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="••••••••"
                    maxLength={72}
                    autoComplete="new-password"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 11, padding: '11px 42px 11px 14px',
                      color: '#FCF2ED', fontSize: 13, outline: 'none',
                      fontFamily: 'inherit', direction: 'ltr',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(68,105,242,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  {/* <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineEnd: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 13, padding: 4, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
                    onMouseLeave={e => e.currentTarget.style.color = '#555'}
                  >
                    <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button> */}
                </div>

                {/* Strength bar */}
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 99,
                          background: i <= strength.level ? strength.color : 'rgba(255,255,255,0.08)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 10, color: strength.color, marginTop: 4 }}>{strength.label}</p>
                  </div>
                )}
              </div>

              {/* ── Confirm Password ── */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
                  <i className="fa-solid fa-lock" style={{ fontSize: 9 }} />
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={'text'}
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    placeholder="••••••••"
                    maxLength={72}
                    autoComplete="new-password"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: '#1e1e1e',
                      border: `1px solid ${form.confirm && form.confirm !== form.password ? 'rgba(226,14,60,0.5)' : form.confirm && form.confirm === form.password ? 'rgba(204,244,127,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 11, padding: '11px 42px 11px 14px',
                      color: '#FCF2ED', fontSize: 13, outline: 'none',
                      fontFamily: 'inherit', direction: 'ltr',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(68,105,242,0.5)'}
                    onBlur={e => {
                      if (form.confirm && form.confirm !== form.password)
                        e.target.style.borderColor = 'rgba(226,14,60,0.5)';
                      else if (form.confirm && form.confirm === form.password)
                        e.target.style.borderColor = 'rgba(204,244,127,0.4)';
                      else
                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  />
                  {/* <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineEnd: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 13, padding: 4, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
                    onMouseLeave={e => e.currentTarget.style.color = '#555'}
                  >
                    <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button> */}
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p style={{ fontSize: 11, color: '#E20E3C', marginTop: 5 }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginInlineEnd: 4 }} />
                    {isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
                  </p>
                )}
                {form.confirm && form.confirm === form.password && (
                  <p style={{ fontSize: 11, color: '#CCF47F', marginTop: 5 }}>
                    <i className="fa-solid fa-circle-check" style={{ marginInlineEnd: 4 }} />
                    {isAr ? 'كلمتا المرور متطابقتان' : 'Passwords match'}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 6, padding: '12px', borderRadius: 12, border: 'none',
                  background: loading ? 'rgba(204,244,127,0.5)' : '#CCF47F',
                  color: '#000', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 20px rgba(204,244,127,0.25)',
                  transition: 'all 0.2s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d8f98a'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#CCF47F'; }}
              >
                {loading
                  ? <i className="fa-solid fa-spinner fa-spin" />
                  : (isAr ? 'إنشاء الحساب' : 'Create Account')}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: '#555' }}>
              {isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <Link to="/login-usears" style={{ color: '#CCF47F', fontWeight: 600, textDecoration: 'none' }}>
                {isAr ? 'تسجيل الدخول' : 'Login'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;