import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

// ── helpers ──────────────────────────────────────────────────────────────────
const emailRx    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRx     = /^[\p{L}\s'\-]{2,50}$/u;
const SAFE_EXTS  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitize = (str = '') => str.trim().replace(/\s+/g, ' ');

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', uploadAvatar.single('avatar'), async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // ── Field presence ────────────────────────────────────────────────────
    if (!name || !email || !password)
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });

    name  = sanitize(name);
    email = sanitize(email).toLowerCase();

    // ── Name validation ───────────────────────────────────────────────────
    if (!nameRx.test(name))
      return res.status(400).json({ message: 'الاسم يجب أن يحتوي على أحرف فقط (2-50 حرف)' });

    // ── Email validation ──────────────────────────────────────────────────
    if (!emailRx.test(email))
      return res.status(400).json({ message: 'صيغة البريد الإلكتروني غير صحيحة' });
    if (email.length > 255)
      return res.status(400).json({ message: 'البريد الإلكتروني طويل جداً' });

    // ── Password validation ───────────────────────────────────────────────
    if (typeof password !== 'string')
      return res.status(400).json({ message: 'كلمة مرور غير صالحة' });
    if (password.length < 6)
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    if (password.length > 72)
      return res.status(400).json({ message: 'كلمة المرور طويلة جداً' });

    // ── Avatar validation (if uploaded) ──────────────────────────────────
    if (req.file) {
      if (!SAFE_EXTS.includes(req.file.mimetype))
        return res.status(400).json({ message: 'نوع الصورة غير مسموح به' });
      if (req.file.size > 3 * 1024 * 1024)
        return res.status(400).json({ message: 'حجم الصورة يجب أن يكون أقل من 3MB' });
    }

    // ── Duplicate email ───────────────────────────────────────────────────
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'هذا البريد الإلكتروني مستخدم بالفعل' });

    // ── Create user (role always 'user' — never from body) ────────────────
    const user = await User.create({
      name,
      email,
      password,                          // hashed by mongoose pre-save hook
      role:   'user',                    // ← FORCED — ignore any role in body
      avatar: req.file?.path || undefined,
    });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'هذا البريد الإلكتروني مستخدم بالفعل' });
    console.error('Register error:', err);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    // ── Field presence ────────────────────────────────────────────────────
    if (!email || !password)
      return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });

    email = sanitize(email).toLowerCase();

    // ── Basic format check (don't reveal too much) ─────────────────────
    if (!emailRx.test(email) || typeof password !== 'string' || password.length > 72)
      return res.status(401).json({ message: 'بيانات غير صحيحة' });

    // ── Find user (include password for comparison) ───────────────────────
    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ message: 'بيانات غير صحيحة' }); // same message — no user enumeration

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch)
      return res.status(401).json({ message: 'بيانات غير صحيحة' });

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;