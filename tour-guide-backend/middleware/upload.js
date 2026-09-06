import multer from 'multer';
import path from 'path';
import { cloudinaryEnabled, uploadBuffer } from '../services/cloudinaryService.js';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
export const isAllowedImageType = (mimetype) => allowed.has(mimetype);
const fileFilter = (_req, file, cb) => isAllowedImageType(file.mimetype) ? cb(null, true) : cb(Object.assign(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), { status: 400 }), false);
const localStorage = multer.diskStorage({ destination: (_req, _file, cb) => cb(null, 'uploads/'), filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`) });
const parser = multer({ storage: cloudinaryEnabled ? multer.memoryStorage() : localStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
const upload = { single: (field) => [parser.single(field), async (req, _res, next) => { try { if (cloudinaryEnabled && req.file?.buffer) { const result = await uploadBuffer(req.file.buffer, `ceylon-explorer/${field}`); req.file.path = result.secure_url; req.file.public_id = result.public_id; } else if (req.file) { delete req.file.path; } next(); } catch (error) { next(Object.assign(new Error('Cloud image upload failed'), { status: 502, cause: error })); } }] };
export default upload;
