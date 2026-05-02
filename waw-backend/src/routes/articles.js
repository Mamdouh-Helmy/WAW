import express from "express";
import Article from "../models/Article.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// ─── Public Routes ───────────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const { category, tag, lang = "ar", page = 1, limit = 9 } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (tag) filter[`tags.${lang}`] = tag;

    const skip  = (page - 1) * limit;
    const total = await Article.countDocuments(filter);
    const articles = await Article.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select(`title.${lang} excerpt.${lang} showName thumbnail type category tags views publishedAt author youtubeUrl episodeCount documentaryType`);

    const normalized = articles.map((a) => ({
      _id:             a._id,
      title:           a.title[lang] || a.title.ar,
      excerpt:         a.excerpt?.[lang] || a.excerpt?.ar || "",
      showName:        a.showName || "",
      thumbnail:       a.thumbnail,
      youtubeUrl:      a.youtubeUrl || null,
      type:            a.type,
      category:        a.category,
      documentaryType: a.documentaryType || "documentary",
      tags:            a.tags?.[lang] || a.tags?.ar || [],
      views:           a.views,
      publishedAt:     a.publishedAt,
      author:          a.author,
      episodeCount:    a.episodeCount || null,
    }));

    res.json({
      articles: normalized,
      total,
      page:  Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/most-read", async (req, res) => {
  try {
    const { lang = "ar" } = req.query;
    const articles = await Article.find({ isPublished: true })
      .sort({ views: -1 })
      .limit(4)
      .select(`title.${lang} thumbnail category views youtubeUrl type`);

    res.json(
      articles.map((a) => ({
        _id:        a._id,
        title:      a.title[lang] || a.title.ar,
        thumbnail:  a.thumbnail,
        category:   a.category,
        views:      a.views,
        youtubeUrl: a.youtubeUrl || null,
        type:       a.type,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/tags", async (req, res) => {
  try {
    const { lang = "ar" } = req.query;
    const field  = `tags.${lang}`;
    const result = await Article.aggregate([
      { $match: { isPublished: true } },
      { $unwind: `$${field}` },
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
      { $project: { tag: "$_id", count: 1, _id: 0 } },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q = "", lang = "ar" } = req.query;
    if (!q.trim()) return res.json([]);

    const articles = await Article.find({
      isPublished: true,
      $or: [
        { [`title.${lang}`]: { $regex: q, $options: "i" } },
        { "title.ar":        { $regex: q, $options: "i" } },
        { [`tags.${lang}`]:  { $regex: q, $options: "i" } },
      ],
    })
      .limit(6)
      .select(`title.${lang} thumbnail category`);

    res.json(
      articles.map((a) => ({
        _id:       a._id,
        title:     a.title[lang] || a.title.ar,
        thumbnail: a.thumbnail,
        category:  a.category,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Admin Routes — قبل /:id ─────────────────────────────

router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (tag)      filter["tags.ar"] = tag;

    const skip  = (page - 1) * limit;
    const total = await Article.countDocuments(filter);
    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      articles,
      total,
      page:  Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin/single/:id", protect, adminOnly, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "غير موجود" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images",    maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        titleAr, titleEn,
        contentAr, contentEn,
        excerptAr, excerptEn,
        showName,
        youtubeUrl,
        type, category,
        author,
        tagsAr, tagsEn,
        documentaryType,
        episodeCount,
      } = req.body;

      const article = await Article.create({
        title:   { ar: titleAr, en: titleEn },
        content: { ar: contentAr || "", en: contentEn || "" },
        excerpt: { ar: excerptAr || "", en: excerptEn || "" },
        showName:        showName        || "",
        thumbnail:       req.files?.thumbnail?.[0]?.path,
        images:          req.files?.images?.map((f) => f.path) || [],
        youtubeUrl,
        type:            type            || "article",
        category:        category        || "home",
        documentaryType: documentaryType || "documentary",
        episodeCount:    episodeCount    ? Number(episodeCount) : null,
        tags: {
          ar: tagsAr ? tagsAr.split(",").map((t) => t.trim()).filter(Boolean) : [],
          en: tagsEn ? tagsEn.split(",").map((t) => t.trim()).filter(Boolean) : [],
        },
        author,
        isPublished: false,
      });

      res.status(201).json(article);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images",    maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        titleAr, titleEn,
        contentAr, contentEn,
        excerptAr, excerptEn,
        showName,
        youtubeUrl,
        type, category,
        author,
        isPublished,
        tagsAr, tagsEn,
        documentaryType,
        episodeCount,
      } = req.body;

      const isPublishedBool = isPublished === "true";

      const existing = await Article.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: "غير موجود" });

      const update = {
        title:   { ar: titleAr,    en: titleEn },
        content: { ar: contentAr || "", en: contentEn || "" },
        excerpt: { ar: excerptAr || "", en: excerptEn || "" },
        showName:        showName        || "",
        youtubeUrl,
        type,
        category,
        author,
        documentaryType: documentaryType || existing.documentaryType,
        episodeCount:    episodeCount    ? Number(episodeCount) : existing.episodeCount,
        isPublished:     isPublishedBool,
        tags: {
          ar: tagsAr ? tagsAr.split(",").map((t) => t.trim()).filter(Boolean) : [],
          en: tagsEn ? tagsEn.split(",").map((t) => t.trim()).filter(Boolean) : [],
        },
        publishedAt: isPublishedBool
          ? existing.publishedAt || new Date()
          : existing.publishedAt,
      };

      if (req.files?.thumbnail?.[0]) update.thumbnail = req.files.thumbnail[0].path;
      if (req.files?.images?.length)  update.images    = req.files.images.map((f) => f.path);

      const article = await Article.findByIdAndUpdate(req.params.id, update, { new: true });
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "تم الحذف" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── /:id الأخير دايماً ──────────────────────────────────

router.get("/:id", async (req, res) => {
  try {
    const { lang = "ar" } = req.query;
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!article || !article.isPublished)
      return res.status(404).json({ message: "غير موجود" });

    res.json({
      _id:             article._id,
      title:           article.title[lang]     || article.title.ar,
      content:         article.content?.[lang] || article.content?.ar  || "",
      excerpt:         article.excerpt?.[lang] || article.excerpt?.ar  || "",
      showName:        article.showName        || "",
      thumbnail:       article.thumbnail,
      images:          article.images,
      youtubeUrl:      article.youtubeUrl,
      type:            article.type,
      category:        article.category,
      documentaryType: article.documentaryType || "documentary",
      episodeCount:    article.episodeCount    || null,
      tags:            article.tags?.[lang]    || article.tags?.ar || [],
      author:          article.author,
      views:           article.views,
      publishedAt:     article.publishedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;