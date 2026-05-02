import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import logo from "../../public/Logo WAW.png";

const schema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .max(72, 'كلمة المرور طويلة جداً'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [roleError, setRoleError] = useState(false); // ← user tried to login as admin

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setRoleError(false);
    try {
      const user = await login(data.email.trim().toLowerCase(), data.password);

      // ✅ Role check — only admins allowed here
      if (user.role !== 'admin') {
        // logout the just-logged-in user so session isn't kept
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        localStorage.removeItem('waw_token');
        setRoleError(true);
        reset({ email: data.email, password: '' });
        return;
      }

      navigate('/admin');
    } catch (err) {
      setError('root', { message: err.message || 'بيانات غير صحيحة' });
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        backgroundImage: `
          radial-gradient(ellipse at 75% 20%, rgba(204,244,127,0.06) 0%, transparent 55%),
          radial-gradient(ellipse at 20% 80%, rgba(68,105,242,0.05) 0%, transparent 55%)
        `,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(204,244,127,0.1)',
            border: '1px solid rgba(204,244,127,0.18)',
            marginBottom: 14,
          }}>
            <i className="fa-solid fa-shield-halved" style={{ color: '#CCF47F', fontSize: 18 }} />
          </div>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <Link to="/">
              <img src={logo} alt="WAW" style={{ height: 44, margin: '0 auto' }} />
            </Link>
          </div>
          <p style={{ fontSize: 11, color: '#555', letterSpacing: 1 }}>
            ADMIN ACCESS ONLY — دخول الأدمن فقط
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 28px 70px rgba(0,0,0,0.5)',
        }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #CCF47F, #4469F2, #F7E328)' }} />

          <div style={{ padding: '28px 26px 26px' }}>

            {/* ── Role error — not an admin ── */}
            {roleError && (
              <div style={{
                background: 'rgba(247,227,40,0.08)',
                border: '1px solid rgba(247,227,40,0.3)',
                borderRadius: 12, padding: '14px 16px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: '#F7E328', fontSize: 15 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#F7E328' }}>
                    هذه الصفحة للمسؤولين فقط
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#999', margin: '0 0 12px 0', lineHeight: 1.6 }}>
                  البيانات التي أدخلتها تخص حساباً عادياً وليس حساب مسؤول.
                  إذا كنت تريد الدخول كمستخدم عادي، استخدم الصفحة المخصصة لذلك.
                </p>
                <Link
                  to="/login-usears"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 9,
                    background: 'rgba(247,227,40,0.12)',
                    border: '1px solid rgba(247,227,40,0.3)',
                    color: '#F7E328', fontSize: 12, fontWeight: 700,
                    textDecoration: 'none', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(247,227,40,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(247,227,40,0.12)'}
                >
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 10 }} />
                  انتقل لصفحة تسجيل دخول المستخدمين
                </Link>
              </div>
            )}

            {/* ── General error ── */}
            {errors.root && !roleError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(226,14,60,0.09)',
                border: '1px solid rgba(226,14,60,0.25)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                fontSize: 13, color: '#E20E3C',
              }}>
                <i className="fa-solid fa-circle-exclamation" style={{ flexShrink: 0 }} />
                {errors.root.message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 10, fontWeight: 700, color: '#555',
                  textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 7,
                }}>
                  <i className="fa-solid fa-envelope" style={{ fontSize: 9 }} />
                  البريد الإلكتروني
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@waw.com"
                  autoComplete="email"
                  dir="ltr"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#222',
                    border: `1px solid ${errors.email ? 'rgba(226,14,60,0.55)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 12, padding: '11px 14px',
                    color: '#FCF2ED', fontSize: 13, outline: 'none',
                    fontFamily: 'inherit', textAlign: 'right',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = errors.email ? 'rgba(226,14,60,0.65)' : 'rgba(204,244,127,0.45)'; e.target.style.background = '#252525'; }}
                  onBlur={e => { e.target.style.borderColor = errors.email ? 'rgba(226,14,60,0.55)' : 'rgba(255,255,255,0.1)'; e.target.style.background = '#222'; }}
                />
                {errors.email && (
                  <p style={{ fontSize: 11, color: '#E20E3C', marginTop: 5 }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginLeft: 4, fontSize: 9 }} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 22 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 10, fontWeight: 700, color: '#555',
                  textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 7,
                }}>
                  <i className="fa-solid fa-lock" style={{ fontSize: 9 }} />
                  كلمة المرور
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    {...register('password')}
                    type={'text'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    dir="ltr"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: '#222',
                      border: `1px solid ${errors.password ? 'rgba(226,14,60,0.55)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 12, padding: '11px 42px 11px 14px',
                      color: '#FCF2ED', fontSize: 13, outline: 'none',
                      fontFamily: 'inherit', textAlign: 'right',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = errors.password ? 'rgba(226,14,60,0.65)' : 'rgba(204,244,127,0.45)'; e.target.style.background = '#252525'; }}
                    onBlur={e => { e.target.style.borderColor = errors.password ? 'rgba(226,14,60,0.55)' : 'rgba(255,255,255,0.1)'; e.target.style.background = '#222'; }}
                  />
                  {/* <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                      left: 12, background: 'none', border: 'none',
                      cursor: 'pointer', color: '#555', padding: 4,
                      transition: 'color 0.15s', lineHeight: 1,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
                    onMouseLeave={e => e.currentTarget.style.color = '#555'}
                  >
                    <i className={`fa-solid ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: 13 }} />
                  </button> */}
                </div>
                {errors.password && (
                  <p style={{ fontSize: 11, color: '#E20E3C', marginTop: 5 }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginLeft: 4, fontSize: 9 }} />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%', padding: '13px', borderRadius: 13, border: 'none',
                  background: isSubmitting ? 'rgba(204,244,127,0.5)' : '#CCF47F',
                  color: '#000', fontSize: 14, fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: isSubmitting ? 'none' : '0 4px 20px rgba(204,244,127,0.25)',
                  transition: 'all 0.2s', fontFamily: 'inherit', letterSpacing: 0.3,
                }}
                onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.background = '#d8f98a'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(204,244,127,0.4)'; } }}
                onMouseLeave={e => { if (!isSubmitting) { e.currentTarget.style.background = '#CCF47F'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(204,244,127,0.25)'; } }}
              >
                {isSubmitting
                  ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginLeft: 8 }} />جارٍ التحقق...</>
                  : <><i className="fa-solid fa-shield-halved" style={{ marginLeft: 8, fontSize: 12 }} />دخول</>
                }
              </button>

            </form>

            {/* Footer note */}
            <p style={{ textAlign: 'center', fontSize: 11, color: '#333', marginTop: 20, lineHeight: 1.6 }}>
              هذه الصفحة مخصصة للمسؤولين فقط.{' '}
              <Link to="/login-usears" style={{ color: '#555', textDecoration: 'underline' }}>
                دخول المستخدمين العاديين
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;