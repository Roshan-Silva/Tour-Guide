import { v2 as cloudinary } from 'cloudinary';
export const cloudinaryEnabled = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (cloudinaryEnabled) cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
export const uploadBuffer = (buffer, folder = 'ceylon-explorer') => new Promise((resolve, reject) => cloudinary.uploader.upload_stream({ folder, resource_type: 'image', transformation: [{ width: 1800, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] }, (error, result) => error ? reject(error) : resolve(result)).end(buffer));
export const deleteCloudAsset = async (publicId) => { if (cloudinaryEnabled && publicId) await cloudinary.uploader.destroy(publicId); };
