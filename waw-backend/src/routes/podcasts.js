import express from 'express';
import Podcast from '../models/Podcast.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET /api/podcasts — public (published only)
router.get('/', async (req, res) => {
  try {
    const { lang = 'ar' } = req.query;
    const podcasts = await Podcast.find({ isPublished: true })
      .sort({ episodeNum: -1 })
      .limit(8);

    res.json(podcasts.map(p => ({
      _id:        p._id,
      title:      p.title[lang] || p.title.ar,
      host:       p.host,
      thumbnail:  p.thumbnail,
      youtubeUrl: p.youtubeUrl,
      duration:   p.duration,
      episodeNum: p.episodeNum,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/podcasts/admin/all — admin (all episodes)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const podcasts = await Podcast.find().sort({ episodeNum: -1 });
    res.json(podcasts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/podcasts/:id — public
router.get('/:id', async (req, res) => {
  try {
    const { lang = 'ar' } = req.query;
    const p = await Podcast.findById(req.params.id);
    if (!p || !p.isPublished) return res.status(404).json({ message: 'غير موجود' });
    res.json({
      _id: p._id, title: p.title[lang] || p.title.ar,
      host: p.host, thumbnail: p.thumbnail,
      youtubeUrl: p.youtubeUrl, duration: p.duration, episodeNum: p.episodeNum,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/podcasts
router.post('/', protect, adminOnly, upload.single('thumbnail'), async (req, res) => {
  try {
    const { titleAr, titleEn, host, youtubeUrl, duration, episodeNum, isPublished } = req.body;
    const podcast = await Podcast.create({
      title:       { ar: titleAr, en: titleEn },
      host,
      youtubeUrl,
      duration,
      episodeNum:  Number(episodeNum) || undefined,
      thumbnail:   req.file?.path,
      isPublished: isPublished === 'true',
    });
    res.status(201).json(podcast);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/podcasts/:id
router.put('/:id', protect, adminOnly, upload.single('thumbnail'), async (req, res) => {
  try {
    const { titleAr, titleEn, host, youtubeUrl, duration, episodeNum, isPublished } = req.body;

    const update = {
      title:      { ar: titleAr, en: titleEn },
      host,
      youtubeUrl,
      duration,
      episodeNum: Number(episodeNum) || undefined,
    };

    if (isPublished !== undefined) update.isPublished = isPublished === 'true';
    if (req.file?.path) update.thumbnail = req.file.path;

    const podcast = await Podcast.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!podcast) return res.status(404).json({ message: 'الحلقة غير موجودة' });
    res.json(podcast);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/podcasts/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Podcast.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;