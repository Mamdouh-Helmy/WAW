import express from 'express';
import FooterSettings from '../models/FooterSettings.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/footer — public
router.get('/', async (req, res) => {
  try {
    let settings = await FooterSettings.findOne();
    if (!settings) settings = await FooterSettings.create({ socialLinks: [], footerLinks: [] });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/footer — admin only
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let settings = await FooterSettings.findOne();
    if (!settings) {
      settings = await FooterSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;