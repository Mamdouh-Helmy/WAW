import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String },
  },
  content: {
    ar: { type: String },
    en: { type: String },
  },
  thumbnail:   { type: String },
  images:      [{ type: String }],
  youtubeUrl:  { type: String },
  type:        { type: String, enum: ['article', 'video', 'images'], default: 'article' },
  category:    {
    type: String,
    enum: ['tech', 'horizons', 'social', 'podcast', 'home', 'documentary'],
    default: 'home',
  },
  // ── جديد: نوع الفيلم التسجيلي ──────────────────────────────
  documentaryType: {
    type: String,
    enum: ['documentary', 'feature'],
    default: 'documentary',
  },
  // ────────────────────────────────────────────────────────────
  tags: {
    ar: [{ type: String }],
    en: [{ type: String }],
  },
  author:      { type: String },
  views:       { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
}, { timestamps: true });

articleSchema.index({ category: 1, isPublished: 1, publishedAt: -1 });
articleSchema.index({ views: -1 });
articleSchema.index({ 'tags.ar': 1, isPublished: 1 });
articleSchema.index({ 'tags.en': 1, isPublished: 1 });

export default mongoose.model('Article', articleSchema);