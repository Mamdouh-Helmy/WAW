import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ── protect — verify JWT ─────────────────────────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'غير مصرح — يجب تسجيل الدخول أولاً' });

    const token = authHeader.split(' ')[1];
    if (!token)
      return res.status(401).json({ message: 'غير مصرح — التوكن مفقود' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError')
        return res.status(401).json({ message: 'انتهت صلاحية الجلسة — سجّل الدخول مجدداً' });
      return res.status(401).json({ message: 'توكن غير صالح' });
    }

    // Fetch fresh user data (so role/ban changes take immediate effect)
    const user = await User.findById(decoded.id).select('-password');
    if (!user)
      return res.status(401).json({ message: 'المستخدم غير موجود' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'خطأ في التحقق من الهوية' });
  }
};

// ── adminOnly — must be used AFTER protect ───────────────────────────────────
export const adminOnly = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: 'غير مصرح' });

  if (req.user.role !== 'admin')
    return res.status(403).json({
      message: 'ليس لديك صلاحية الوصول لهذه الصفحة',
      hint: 'هذا المسار مخصص للمسؤولين فقط',
    });

  next();
};

// ── userOnly — blocks admins from user-only endpoints (optional) ─────────────
export const userOnly = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: 'غير مصرح' });

  if (req.user.role === 'admin')
    return res.status(403).json({
      message: 'هذا المسار مخصص للمستخدمين العاديين فقط',
    });

  next();
};

// ── selfOrAdmin — user can only access their own data, admin can access all ──
export const selfOrAdmin = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: 'غير مصرح' });

  const isSelf  = req.user._id.toString() === req.params.id;
  const isAdmin = req.user.role === 'admin';

  if (!isSelf && !isAdmin)
    return res.status(403).json({ message: 'ليس لديك صلاحية الوصول لبيانات هذا المستخدم' });

  next();
};