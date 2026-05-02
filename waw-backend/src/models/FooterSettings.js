import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema({
  label: { type: String, required: true },       // e.g. "واتساب"
  icon:  { type: String, required: true },       // e.g. "fa-brands fa-whatsapp"
  url:   { type: String, required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

const footerLinkSchema = new mongoose.Schema({
  label:    { type: String, required: true },
  labelEn:  { type: String, default: '' },
  url:      { type: String, required: true },
  section:  { type: String, enum: ['explore', 'important'], default: 'explore' },
  order:    { type: Number, default: 0 },
  external: { type: Boolean, default: false },
  active:   { type: Boolean, default: true },
});

const footerSettingsSchema = new mongoose.Schema({
  socialLinks: [socialLinkSchema],
  footerLinks: [footerLinkSchema],
  description:   { type: String, default: '' },
  descriptionEn: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('FooterSettings', footerSettingsSchema);