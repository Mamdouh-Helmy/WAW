import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:    process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// ─── Articles / Podcasts storage ─────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:           'waw-media',
    allowed_formats:  ['jpg', 'jpeg', 'png', 'webp'],
    transformation:   [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
  },
});

// ─── Avatars storage ──────────────────────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:           'waw-avatars',
    allowed_formats:  ['jpg', 'jpeg', 'png', 'webp'],
    transformation:   [
      { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' },
    ],
  },
});

export const upload       = multer({ storage });
export const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB max
export { cloudinary };