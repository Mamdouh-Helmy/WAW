import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import logo from "../../public/Logo WAW.png";

// ── simple client-side validation ──────────────────────────────────────────
const validateForm = (form, isAr) => {
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.email.trim())
    return isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required';
  if (!emailRx.test(form.email.trim()))
    return isAr ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format';
  if (!form.password)
    return isAr ? 'كلمة المرور مطلوبة' : 'Password is required';
  if (form.password.length < 6)
    return isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
  if (form.password.length > 72)
    return isAr ? 'كلمة المرور طويلة جداً' : 'Password is too long';

  return null; // no error
};

const LoginPageUsears = () => {
  const { language } = useLanguage();
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAr = language === 'ar';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isAdminError, setIsAdminError] = useState(false); // ← admin tried to login here

  const justRegistered = location.state?.registered;

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setError('');
    setIsAdminError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setIsAdminError(false);

    // ── Client-side validation ──────────────────────────────────────────────
    const validationError = validateForm(form, isAr);
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);

      // ── Role check — admins should use /login ───────────────────────────
      if (user.role === 'admin') {
        // clear the session so they're not accidentally logged in
        logout();
        setIsAdminError(true);
        setForm(p => ({ ...p, password: '' }));
        return;
      }

      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || (isAr ? 'بيانات غير صحيحة' : 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        backgroundImage: `
          radial-gradient(ellipse at 75% 20%, rgba(204,244,127,0.07) 0%, transparent 55%),
          radial-gradient(ellipse at 20% 80%, rgba(68,105,242,0.06) 0%, transparent 55%)
        `,
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: '10%', insetInlineEnd: '8%',
        width: 260, height: 260, borderRadius: '50%',
        background: 'rgba(204,244,127,0.04)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '15%', insetInlineStart: '6%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(68,105,242,0.05)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/">
            <img src={logo} alt="WAW" style={{ height: 44, margin: '0 auto', display: 'block' }} />
          </Link>
          <p style={{ marginTop: 10, fontSize: 12, color: '#444', letterSpacing: 2, textTransform: 'uppercase' }}>
            {isAr ? 'منصة إعلامية مستقلة' : 'Independent Media Platform'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 32px 90px rgba(0,0,0,0.55)',
        }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #CCF47F, #4469F2, #F7E328)' }} />

          <div style={{ padding: '32px 28px 28px' }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: 26,
                color: '#FCF2ED', margin: 0, letterSpacing: '-0.5px',
              }}>
                {isAr ? 'أهلاً بعودتك' : 'Welcome Back'}
              </h1>
              <p style={{ fontSize: 13, color: '#555', marginTop: 6 }}>
                {isAr ? 'سجّل دخولك للمتابعة' : 'Sign in to continue'}
              </p>
            </div>

            {/* ── Admin tried to login here ── */}
            {isAdminError && (
              <div style={{
                background: 'rgba(68,105,242,0.08)',
                border: '1px solid rgba(68,105,242,0.3)',
                borderRadius: 12, padding: '14px 16px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <i className="fa-solid fa-shield-halved" style={{ color: '#4469F2', fontSize: 15 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4469F2' }}>
                    {isAr ? 'هذه الصفحة للمستخدمين العاديين فقط' : 'This page is for regular users only'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#999', margin: '0 0 12px 0', lineHeight: 1.6 }}>
                  {isAr
                    ? 'البيانات التي أدخلتها تخص حساب مسؤول. يُرجى استخدام صفحة تسجيل دخول المسؤولين.'
                    : 'The credentials you entered belong to an admin account. Please use the admin login page.'}
                </p>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 9,
                    background: 'rgba(68,105,242,0.12)',
                    border: '1px solid rgba(68,105,242,0.35)',
                    color: '#4469F2', fontSize: 12, fontWeight: 700,
                    textDecoration: 'none', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(68,105,242,0.22)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(68,105,242,0.12)'}
                >
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: 10 }} />
                  {isAr ? 'انتقل لصفحة تسجيل دخول المسؤولين' : 'Go to Admin Login'}
                </Link>
              </div>
            )}

            {/* ── Success after register ── */}
            {justRegistered && !isAdminError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(204,244,127,0.08)',
                border: '1px solid rgba(204,244,127,0.25)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                fontSize: 13, color: '#CCF47F',
              }}>
                <i className="fa-solid fa-circle-check" />
                {isAr ? 'تم إنشاء الحساب بنجاح! سجّل دخولك الآن.' : 'Account created! Please sign in.'}
              </div>
            )}

            {/* ── General error ── */}
            {error && !isAdminError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(226,14,60,0.09)',
                border: '1px solid rgba(226,14,60,0.25)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                fontSize: 13, color: '#E20E3C',
              }}>
                <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Email */}
              <div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 10, fontWeight: 700, color: '#555',
                  textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8,
                }}>
                  <i className="fa-solid fa-envelope" style={{ fontSize: 9 }} />
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="example@email.com"
                  autoComplete="email"
                  maxLength={255}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#222', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '12px 16px',
                    color: '#FCF2ED', fontSize: 13, outline: 'none',
                    fontFamily: 'inherit', direction: 'ltr',
                    transition: 'border-color 0.2s, background 0.2s',
                    textAlign: isAr ? 'right' : 'left',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(204,244,127,0.45)'; e.target.style.background = '#252525'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = '#222'; }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 10, fontWeight: 700, color: '#555',
                  textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8,
                }}>
                  <i className="fa-solid fa-lock" style={{ fontSize: 9 }} />
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={'text'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    maxLength={72}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: '#222', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, padding: '12px 44px 12px 16px',
                      color: '#FCF2ED', fontSize: 13, outline: 'none',
                      fontFamily: 'inherit', direction: 'ltr',
                      transition: 'border-color 0.2s, background 0.2s',
                      textAlign: isAr ? 'right' : 'left',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(204,244,127,0.45)'; e.target.style.background = '#252525'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = '#222'; }}
                  />
                  {/* <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                      insetInlineEnd: 14,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#555', fontSize: 13, padding: 4,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
                    onMouseLeave={e => e.currentTarget.style.color = '#555'}
                  >
                    <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button> */}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  padding: '13px', borderRadius: 13, border: 'none',
                  background: loading ? 'rgba(204,244,127,0.5)' : '#CCF47F',
                  color: '#000', fontSize: 14, fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(204,244,127,0.3)',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  letterSpacing: 0.3,
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#d8f98a'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(204,244,127,0.4)'; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#CCF47F'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(204,244,127,0.3)'; } }}
              >
                {loading
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginInlineEnd: 8 }} />{isAr ? 'جارٍ الدخول...' : 'Signing in...'}</>
                  : (isAr ? 'تسجيل الدخول' : 'Sign In')
                }
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: 11, color: '#444' }}>{isAr ? 'أو' : 'OR'}</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Register link */}
            <Link
              to="/register"
              style={{
                display: 'block', textAlign: 'center',
                padding: '12px', borderRadius: 13,
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#aaa', fontSize: 13, fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#FCF2ED'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#aaa'; }}
            >
              {isAr ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
              <span style={{ color: '#CCF47F', fontWeight: 700 }}>
                {isAr ? 'أنشئ حساباً' : 'Sign Up'}
              </span>
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: '#444', textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#888'}
            onMouseLeave={e => e.currentTarget.style.color = '#444'}
          >
            <i className={`fa-solid fa-arrow-${isAr ? 'right' : 'left'}`} style={{ fontSize: 10 }} />
            {isAr ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPageUsears;