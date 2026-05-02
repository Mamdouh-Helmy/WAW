import express from "express";
import Reel from "../models/Reel.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pickLang = (obj, lang) => {
  if (!obj) return "";
  if (lang === "en") return obj.en?.trim() || obj.ar || "";
  return obj.ar || "";
};

const formatReel = (reel, lang) => ({
  _id: reel._id,
  title: pickLang(reel.title, lang) || "Untitled",
  description: pickLang(reel.description, lang),
  thumbnail: reel.thumbnail || null,
  youtubeUrl: reel.youtubeUrl || null,
  views: reel.views || 0,
  publishedAt: reel.publishedAt || null,
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────
// ⚠️ يجب أن تيجي Admin routes قبل /:id عشان Express ميعاملش "admin" كـ id

// GET /reels/admin/all
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reels, total] = await Promise.all([
      Reel.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Reel.countDocuments(),
    ]);

    res.json({ reels, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /reels/admin/single/:id
router.get("/admin/single/:id", protect, adminOnly, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: "Reel not found" });
    res.json(reel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /reels?lang=ar&page=1&limit=12
router.get("/", async (req, res) => {
  try {
    const { lang = "ar", page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reels, total] = await Promise.all([
      Reel.find({ isPublished: true })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Reel.countDocuments({ isPublished: true }),
    ]);

    res.json({
      reels: reels.map((r) => formatReel(r, lang)),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /reels/:id?lang=ar
router.get("/:id", async (req, res) => {
  try {
    const { lang = "ar" } = req.query;

    const reel = await Reel.findOneAndUpdate(
      { _id: req.params.id, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!reel) return res.status(404).json({ message: "Reel not found" });

    res.json(formatReel(reel, lang));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /reels
router.post("/", protect, adminOnly, upload.fields([{ name: "thumbnail", maxCount: 1 }]), async (req, res) => {
  try {
    const { titleAr, titleEn, descAr, descEn, youtubeUrl } = req.body;

    const reel = await Reel.create({
      title: { ar: titleAr, en: titleEn || "" },
      description: { ar: descAr || "", en: descEn || "" },
      thumbnail: req.files?.thumbnail?.[0]?.path || null,
      youtubeUrl,
      isPublished: false,
      publishedAt: null,
    });

    res.status(201).json(reel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /reels/:id
router.put("/:id", protect, adminOnly, upload.fields([{ name: "thumbnail", maxCount: 1 }]), async (req, res) => {
  try {
    const { titleAr, titleEn, descAr, descEn, youtubeUrl, isPublished } = req.body;
    const isPublishedBool = isPublished === "true";

    const existing = await Reel.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Reel not found" });

    const update = {
      title: { ar: titleAr, en: titleEn || "" },
      description: { ar: descAr || "", en: descEn || "" },
      youtubeUrl,
      isPublished: isPublishedBool,
      publishedAt: isPublishedBool ? existing.publishedAt || new Date() : existing.publishedAt,
    };

    if (req.files?.thumbnail?.[0]) update.thumbnail = req.files.thumbnail[0].path;

    const reel = await Reel.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(reel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /reels/:id
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Reel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;