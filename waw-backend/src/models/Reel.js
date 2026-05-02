// models/Reel.js - تأكد إن title و description objects

import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String, default: "" },  // مش required عشان المتقدم
  },
  description: {
    ar: { type: String, default: "" },
    en: { type: String, default: "" },
  },
  thumbnail: { type: String },
  youtubeUrl: { type: String, required: true },
  views: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Reel', reelSchema);