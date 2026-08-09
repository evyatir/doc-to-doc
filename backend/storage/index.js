// Image storage provider interface. Routes call getStorage() and never a
// vendor SDK. Switching providers = set STORAGE_PROVIDER in .env + add one
// adapter file next to this one. Today "none" and "local" (disk) exist;
// pasted image URLs in the admin keep working regardless of provider.
//
// Contract every adapter must implement:
//   uploadImage(buffer, { filename, contentType }) -> Promise<{ url }>
//   deleteImage(url) -> Promise<void>
//   getUrl(id) -> string
import { local, IMAGE_TYPES } from './local.js';

export { IMAGE_TYPES };

function notConfigured() {
  const err = new Error('Storage not configured');
  err.status = 503;
  throw err;
}

const none = {
  uploadImage: notConfigured,
  deleteImage: notConfigured,
  getUrl: notConfigured,
};

export function getStorage() {
  const provider = (process.env.STORAGE_PROVIDER || 'none').toLowerCase();
  if (provider === 'none') return none;
  if (provider === 'local') return local;
  // 'cloudinary' and 's3' have env slots in .env.example but no adapter yet —
  // implement `./${provider}.js` here when a CDN provider is wanted.
  const err = new Error(`Storage provider "${provider}" not implemented`);
  err.status = 503;
  throw err;
}
