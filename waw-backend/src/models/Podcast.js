import mongoose from 'mongoose';

const podcastSchema = new mongoose.Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String },
  },
  host:        { type: String, required: true },
  thumbnail:   { type: String },
  youtubeUrl:  { type: String },
  duration:    { type: String },
  episodeNum:  { type: Number },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Podcast', podcastSchema);