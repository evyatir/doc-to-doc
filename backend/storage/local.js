// Local-disk provider: files land in backend/uploads/ (gitignored) and are
// served by express.static at /api/uploads/* (mounted in index.js). URLs are
// relative by default so the Vite dev proxy and same-origin deploys just work;
// set PUBLIC_BASE_URL for split-origin deploys (frontend CDN + separate API).
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const UPLOADS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads'
);

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

export const IMAGE_TYPES = Object.keys(EXT_BY_MIME);

const urlFor = (name) => `${process.env.PUBLIC_BASE_URL || ''}/api/uploads/${name}`;

export const local = {
  async uploadImage(buffer, { filename = '', contentType } = {}) {
    const ext = EXT_BY_MIME[contentType];
    if (!ext) {
      const err = new Error(`Unsupported image type "${contentType || 'unknown'}"`);
      err.status = 400;
      throw err;
    }
    // Sanitized original name kept for humans; timestamp + random hex makes the
    // filename unique and traversal-safe, so far-future caching is fine.
    const base = filename.replace(/\.[^.]*$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'img';
    const name = `${Date.now()}-${randomBytes(4).toString('hex')}-${base}${ext}`;
    await mkdir(UPLOADS_DIR, { recursive: true });
    await writeFile(path.join(UPLOADS_DIR, name), buffer);
    return { url: urlFor(name) };
  },

  async deleteImage(url) {
    const name = path.basename(new URL(url, 'http://local').pathname);
    await unlink(path.join(UPLOADS_DIR, name)).catch(() => {});
  },

  getUrl(id) {
    return urlFor(id);
  },
};
