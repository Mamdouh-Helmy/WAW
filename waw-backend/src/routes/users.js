import express from 'express';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { uploadAvatar, cloudinary } from '../middleware/upload.js';

const router = express.Router();

// GET /api/users
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip  = (page - 1) * limit;
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/:id
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/users/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    if (name)  user.name  = name;
    if (email) user.email = email;
    if (role && ['admin', 'user'].includes(role)) user.role = role;
    if (password && password.length >= 6) user.password = password;

    await user.save();
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'الإيميل مستخدم بالفعل' });
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/:id/avatar — رفع صورة شخصية
router.post('/:id/avatar', protect, adminOnly, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'لم يتم رفع صورة' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    // حذف الصورة القديمة
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
    }

    user.avatar         = req.file.path;
    user.avatarPublicId = req.file.filename;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/users/:id/avatar
router.delete('/:id/avatar', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
    }
    user.avatar = undefined;
    user.avatarPublicId = undefined;
    await user.save();
    res.json({ message: 'تم حذف الصورة' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/users/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
    }
    const user = await User.findById(req.params.id);
    if (user?.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف المستخدم' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;